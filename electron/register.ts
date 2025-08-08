import { ipcMain, dialog, shell, protocol, net, BrowserWindow } from 'electron';
import { pathToFileURL } from 'url';
import { SystemIO } from '#/util/SystemIO';
import { logger } from '#/util/Logger';
import { AccountCollector } from '#/service/steam/collector/impl/AccountCollector';
import { LibraryCollector } from '#/service/steam/collector/impl/LibraryCollector';
import { ScreenshotCollector } from '#/service/steam/collector/impl/ScreenshotCollector';
import { LocalContext } from '#/service/steam/context/impl/LocalContext';
import { LibrarySelector } from '#/service/steam/selector/impl/LibrarySelector';
import { ScreenshortSelector } from '#/service/steam/selector/impl/ScreenshortSelector';

const accountCollector = new AccountCollector();
const libraryCollector = new LibraryCollector();
const screenshotCollector = new ScreenshotCollector();
const localContext = new LocalContext();
const librarySelector = new LibrarySelector();
const screenshortSelector = new ScreenshortSelector();

export function protocolRegister() {
    protocol.handle('load', (request) => {
        const rawPath = request.url.replace(/^load:\/\//, '')
        const decodedPath = decodeURIComponent(rawPath)
        const fixedPath = decodedPath.replace(/^([A-Za-z])\//, '$1:/')
        const fileUrl = pathToFileURL(fixedPath).toString()
        return net.fetch(fileUrl)
    });
}

export function ipcHandlerRegister() {
    ipcMain.handle('read-file', async (event, filePath: string) => {
        return SystemIO.readFile(filePath);
    });
    ipcMain.handle('reg:steam', async (event) => {
        return await localContext.regGetSteamInstallPath();
    });
    ipcMain.handle('selector:folder', async (event) => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: '请选择 Steam 安装目录',
        });
        return result.canceled ? null : result.filePaths[0];
    });
    ipcMain.handle('shortcut:steam', async (event, shortcutPath) => {
        try {
            logger.info('read lnc:', shortcutPath);
            const { target } = shell.readShortcutLink(shortcutPath);
            return target || null;
        } catch (e) {
            logger.error('read lnc error:', e);
            return null;
        }
    });
    ipcMain.handle('steam:vdf-read', async (event, vdfPath, vdfKey?) => {
        return await SystemIO.readSteamVDF(vdfPath, vdfKey);
    });
    ipcMain.handle('steam:appinfo-read', async (event, vdfPath) => {
        return await SystemIO.readSteamAppinfoVDF(vdfPath);
    });
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
        return await screenshortSelector.search(account, appID, keyword);
    });
    ipcMain.handle('log:error', (event, message) => {
        logger.error(message);
    });
    ipcMain.handle('log:warn', (event, message) => {
        logger.warn(message);
    });
}