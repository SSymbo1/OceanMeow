import { FileLocator } from '@/main/service/system/folder/FileLocator';
import { logger } from '@/main/util/Logger';
import { ExceptionMessage, ExchangeMessage } from '@/type/enum/Message';
import { dialog, shell } from 'electron';
import fs from 'fs';

export class WinFileLocator implements FileLocator {
  /**
   * 定位并显示指定文件在文件系统中的位置
   * @param {string} filePath - 需要定位的文件的完整路径
   * @returns {void}
   * @example
   * // 示例用法
   * locateFile('C:\\example\\file.txt');
   * @remarks
   * - 如果文件不存在，将记录错误日志并返回
   * - 使用系统默认文件管理器定位并显示文件
   */
  locateFile(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      logger.error(ExceptionMessage.FILE_NOT_EXIST_EXCEPTION.replace('{file}', filePath));
      return;
    }
    shell.showItemInFolder(filePath);
  }

  /**
   * 打开文件夹选择对话框，允许用户选择一个目录
   * @returns {Promise<Electron.OpenDialogReturnValue>} 返回一个Promise，解析为Electron的打开对话框返回值
   * @example
   * const result = await folderSelectror();
   * console.log(result.filePaths); // 输出用户选择的文件夹路径
   *
   * 该方法使用Electron的dialog.showOpenDialog API
   * 配置了只允许选择目录（'openDirectory'属性）
   * 使用了ExchangeMessage中的SELECT_LOCATION作为对话框标题
   */
  async folderSelectror(): Promise<Electron.OpenDialogReturnValue> {
    return await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: ExchangeMessage.SELECT_LOCATION,
    });
  }

  /**
   * 打开文件选择对话框，让用户选择一个或多个文件
   * @param {string} type - 文件类型名称，用于在对话框中显示
   * @param {string[]} filter - 文件扩展名数组，用于过滤可选择的文件
   * @returns {Promise<Electron.OpenDialogReturnValue>} 返回一个Promise，解析为对话框的返回值
   * @example
   * // 示例：选择一个图片文件
   * const result = await fileSelector('图片', ['jpg', 'png', 'gif']);
   * if (!result.canceled) {
   *   console.log('选择的文件：', result.filePaths);
   * }
   */
  async fileSelector(type: string, filter: string[]): Promise<Electron.OpenDialogReturnValue> {
    return await dialog.showOpenDialog({
      title: ExchangeMessage.SELECT_FILE,
      properties: ['openFile'],
      filters: [{ name: type, extensions: [...filter] }],
    });
  }

  /**
   * 解析快捷方式(.lnk)文件并返回目标路径
   * @param {string} path - 快捷方式文件的完整路径
   * @returns {string | null} 成功时返回目标路径字符串，失败时返回null
   * @example
   * // 示例用法:
   * const targetPath = shortcutParser('C:\\path\\to\\shortcut.lnk');
   * if (targetPath) {
   *   console.log('目标路径:', targetPath);
   * } else {
   *   console.log('解析快捷方式失败');
   * }
   */
  shortcutParser(path: string): string | null {
    try {
      const { target } = shell.readShortcutLink(path);
      return target || null;
    } catch (e) {
      logger.error(ExceptionMessage.INC_EXCEPTION, e);
      return null;
    }
  }
}
