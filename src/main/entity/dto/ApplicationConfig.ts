export class ApplicationConfig {
  common = {
    theme: 'system',
    defaultHome: 'Welcome',
    defaultLanguage: 'system',
    homeBackground: '',
    closeApplication: '1',
    closeAskIgnored: false,
  };
  library = {
    libraryShow: '0',
    librarySort: '2',
    librarySortOrder: false,
    screenSortOrder: false,
    libraryCoverInfo: '1',
    defaultScreenDumpPath: '',
    defaultScreenCreateFolder: true,
    defaultScreenDateOrdered: false,
    defaultScreenFolderType: '0',
  };
  capture = {
    hotkey: 'F12',
    saveLocation: '',
    createFolder: false,
  };
  share = {
    port: 56292,
  };
  cache = {
    cacheFolder: 'cache',
  };
  logger = {
    fileLevel: 'info',
    consoleLevel: 'info',
    format: '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {scope} >>> {text}',
    logFolder: 'logs',
    logName: 'application_${date}.log',
    maxFile: 10,
    maxDate: 7,
    maxSize: 10485760,
  };
}
