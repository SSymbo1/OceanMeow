import { ipcMain, app, nativeTheme, shell } from 'electron';
import { ScreenshotBackup } from '@/main/service/system/backup/impl/ScreenshotBackup';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';
import { WinFileLocator } from '@/main/service/system/folder/impl/WinFileLocator';
import { SystemBackgroundCache } from '@/main/service/system/cache/impl/SystemBackgroundCache';
import { mainWindow } from '@/main/modal/mainWindow';

const folderLocator = new WinFileLocator();
const screenshotBackup = new ScreenshotBackup();
const applicationConfigHolder = new ApplicationConfigHolder();
const systemBackgroundCache = new SystemBackgroundCache();

export function systemIPC() {
  ipcMain.handle('selector:folder', async () => {
    const res = await folderLocator.folderSelector();
    return res.canceled ? null : res.filePaths[0];
  });
  ipcMain.handle('selector:file', async (_, type, filter) => {
    const res = await folderLocator.fileSelector(type, filter);
    return res.canceled ? null : res.filePaths[0];
  });
  ipcMain.handle('shortcut:steam', async (_, shortcutPath) => {
    return folderLocator.shortcutParser(shortcutPath);
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
  ipcMain.handle('system:env', () => {
    return { local: app.getLocale(), theme: nativeTheme.shouldUseDarkColors };
  });
  ipcMain.handle('cache:background-read', async () => {
    return await systemBackgroundCache.readApplicationCacheFiles();
  });
  ipcMain.handle('cache:background-write', async (_, cache) => {
    return await systemBackgroundCache.writeApplicationCacheFiles(cache);
  });
  ipcMain.handle('browser:open', (_, url) => {
    shell.openExternal(url);
  });
  ipcMain.handle('window:route', (_, path) => {
    mainWindow?.show();
    mainWindow?.focus();
    mainWindow?.webContents.send('window:route-listener', path);
  });
}
