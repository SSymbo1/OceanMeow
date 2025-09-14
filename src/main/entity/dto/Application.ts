export class ApplicationConfig {
  common = {
    theme: '2',
    defaultHome: '0',
    defaultLanguage: '2',
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
