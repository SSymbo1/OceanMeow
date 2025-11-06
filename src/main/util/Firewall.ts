import { dialog, app } from 'electron';
import { execSync, spawn } from 'child_process';
import { logger } from './Logger';
import { ApplicationResource } from '@/type/enum/Resource';
import { CommonMessage, ExchangeMessage, ExceptionMessage } from '@/type/enum/Message';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';
import path from 'node:path';

// 这个防火墙添加端口策略只对Windows平台有效,需要后续扩展到其他平台
export class Firewall {
  private static port: number;

  /**
   * 检查并确保防火墙规则已设置
   */
  public static async ensureRule(): Promise<void> {
    try {
      // 读取配置获取端口
      const applicationConfigHolder = new ApplicationConfigHolder();
      const config = await applicationConfigHolder.read('share');
      this.port = config.port;
      // 检查规则是否已存在
      if (this.isRuleActive()) {
        logger.info(
          CommonMessage.FIREWALL_RULE_EXIST.replace(
            '{rule}',
            ApplicationResource.FIREWALL_RULE.replace('{port}', this.port.toString())
          )
        );
        return;
      }
      // 检查当前是否已有管理员权限
      if (this.isAdmin()) {
        // 直接添加规则
        this.addRule();
        logger.info(
          CommonMessage.FIREWALL_RULE_CREATE.replace(
            '{rule}',
            ApplicationResource.FIREWALL_RULE.replace('{port}', this.port.toString())
          )
        );
        return;
      }
      // 请求用户授权
      const { response } = await dialog.showMessageBox({
        type: 'question',
        buttons: [ExchangeMessage.CONFIRM, ExchangeMessage.CANCEL],
        defaultId: 0,
        title: ExchangeMessage.ASK_FIREWALL_PERMISSION_TITLE,
        message: ExchangeMessage.ASK_FIREWALL_PERMISSION_MESSAGE,
        detail: ExchangeMessage.ASK_FIREWALL_PERMISSION_DETAIL.replace(
          '{port}',
          this.port.toString()
        ),
      });
      if (response === 0) {
        // 用户同意，尝试提权添加规则
        await this.requestAdminAndAddRule();
      } else {
        // 用户取消，显示警告
        await dialog.showMessageBox({
          type: 'warning',
          message: ExchangeMessage.ASK_FIREWALL_PERMISSION_DENIED,
        });
      }
    } catch (error) {
      logger.error(ExceptionMessage.FIREWALL_ADD_EXCEPTION, error);
    }
  }

  /**
   * 检查防火墙规则是否已存在且启用
   */
  private static isRuleActive(): boolean {
    try {
      const command = `netsh advfirewall firewall show rule name="${ApplicationResource.FIREWALL_RULE.replace('{port}', this.port.toString())}"`;
      execSync(command, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查当前是否具有管理员权限
   */
  private static isAdmin(): boolean {
    try {
      execSync('net session >nul 2>&1');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 添加防火墙规则（需管理员权限）
   */
  private static addRule(): void {
    const command = `netsh advfirewall firewall add rule name="${ApplicationResource.FIREWALL_RULE.replace('{port}', this.port.toString())}" dir=in action=allow protocol=TCP localport=${this.port}`;
    execSync(command);
  }

  /**
   * 请求管理员权限并添加规则
   */
  private static async requestAdminAndAddRule(): Promise<void> {
    return new Promise((resolve) => {
      try {
        let executablePath: string;
        let args: string[];
        if (app.isPackaged) {
          // 生产环境：直接启动打包后的 exe
          executablePath = process.execPath;
          args = ['--add-firewall-rule'];
        } else {
          // 开发环境：启动 electron.exe 并指定 main.js
          executablePath = process.execPath; // electron.exe 路径
          const mainScript = path.join(__dirname, '../dist-electron/main.js');
          args = [mainScript, '--add-firewall-rule'];
        }
        // 使用 shell 和 runas 请求管理员权限
        spawn(
          'powershell.exe',
          [
            '-Command',
            `Start-Process "${executablePath}" -ArgumentList '${args.join("','")}' -Verb runas -Wait`,
          ],
          {
            detached: true,
            stdio: 'ignore',
            shell: true,
            windowsHide: true,
          }
        ).unref();
        resolve();
      } catch (error) {
        logger.error(ExceptionMessage.PERMISSION_REQUEST_FAIL, error);
        dialog.showErrorBox(
          ExchangeMessage.PERMISSION_REQUEST_FAIL,
          ExchangeMessage.PERMISSION_REQUEST_FAIL_DETAIL
        );
        resolve();
      }
    });
  }

  /**
   * 处理命令行参数（用于提权后的操作）
   */
  public static handleCommandLineArgs(): boolean {
    const args = process.argv;
    // 检查是否带有特定参数
    if (args.includes('--add-firewall-rule')) {
      // 尝试添加规则
      try {
        // 这里需要重新读取配置，因为这是在新进程中
        const applicationConfigHolder = new ApplicationConfigHolder();
        applicationConfigHolder.read('share').then((config) => {
          this.port = config.port;
          this.addRule();
          app.quit();
        });
      } catch (error) {
        logger.error(ExceptionMessage.FIREWALL_ADD_EXCEPTION, error);
        dialog.showErrorBox(ExchangeMessage.SET_FAIL, ExchangeMessage.ADD_FIREWALL_RULE_FAIL);
      }
      return true;
    }
    return false;
  }
}
