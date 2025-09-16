/// <reference types="vite/client" />
declare const __PROJECT_NAME__: string;
declare const __PROJECT_VERSION__: string;
declare const __DEPENDENCIES__:object;

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare interface Window {
  electronAPI: {
    getPathToLocalFile: (file: File) => Promise<string>;
    fileLocate: (path: string) => void;
    steamRegInstallPath: () => Promise<string | null>;
    validateSteamPath: (steamPath: string) => Promise<boolean>;
    steamShortcutPath: (shortcut: string) => Promise<string | null>;
    folderSelector: () => Promise<string | null>;
    collectAccountData: (steamPath: string) => Promise<SteamAccount[]>;
    collectLibraryData: (steamPath: string) => Promise<Library[]>;
    collectScreenshotData: (steamPath: string) => Promise<Screenshot[]>;
    queryLibraryDetail: (account: string, keyword?: string) => Promise<LibraryDetail[]>;
    queryScreenshotDetail: (account: string, appId: string, keyword?: string) => Promise<ScreenshotDetail[]>;
    dumpGameScreen:(steamPath:string, dumpConfig:SteamDumpConfig, files:string[])=>Promise<ScreenDumpResult>;
    gameScreenConfig:(appID: string, steamID: string)=>Promise<SteamDumpConfig>;
    readApplicationConfig: (key?: string) => Promise<ApplicationConfig>;
    writeApplicationConfigCustom: (config: Partial<ApplicationConfig>)=> Promise<void>;
    shareSteamScreenshot: (screenshot: ScreenshotShare) => Promise<string>;
    closeAppModalListener: (callback: () => void) => void;
    removeCloseAppModalListener: (callback: () => void) => void;
    startServer(): () => Promise<void>;
    stopServer(): () => Promise<void>;
    quit(): () => void;
    minimize: () => void;
    close: () => void;
    info: (message: string) => void;
    error: (message: string) => void;
    warn: (message: string) => void;
  };
}