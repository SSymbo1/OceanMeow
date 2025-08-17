import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { SteamDumpConfig } from '@/type/electron/entity/SteamDumpConfig';
import { ApplicationConfig } from '@/type/electron/entity/ApplicationConfig';

contextBridge.exposeInMainWorld('electronAPI', {
  getPathToLocalFile: (file: File) => webUtils.getPathForFile(file),
  fileLocate: (filePath: string) => ipcRenderer.invoke('file:locate', filePath),
  steamRegInstallPath: () => ipcRenderer.invoke('reg:steam'),
  steamShortcutPath: (shortcutPath: string) => ipcRenderer.invoke('shortcut:steam', shortcutPath),
  folderSelector: () => ipcRenderer.invoke('selector:folder'),
  validateSteamPath: (steamPath: string) => ipcRenderer.invoke('steam:validate', steamPath),
  collectAccountData: (steamPath: string) => ipcRenderer.invoke('collect:account', steamPath),
  collectLibraryData: (steamPath: string) => ipcRenderer.invoke('collect:library', steamPath),
  collectScreenshotData: (steamPath: string) => ipcRenderer.invoke('collect:scheenshot', steamPath),
  queryLibraryDetail: (account: string, keyword?: string) =>
    ipcRenderer.invoke('query:library', account, keyword),
  queryScreenshotDetail: (account: string, appID: string, keyword?: string) =>
    ipcRenderer.invoke('query:screenshot', account, appID, keyword),
  dumpGameScreen: (steamPath: string, dumpConfig: SteamDumpConfig, files: string[]) =>
    ipcRenderer.invoke('dump:screenshot-single', steamPath, dumpConfig, files),
  gameScreenConfig: (appID: string, steamID: string) =>
    ipcRenderer.invoke('config:screenshot-single', appID, steamID),
  readApplicationConfig: (key?: string) => ipcRenderer.invoke('config:read-application', key),
  writeApplicationConfig: (config: ApplicationConfig) =>
    ipcRenderer.invoke('config:write-application', config),
  minimize: () => ipcRenderer.send('window-min'),
  close: () => ipcRenderer.send('window-close'),
  info: (message: string) => ipcRenderer.invoke('log:info', message),
  warn: (message: string) => ipcRenderer.invoke('log:warn', message),
  error: (message: string) => ipcRenderer.invoke('log:error', message),
});
