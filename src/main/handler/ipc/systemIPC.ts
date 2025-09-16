import { ipcMain, dialog, shell } from 'electron';
import { logger } from '@/main/util/Logger';
import { ScreenshotBackup } from '@/main/service/system/backup/impl/ScreenshotBackup';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';
import { ExchangeMessage, ExceptionMessage } from '@/type/enum/Message';

const screenshotBackup = new ScreenshotBackup();
const applicationConfigHolder = new ApplicationConfigHolder();

export function systemIPC() {
  ipcMain.handle('selector:folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: ExchangeMessage.SELECT_LOCATION,
    });
    return result.canceled ? null : result.filePaths[0];
  });
  ipcMain.handle('selector:file', async (_, type, filter) => {
    const result = await dialog.showOpenDialog({
      title: ExchangeMessage.SELECT_FILE,
      properties: ['openFile'],
      filters: [{ name: type, extensions: [...filter] }],
    });
    return result.canceled ? null : result.filePaths[0];
  });
  ipcMain.handle('shortcut:steam', async (_, shortcutPath) => {
    try {
      const { target } = shell.readShortcutLink(shortcutPath);
      return target || null;
    } catch (e) {
      logger.error(ExceptionMessage.INC_EXCEPTION, e);
      return null;
    }
  });
  ipcMain.handle('dump:screenshot-single', async (_, steamPath, dumpConfig, files) => {
    return await screenshotBackup.dump(steamPath, dumpConfig, files);
  });
  ipcMain.handle('config:screenshot-single', async (_, appID, steamID) => {
    return await screenshotBackup.config(appID, steamID);
  });
  ipcMain.handle('config:read-application', async (_, key) => {
    return await applicationConfigHolder.read(key);
  });
  ipcMain.handle('config:write-application-custom', (_, config) => {
    applicationConfigHolder.write(config);
  });
}
