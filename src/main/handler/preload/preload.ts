import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { SteamDumpConfig, ApplicationConfig, ScreenshotShare } from '@/type/electron/entity';

contextBridge.exposeInMainWorld('electronAPI', {
  getPathToLocalFile: (file: File) => webUtils.getPathForFile(file),
  startServer: () => ipcRenderer.invoke('server:start'),
  stopServer: () => ipcRenderer.invoke('server:stop'),
  fileLocate: (filePath: string) => ipcRenderer.invoke('file:locate', filePath),
  steamRegInstallPath: () => ipcRenderer.invoke('reg:steam'),
  steamShortcutPath: (shortcutPath: string) => ipcRenderer.invoke('shortcut:steam', shortcutPath),
  folderSelector: () => ipcRenderer.invoke('selector:folder'),
  fileSelector: (type: string, filter: string[]) =>
    ipcRenderer.invoke('selector:file', type, filter),
  validateSteamPath: (steamPath: string) => ipcRenderer.invoke('steam:validate', steamPath),
  shareSteamScreenshot: (shareData: ScreenshotShare) =>
    ipcRenderer.invoke('share:steam-screenshot', shareData),
  collectAccountData: (steamPath: string) => ipcRenderer.invoke('collect:account', steamPath),
  collectLibraryData: (steamPath: string) => ipcRenderer.invoke('collect:library', steamPath),
  collectScreenshotData: (steamPath: string) => ipcRenderer.invoke('collect:screenshot', steamPath),
  queryLibraryDetail: (account: string, keyword?: string) =>
    ipcRenderer.invoke('query:library', account, keyword),
  queryScreenshotDetail: (account: string, appID: string, keyword?: string) =>
    ipcRenderer.invoke('query:screenshot', account, appID, keyword),
  dumpGameScreen: (steamPath: string, dumpConfig: SteamDumpConfig, files: string[]) =>
    ipcRenderer.invoke('dump:screenshot-single', steamPath, dumpConfig, files),
  gameScreenConfig: (appID: string, steamID: string) =>
    ipcRenderer.invoke('config:screenshot-single', appID, steamID),
  readApplicationConfig: (key?: string) => ipcRenderer.invoke('config:read-application', key),
  writeApplicationConfigCustom: (config: Partial<ApplicationConfig>) =>
    ipcRenderer.invoke('config:write-application-custom', config),
  getSystemEnvironment: () => ipcRenderer.invoke('system:env'),
  getBackgroundCache: () => ipcRenderer.invoke('cache:background-read'),
  writeBackgroundCache: (cache: string) => ipcRenderer.invoke('cache:background-write', cache),
  minimize: () => ipcRenderer.send('window-min'),
  close: () => ipcRenderer.send('window-close'),
  trayClose: () => ipcRenderer.send('tray-close'),
  info: (message: string) => ipcRenderer.invoke('log:info', message),
  warn: (message: string) => ipcRenderer.invoke('log:warn', message),
  error: (message: string) => ipcRenderer.invoke('log:error', message),
});
