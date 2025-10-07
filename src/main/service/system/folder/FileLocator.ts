export interface FileLocator {
  locateFile(filePath: string): void;
  folderSelector(): Promise<Electron.OpenDialogReturnValue>;
  fileSelector(type: string, filter: string[]): Promise<Electron.OpenDialogReturnValue>;
  shortcutParser(path: string): string | null;
}
