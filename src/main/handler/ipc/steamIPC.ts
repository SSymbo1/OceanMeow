import { ipcMain } from 'electron';
import { LocalContext } from '@/main/service/steam/context/impl/LocalContext';
import { LibrarySelector } from '@/main/service/steam/selector/impl/LibrarySelector';
import { ScreenshotSelector } from '@/main/service/steam/selector/impl/ScreenshotSelector';
import { AccountCollector } from '@/main/service/steam/collector/impl/AccountCollector';
import { LibraryCollector } from '@/main/service/steam/collector/impl/LibraryCollector';
import { ScreenshotCollector } from '@/main/service/steam/collector/impl/ScreenshotCollector';

const localContext = new LocalContext();
const librarySelector = new LibrarySelector();
const screenshotSelector = new ScreenshotSelector();
const accountCollector = new AccountCollector();
const libraryCollector = new LibraryCollector();
const screenshotCollector = new ScreenshotCollector();

export function steamIPC() {
  ipcMain.handle('steam:validate', (event, steamPath) => {
    return localContext.validateSteamInstallPath(steamPath);
  });
  ipcMain.handle('collect:account', async (event, steamPath) => {
    return await accountCollector.collect(steamPath);
  });
  ipcMain.handle('collect:library', async (event, steamPath) => {
    return await libraryCollector.collect(steamPath);
  });
  ipcMain.handle('collect:scheenshot', async (event, steamPath) => {
    return await screenshotCollector.collect(steamPath);
  });
  ipcMain.handle('query:library', async (event, account, keyword) => {
    return await librarySelector.search(account, keyword);
  });
  ipcMain.handle('query:screenshot', async (event, account, appID, keyword) => {
    return await screenshotSelector.search(account, appID, keyword);
  });
}
