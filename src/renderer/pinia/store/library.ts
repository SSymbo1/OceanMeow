import { defineStore } from 'pinia';

export const libraryStore = defineStore('library', {
  state: (): {
    libraryShow: string;
    librarySort: string;
    librarySortOrder: boolean;
    screenSortOrder: boolean;
    libraryCoverInfo: string;
    defaultScreenDumpPath: string;
    defaultScreenCreateFolder: boolean;
    defaultScreenDateOrdered: boolean;
    defaultScreenFolderType: string;
  } => ({
    libraryShow: '0',
    librarySort: '2',
    librarySortOrder: false,
    screenSortOrder: false,
    libraryCoverInfo: '1',
    defaultScreenDumpPath: '',
    defaultScreenCreateFolder: true,
    defaultScreenDateOrdered: false,
    defaultScreenFolderType: '0',
  }),
});
