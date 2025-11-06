import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';
import { SystemIO } from '@/main/util/SystemIO';
import { ApplicationConfig } from '@/main/entity/dto/ApplicationConfig';

jest.mock('@/main/util/SystemIO', () => ({
  SystemIO: {
    readApplicationConfig: jest.fn(),
    writeApplicationConfig: jest.fn(),
  },
}));

describe('ApplicationConfigHolder', () => {
  let holder: ApplicationConfigHolder;
  beforeEach(() => {
    jest.clearAllMocks();
    holder = new ApplicationConfigHolder();
  });
  describe('read', () => {
    it('should return full config when no key supplied', async () => {
      const defaultConfig = new ApplicationConfig();
      // 模拟所有 key 都返回空，即使用默认值
      (SystemIO.readApplicationConfig as jest.Mock).mockResolvedValue({});
      const result = await holder.read();
      expect(result).toEqual(defaultConfig);
      expect(SystemIO.readApplicationConfig).toHaveBeenCalledTimes(
        Object.keys(defaultConfig).length
      );
    });

    it('should return single field when key is supplied', async () => {
      const stub = {
        theme: 'system',
        defaultHome: 'Welcome',
        defaultLanguage: 'system',
        homeBackground: '',
        closeApplication: '1',
        closeAskIgnored: false,
      };
      (SystemIO.readApplicationConfig as jest.Mock).mockResolvedValue(stub);
      const result = await holder.read('common');
      expect(result).toEqual(stub);
      expect(SystemIO.readApplicationConfig).toHaveBeenCalledWith('common');
      expect(SystemIO.readApplicationConfig).toHaveBeenCalledTimes(1);
    });

    it('should merge existed value into default template', async () => {
      const defaultConfig = new ApplicationConfig();
      const existed = { theme: 'system' };
      (SystemIO.readApplicationConfig as jest.Mock).mockResolvedValue(existed);
      const result = await holder.read('common');
      expect(result).toEqual({ ...defaultConfig.common, ...existed });
    });
  });

  describe('write', () => {
    it('should merge partial config and persist', async () => {
      const defaultConfig = new ApplicationConfig();
      // 先模拟当前配置为默认值
      (SystemIO.readApplicationConfig as jest.Mock).mockResolvedValue({});
      await holder.read(); // 触发缓存默认值
      const patch: Partial<ApplicationConfig> = {
        common: {
          theme: 'system',
          defaultHome: 'Welcome',
          defaultLanguage: 'system',
          homeBackground: '',
          closeApplication: '1',
          closeAskIgnored: true,
        },
      };
      await holder.write(patch);
      const expected = {
        ...defaultConfig,
        common: { ...defaultConfig.common, ...patch.common },
      };
      expect(SystemIO.writeApplicationConfig).toHaveBeenCalledWith(expected);
    });

    it('should keep untouched fields when writing partial object', async () => {
      const current: ApplicationConfig = {
        common: {
          theme: 'system',
          defaultHome: 'Welcome',
          defaultLanguage: 'system',
          homeBackground: '',
          closeApplication: '1',
          closeAskIgnored: false,
        },
        library: {
          libraryShow: '0',
          librarySort: '2',
          librarySortOrder: false,
          screenSortOrder: false,
          libraryCoverInfo: '1',
          defaultScreenDumpPath: '',
          defaultScreenCreateFolder: true,
          defaultScreenDateOrdered: false,
          defaultScreenFolderType: '0',
        },
        capture: {
          hotkey: 'F12',
          saveLocation: '',
          createFolder: false,
        },
        share: { port: 56292 },
        cache: { cacheFolder: 'cache' },
        logger: {
          fileLevel: 'info',
          consoleLevel: 'info',
          format: '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {scope} >>> {text}',
          logFolder: 'logs',
          logName: 'application_${date}.log',
          maxFile: 10,
          maxDate: 7,
          maxSize: 10485760,
        },
      };
      (SystemIO.readApplicationConfig as jest.Mock).mockResolvedValue(current);
      const patch: Partial<ApplicationConfig> = {
        capture: {
          hotkey: 'F12',
          saveLocation: '',
          createFolder: true,
        },
      };
      await holder.write(patch);
      const expected: ApplicationConfig = {
        ...current,
        capture: { ...current.capture, createFolder: true },
      };
      expect(SystemIO.writeApplicationConfig).toHaveBeenCalledWith(expected);
    });
  });
});
