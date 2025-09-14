import { ipcMain } from 'electron';
import { LocalContext } from '@/main/service/steam/context/impl/LocalContext';
import { LibrarySelector } from '@/main/service/steam/selector/impl/LibrarySelector';
import { ScreenshotSelector } from '@/main/service/steam/selector/impl/ScreenshotSelector';
import { AccountCollector } from '@/main/service/steam/collector/impl/AccountCollector';
import { LibraryCollector } from '@/main/service/steam/collector/impl/LibraryCollector';
import { ScreenshotCollector } from '@/main/service/steam/collector/impl/ScreenshotCollector';
import { ScreenshotShareLink } from '@/main/service/steam/share/impl/ScreenshotShareLink';

const localContext = new LocalContext();
const librarySelector = new LibrarySelector();
const screenshotSelector = new ScreenshotSelector();
const accountCollector = new AccountCollector();
const libraryCollector = new LibraryCollector();
const screenshotCollector = new ScreenshotCollector();
const screenshotShareLink = new ScreenshotShareLink();

export function steamIPC() {
  ipcMain.handle('steam:validate', (_, steamPath) => {
    return localContext.validateSteamInstallPath(steamPath);
  });
  ipcMain.handle('share:steam-screenshot', (_, shareData) => {
    return screenshotShareLink.shareLinkGenerator(shareData);
  });
  ipcMain.handle('collect:account', async (_, steamPath) => {
    return await accountCollector.collect(steamPath);
  });
  ipcMain.handle('collect:library', async (_, steamPath) => {
    return await libraryCollector.collect(steamPath);
  });
  ipcMain.handle('collect:screenshot', async (_, steamPath) => {
    return await screenshotCollector.collect(steamPath);
  });
  ipcMain.handle('query:library', async (_, account, keyword) => {
    return await librarySelector.search(account, keyword);
  });
  ipcMain.handle('query:screenshot', async (_, account, appID, keyword) => {
    return await screenshotSelector.search(account, appID, keyword);
  });
}
