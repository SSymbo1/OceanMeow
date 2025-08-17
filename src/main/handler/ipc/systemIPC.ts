import { ipcMain, dialog, shell } from 'electron';
import { logger } from '@/main/util/Logger';
import { ScreenshotBackup } from '@/main/service/system/backup/impl/ScreenshotBackup';
import { ApplicationGlobalConfig } from '@/main/service/system/config/impl/ApplicationGlobalConfig';

const screenshotBackup = new ScreenshotBackup();
const applicationGlobalConfig = new ApplicationGlobalConfig();

export function systemIPC() {
  ipcMain.handle('selector:folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: '请选择位置',
    });
    return result.canceled ? null : result.filePaths[0];
  });
  ipcMain.handle('shortcut:steam', async (event, shortcutPath) => {
    try {
      const { target } = shell.readShortcutLink(shortcutPath);
      return target || null;
    } catch (e) {
      logger.error('read lnc error:', e);
      return null;
    }
  });
  ipcMain.handle('dump:screenshot-single', async (event, steamPath, dumpConfig, files) => {
    return await screenshotBackup.dump(steamPath, dumpConfig, files);
  });
  ipcMain.handle('config:screenshot-single', async (event, appID, steamID) => {
    return await screenshotBackup.config(appID, steamID);
  });
  ipcMain.handle('config:read-application', async (event, key) => {
    return await applicationGlobalConfig.read(key);
  });
  ipcMain.handle('config:write-application', async (event, config) => {
    await applicationGlobalConfig.write(config);
  });
}
