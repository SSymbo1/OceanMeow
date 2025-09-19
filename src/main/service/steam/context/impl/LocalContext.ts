import { SteamContext } from '@/main/service/steam/context/SteamContext';
import { SystemRegedit } from '@/main/util/SystemRegedit';
import { HKLM } from 'winreg';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// 这个也只支持windows平台后续需要扩展跨平台
export class LocalContext implements SteamContext {
  private readonly steamRegeditPath = {
    hive: HKLM,
    keyPath: '\\Software\\Wow6432Node\\Valve\\Steam',
    valueName: 'InstallPath',
  };
  private readonly steamValidateFile = {
    exe: 'steam.exe',
    client: 'steamclient.dll',
    dll: 'tier0_s.dll',
  };

  /**
   * 获取Steam安装路径
   * 该方法通过读取Windows注册表来获取Steam的安装路径
   * @returns {Promise<string | null>} 返回一个Promise对象，解析后为Steam安装路径字符串或null（如果未找到）
   * @example
   * const steamPath = await regGetSteamInstallPath();
   * if (steamPath) {
   *   console.log(`Steam安装路径: ${steamPath}`);
   * } else {
   *   console.log('未找到Steam安装路径');
   * }
   */
  regGetSteamInstallPath(): Promise<string | null> {
    return SystemRegedit.getRegValue(
      this.steamRegeditPath.hive,
      this.steamRegeditPath.keyPath,
      this.steamRegeditPath.valueName
    );
  }

  /**
   * 验证Steam安装路径的有效性
   * @param {string} steamPath - Steam安装路径
   * @returns {boolean} - 返回验证结果，true表示路径有效，false表示无效
   * @description 该方法执行以下验证步骤：
   * 1. 检查所有必需的Steam文件是否存在
   * 2. 验证这些文件的数字签名是否有效
   * 验证过程：
   * - 首先检查Steam安装路径下是否存在所有必需的文件
   * - 然后使用PowerShell命令验证每个文件的数字签名状态
   * - 如果任何文件不存在或签名无效，返回false
   * - 所有验证通过后返回true
   */
  validateSteamInstallPath(steamPath: string): boolean {
    for (const file of Object.values(this.steamValidateFile)) {
      const full = path.join(steamPath, file);
      if (!fs.existsSync(full)) return false;
    }
    try {
      for (const file of Object.values(this.steamValidateFile)) {
        const full = path.join(steamPath, file);
        const ps = execSync(
          `powershell -NoProfile -Command "Get-AuthenticodeSignature -LiteralPath '${full}' | Select-Object -ExpandProperty Status"`,
          { encoding: 'utf8', stdio: 'pipe' }
        ).trim();
        if (ps !== 'Valid') return false;
      }
    } catch {
      return false;
    }
    return true;
  }
}
