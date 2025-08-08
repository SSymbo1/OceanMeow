import { contextBridge, ipcRenderer, webUtils } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    getPathToLocalFile: (file: File) => webUtils.getPathForFile(file),
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    steamRegInstallPath: () => ipcRenderer.invoke('reg:steam'),
    steamShortcutPath: (shortcutPath: string) => ipcRenderer.invoke('shortcut:steam', shortcutPath),
    folderSelector: () => ipcRenderer.invoke('selector:folder'),
    readAppinfoVDF: (vdfPath: string) => ipcRenderer.invoke('steam:appinfo-read', vdfPath),
    validateSteamPath: (steamPath: string) => ipcRenderer.invoke('steam:validate', steamPath),
    readSteamVDF: (vdfPath: string, vdfKey?: string) => ipcRenderer.invoke('steam:vdf-read', vdfPath, vdfKey),
    collectAccountData: (steamPath: string) => ipcRenderer.invoke('collect:account', steamPath),
    collectLibraryData: (steamPath: string) => ipcRenderer.invoke('collect:library', steamPath),
    collectScreenshotData: (steamPath: string) => ipcRenderer.invoke('collect:scheenshot', steamPath),
    queryLibraryDetail: (account: string, keyword?: string) => ipcRenderer.invoke('query:library', account, keyword),
    queryScreenshotDetail: (account: string, appID: string, keyword?: string) => ipcRenderer.invoke('query:screenshot', account, appID, keyword),
    minimize: () => ipcRenderer.send('window-min'),
    close: () => ipcRenderer.send('window-close'),
    info: (message: string) => ipcRenderer.invoke('log:info', message),
    warn: (message: string) => ipcRenderer.invoke('log:warn', message),
    error: (message: string) => ipcRenderer.invoke('log:error', message),
})

