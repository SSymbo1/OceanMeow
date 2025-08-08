/// <reference types="vite/client" />
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare interface Window {
  electronAPI: {
    getPathToLocalFile: (file: File) => Promise<string>;
    readFile: (path: string) => Promise<string>;
    steamRegInstallPath: () => Promise<string | null>;
    readSteamVDF: (vdfPath: string, vdfKey?: string) => Promise<any>;
    validateSteamPath: (steamPath: string) => Promise<boolean>;
    steamShortcutPath: (shortcut: string) => Promise<string | null>;
    folderSelector: () => Promise<string | null>;
    collectAccountData: (steamPath: string) => Promise<SteamAccount[]>;
    collectLibraryData: (steamPath: string) => Promise<Library[]>;
    collectScreenshotData: (steamPath: string) => Promise<Screenshot[]>;
    readAppinfoVDF: (vdfPath: string) => Promise<Object | null>;
    queryLibraryDetail: (account: string, keyword?: string) => Promise<LibraryDetail[]>;
    queryScreenshotDetail: (account: string, appId: string, keyword?: string) => Promise<ScreenshotDetail[]>;
    minimize: () => void;
    close: () => void;
    info: (message: string) => void;
    error: (message: string) => void;
    warn: (message: string) => void;
  };
}