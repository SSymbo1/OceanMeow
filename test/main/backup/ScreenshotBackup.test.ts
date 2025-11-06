/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScreenshotBackup } from '@/main/service/system/backup/impl/ScreenshotBackup';
import { SystemDB } from '@/main/util/SystemDB';
import { ScreenDetail } from '@/main/entity';
import { SteamDumpConfig } from '@/main/entity/po/SteamDumpConfig';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';
import { DumpFolderType, CreateFolder, OrderByDate } from '@/type/enum/Option';
import { ExceptionMessage } from '@/type/enum/Message';
import fs from 'node:fs';
import path from 'node:path';
import { logger } from '@/main/util/Logger';

// 模拟依赖模块
jest.mock('@/main/util/SystemDB');
jest.mock('@/main/service/system/config/impl/ApplicationConfigHolder');
jest.mock('node:fs');
jest.mock('@/main/util/Logger');
jest.mock('valve-key-values-binary', () => ({
  default: jest.fn(),
}));
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn().mockReturnValue('/mock/path'),
  },
}));
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  Brackets: jest.fn((fn) => ({ fn })), // 记录传入的函数
}));

describe('ScreenshotBackup', () => {
  let screenshotBackup: ScreenshotBackup;
  const mockSteamPath = 'C:\\Steam';
  const mockAppID = '730';
  const mockSteamID = '123456';
  const mockFiles = ['1', '2', '3'];
  const mockDumpConfig: SteamDumpConfig = {
    appID: mockAppID,
    steamID: mockSteamID,
    dumpPath: 'D:\\Screenshots',
    createFolder: CreateFolder.ENABLE,
    folderType: DumpFolderType.FOLDER_TYPE_DEFAULT,
    folderName: '',
    orderByDate: OrderByDate.DISABLE,
    appName: 'Counter-Strike 2',
    appLocation: '反恐精英2',
  };
  const mockScreens: ScreenDetail[] = [
    {
      longId: '12345678901234567',
      shortId: mockSteamID,
      loginName: 'test@example.com',
      userName: 'TestUser',
      appId: mockAppID,
      appName: 'Counter-Strike 2',
      appLocalized: '反恐精英2',
      screenIndex: 1,
      screenFull: 'userdata/123456/730/screenshots/1.jpg',
      screenThumb: 'userdata/123456/730/screenshots/thumb_1.jpg',
      width: 1920,
      height: 1080,
      creation: '2024-10-01 12:00:00',
      del: '0',
    },
    {
      longId: '12345678901234567',
      shortId: mockSteamID,
      loginName: 'test@example.com',
      userName: 'TestUser',
      appId: mockAppID,
      appName: 'Counter-Strike 2',
      appLocalized: '反恐精英2',
      screenIndex: 2,
      screenFull: 'userdata/123456/730/screenshots/2.jpg',
      screenThumb: 'userdata/123456/730/screenshots/thumb_2.jpg',
      width: 1920,
      height: 1080,
      creation: '2024-10-01 13:00:00',
      del: '0',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    screenshotBackup = new ScreenshotBackup();
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockScreens),
      getOne: jest.fn().mockResolvedValue(null),
    };
    const mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      save: jest.fn().mockResolvedValue(mockDumpConfig),
    };
    (SystemDB.getInstance as jest.Mock).mockReturnValue({
      typeROM: {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      },
    });
  });

  describe('dump', () => {
    it('should successfully dump screenshots and return result', async () => {
      jest.spyOn(screenshotBackup as any, 'dumpScreenBuilder').mockReturnValue(true);
      const result = await screenshotBackup.dump(mockSteamPath, mockDumpConfig, mockFiles);
      const queryBuilder = SystemDB.getInstance()
        .typeROM.getRepository(ScreenDetail)
        .createQueryBuilder();
      expect(queryBuilder.where).toHaveBeenCalledWith('detail.app_id = :app', { app: mockAppID });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.objectContaining({ fn: expect.any(Function) })
      );
      const andWhereCalls = (queryBuilder.andWhere as jest.Mock).mock.calls;
      expect(andWhereCalls.length).toBeGreaterThan(0);
      const hasScreenIndexCondition = andWhereCalls.some((call: any[]) => {
        const arg = call[0];
        if (!arg || typeof arg.fn !== 'function') return false;
        // 模拟 queryBuilder 捕捉 SQL
        const mockQB: any = {
          andWhere: (sql: string) => {
            mockQB._sql = (mockQB._sql || '') + ' ' + sql;
            return mockQB;
          },
          _sql: '',
        };
        arg.fn(mockQB);
        return mockQB._sql.includes('detail.screen_index in (:...files)');
      });
      expect(hasScreenIndexCondition).toBe(true);
      expect(queryBuilder.getMany).toHaveBeenCalled();
      expect(screenshotBackup['dumpScreenBuilder']).toHaveBeenCalledWith(
        mockSteamPath,
        mockDumpConfig,
        mockScreens
      );
      expect(
        SystemDB.getInstance().typeROM.getRepository(SteamDumpConfig).save
      ).toHaveBeenCalledWith(mockDumpConfig);
      expect(result).toEqual({
        app_id: mockAppID,
        steam_id: mockSteamID,
        effected: true,
      });
    });

    it('should return effected false when dumpScreenBuilder fails', async () => {
      jest.spyOn(screenshotBackup as any, 'dumpScreenBuilder').mockReturnValue(false);
      const result = await screenshotBackup.dump(mockSteamPath, mockDumpConfig, mockFiles);
      expect(result.effected).toBe(false);
      expect(
        SystemDB.getInstance().typeROM.getRepository(SteamDumpConfig).save
      ).toHaveBeenCalledWith(mockDumpConfig);
    });
  });

  describe('config', () => {
    it('should return existing config from database', async () => {
      const existingConfig = { ...mockDumpConfig, folderName: 'custom' };
      (
        SystemDB.getInstance().typeROM.getRepository(SteamDumpConfig).createQueryBuilder()
          .getOne as jest.Mock
      ).mockResolvedValue(existingConfig);
      const result = await screenshotBackup.config(mockAppID, mockSteamID);
      expect(result).toEqual(existingConfig);
    });

    it('should return default config when no existing config', async () => {
      const mockDefaultConfig = {
        defaultScreenDumpPath: 'D:\\Default',
        defaultScreenCreateFolder: true,
        defaultScreenFolderType: DumpFolderType.FOLDER_TYPE_APP_NAME,
        defaultScreenDateOrdered: false,
      };
      (ApplicationConfigHolder.prototype.read as jest.Mock).mockResolvedValue(mockDefaultConfig);
      const result = await screenshotBackup.config(mockAppID, mockSteamID);
      expect(ApplicationConfigHolder).toHaveBeenCalled();
      expect(ApplicationConfigHolder.prototype.read).toHaveBeenCalledWith('library');
      expect(result).toEqual({
        appID: mockAppID,
        steamID: mockSteamID,
        dumpPath: mockDefaultConfig.defaultScreenDumpPath,
        createFolder: CreateFolder.ENABLE,
        folderType: mockDefaultConfig.defaultScreenFolderType,
        folderName: '',
        orderByDate: OrderByDate.DISABLE,
      });
    });
  });

  describe('buildDumpTargetPath', () => {
    it('should build correct path for FOLDER_TYPE_APP_LOCALIZED (using appLocalized)', () => {
      const config = { ...mockDumpConfig, folderType: DumpFolderType.FOLDER_TYPE_APP_LOCALIZED };
      const buildPath = (screenshotBackup as any).buildDumpTargetPath(config);
      expect(buildPath).toBe(path.join(config.dumpPath, config.appLocation));
    });

    it('should sanitize folder name with invalid characters', () => {
      const config = {
        ...mockDumpConfig,
        folderType: DumpFolderType.FOLDER_TYPE_CUSTOM,
        folderName: 'invalid?<name>*', // 包含?、<、*三个非法字符
      };
      const buildPath = (screenshotBackup as any).buildDumpTargetPath(config);
      expect(buildPath).toBe(path.join(config.dumpPath, 'invalid  name'));
    });
  });

  describe('buildDumpTargetOrderedFolder', () => {
    it('should group screens by date (using creation property) and create directories', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const dumpPath = 'D:\\Screenshots\\730';
      const result = (screenshotBackup as any).buildDumpTargetOrderedFolder(dumpPath, mockScreens);
      expect(Object.keys(result)).toEqual(['2024-10-01']);
      expect(result['2024-10-01']).toHaveLength(2);
      expect(result['2024-10-01'][0].screenIndex).toBe(1);
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        decodeURIComponent(path.join(dumpPath, '2024-10-01'))
      );
    });
  });

  describe('dumpScreen', () => {
    it('should copy files when screens is array (using screenFull property)', () => {
      const dumpPath = 'D:\\Screenshots\\730';
      (screenshotBackup as any).dumpScreen(mockSteamPath, dumpPath, mockScreens);
      expect(fs.copyFileSync).toHaveBeenCalledTimes(2);
      expect(fs.copyFileSync).toHaveBeenNthCalledWith(
        1,
        path.join(mockSteamPath, mockScreens[0].screenFull),
        path.join(dumpPath, path.basename(mockScreens[0].screenFull))
      );
      expect(mockScreens[0].screenIndex).toBe(1);
    });

    it('should recursively copy files when screens is grouped object', () => {
      const dumpPath = 'D:\\Screenshots\\730';
      const groupedScreens = { '2024-10-01': mockScreens };
      const copyMock = jest.spyOn(fs, 'copyFileSync').mockImplementation(() => {});
      (screenshotBackup as any).dumpScreen(mockSteamPath, dumpPath, groupedScreens);
      expect(copyMock).toHaveBeenCalledTimes(2);
      expect(copyMock).toHaveBeenCalledWith(
        path.join(mockSteamPath, 'userdata/123456/730/screenshots/1.jpg'),
        path.join(dumpPath, '2024-10-01', '1.jpg')
      );
      expect(copyMock).toHaveBeenCalledWith(
        path.join(mockSteamPath, 'userdata/123456/730/screenshots/2.jpg'),
        path.join(dumpPath, '2024-10-01', '2.jpg')
      );
    });
  });

  describe('dumpScreenBuilder', () => {
    it('should return true when dump succeeds', () => {
      jest.spyOn(screenshotBackup as any, 'buildDumpTargetPath').mockReturnValue('D:\\target');
      jest.spyOn(screenshotBackup as any, 'dumpScreen').mockImplementation(() => {});
      const result = (screenshotBackup as any).dumpScreenBuilder(
        mockSteamPath,
        mockDumpConfig,
        mockScreens
      );
      expect(result).toBe(true);
    });

    it('should log error and return false when dump fails', () => {
      jest.spyOn(screenshotBackup as any, 'buildDumpTargetPath').mockReturnValue('D:\\target');
      jest.spyOn(screenshotBackup as any, 'dumpScreen').mockImplementation(() => {
        throw new Error('Copy failed');
      });
      const result = (screenshotBackup as any).dumpScreenBuilder(
        mockSteamPath,
        mockDumpConfig,
        mockScreens
      );
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(ExceptionMessage.DUMP_EXCEPTION, expect.any(Error));
    });
  });
});
