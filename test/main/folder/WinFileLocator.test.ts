import { WinFileLocator } from '@/main/service/system/folder/impl/WinFileLocator';
import { logger } from '@/main/util/Logger';
import { ExceptionMessage, ExchangeMessage } from '@/type/enum/Message';
import { dialog, shell } from 'electron';
import fs from 'node:fs';

/* ------------------ 类型安全的 mock ------------------ */
jest.mock('node:fs', () => ({
  existsSync: jest.fn<boolean, [string]>(),
}));
jest.mock('electron', () => ({
  dialog: {
    showOpenDialog: jest.fn<
      Promise<Electron.OpenDialogReturnValue>,
      [Electron.OpenDialogOptions]
    >(),
  },
  shell: {
    showItemInFolder: jest.fn<void, [string]>(),
    readShortcutLink: jest.fn<{ target?: string }, [string]>(),
  },
}));
jest.mock('@/main/util/Logger', () => ({
  logger: {
    error: jest.fn<void, [string, unknown?]>(),
  },
}));

/* ------------------ 工具类型 ------------------ */
const mockFs = fs as jest.Mocked<typeof fs>;
const mockDialog = dialog as jest.Mocked<typeof dialog>;
const mockShell = shell as jest.Mocked<typeof shell>;
const mockLogger = logger as jest.Mocked<typeof logger>;

/* ------------------ 测试套件 ------------------ */
describe('WinFileLocator', () => {
  let locator: WinFileLocator;
  beforeEach(() => {
    jest.clearAllMocks();
    locator = new WinFileLocator();
  });
  describe('locateFile', () => {
    it('should call <shell.showItemInFolder> when file is exist', () => {
      const path = 'C:\\file.txt';
      mockFs.existsSync.mockReturnValue(true);
      locator.locateFile(path);
      expect(mockShell.showItemInFolder).toHaveBeenCalledWith(path);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should log and return in advance when the file does not exist', () => {
      const path = 'C:\\not-found.txt';
      mockFs.existsSync.mockReturnValue(false);
      locator.locateFile(path);
      expect(mockShell.showItemInFolder).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        ExceptionMessage.FILE_NOT_EXIST_EXCEPTION.replace('{file}', path)
      );
    });
  });

  describe('folderSelector', () => {
    it('should call <dialog.showOpenDialog> and return the result', async () => {
      const mockReturn: Electron.OpenDialogReturnValue = {
        canceled: false,
        filePaths: ['D:\\Projects'],
      };
      mockDialog.showOpenDialog.mockResolvedValue(mockReturn);
      const res = await locator.folderSelector();
      expect(mockDialog.showOpenDialog).toHaveBeenCalledWith({
        properties: ['openDirectory'],
        title: ExchangeMessage.SELECT_LOCATION,
      });
      expect(res).toBe(mockReturn);
    });
  });

  describe('fileSelector', () => {
    it('should call <dialog.showOpenDialog> according to the given type and extension', async () => {
      const mockReturn: Electron.OpenDialogReturnValue = {
        canceled: false,
        filePaths: ['C:\\img.png'],
      };
      mockDialog.showOpenDialog.mockResolvedValue(mockReturn);
      const res = await locator.fileSelector('图片', ['png', 'jpg']);
      expect(mockDialog.showOpenDialog).toHaveBeenCalledWith({
        title: ExchangeMessage.SELECT_FILE,
        properties: ['openFile'],
        filters: [{ name: '图片', extensions: ['png', 'jpg'] }],
      });
      expect(res).toBe(mockReturn);
    });
  });

  describe('shortcutParser', () => {
    it('should return the target path when the resolution is successful', () => {
      const lnk = 'C:\\shortcut.lnk';
      const target = 'D:\\target.exe';
      mockShell.readShortcutLink.mockReturnValue({ target });
      const res = locator.shortcutParser(lnk);
      expect(mockShell.readShortcutLink).toHaveBeenCalledWith(lnk);
      expect(res).toBe(target);
    });

    it('should log and return null when parsing fails', () => {
      const lnk = 'C:\\broken.lnk';
      const error = new Error('Invalid shortcut');
      mockShell.readShortcutLink.mockImplementation(() => {
        throw error;
      });
      const res = locator.shortcutParser(lnk);
      expect(mockLogger.error).toHaveBeenCalledWith(ExceptionMessage.INC_EXCEPTION, error);
      expect(res).toBeNull();
    });
  });
});
