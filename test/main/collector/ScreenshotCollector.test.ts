import { ScreenshotCollector } from '@/main/service/steam/collector/impl/ScreenshotCollector';
import { SystemIO } from '@/main/util/SystemIO';
import { SteamResource } from '@/type/enum/Resource';
import { Screenshots, SteamAccount } from '@/main/entity';
import { screenshot } from './usage.json';

const screenshotRepoCreate = jest.fn();
const screenshotRepoSave = jest.fn();
const accountFind = jest.fn();

jest.mock('@/main/util/SystemDB', () => ({
  SystemDB: {
    getInstance: () => ({
      typeROM: {
        getRepository: (entity: unknown) => {
          if (entity === Screenshots)
            return { create: screenshotRepoCreate, save: screenshotRepoSave };
          if (entity === SteamAccount) return { find: accountFind };
          return {};
        },
      },
    }),
  },
}));
jest.mock('@/main/util/SystemIO', () => ({
  SystemIO: { readSteamVDF: jest.fn(), readSteamAppinfoVDF: jest.fn(), getFilePath: jest.fn() },
}));
jest.mock('@/type/enum/resource', () => ({
  SteamResource: {
    SCREENSHOT_VDF: '/userdata/{user_id}/760/screenshots.vdf',
    SCREENSHOT: '/userdata/{user_id}/760/remote/',
  },
}));
jest.mock(
  'p-limit',
  () =>
    () =>
    <T>(fn: () => Promise<T>) =>
      fn()
);
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: (...args: string[]) => args.join('/'),
}));

describe('ScreenshotCollector', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  // 正常流程读取screenshots.vdf并转换成typeORM实体，保存到数据库
  it('read normal screenshots.vdf and transform to typeORM entity for save', async () => {
    const mockAccounts: Partial<SteamAccount>[] = screenshot.account;
    accountFind.mockResolvedValue(mockAccounts);
    (SystemIO.readSteamVDF as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath.includes('76561198000000001')) return screenshot.normal.test1;
      if (filePath.includes('76561198000000002')) return screenshot.normal.test2;
      return {};
    });
    screenshotRepoCreate.mockImplementation((dto) => dto);
    const collector = new ScreenshotCollector();
    const result = await collector.collect('/path/steam');
    expect(accountFind).toHaveBeenCalledWith({ select: ['steamId'] });
    expect(SystemIO.readSteamVDF).toHaveBeenCalledTimes(2);
    expect(SystemIO.readSteamVDF).toHaveBeenCalledWith(
      `/path/steam/${SteamResource.SCREENSHOT_VDF.replace('{user_id}', '76561198000000001')}`,
      'screenshots'
    );
    expect(SystemIO.readSteamVDF).toHaveBeenCalledWith(
      `/path/steam/${SteamResource.SCREENSHOT_VDF.replace('{user_id}', '76561198000000002')}`,
      'screenshots'
    );
    expect(screenshotRepoCreate).toHaveBeenCalledTimes(48);
    expect(screenshotRepoSave).toHaveBeenCalledTimes(1);
    expect(screenshotRepoSave).toHaveBeenCalledWith(
      expect.arrayContaining(
        new Array(25).fill(null).map(() =>
          expect.objectContaining({
            appId: expect.any(String),
            userId: expect.any(String),
            fileName: expect.stringContaining('/screenshots/'),
            thumbNail: expect.stringContaining('/thumbnails/'),
          })
        )
      )
    );
    expect(result).toHaveLength(48);
  });
  // 正常流程screenshots.vdf中没有读取到数据
  it('read empty screenshots.vdf and transform to typeORM entity for save', async () => {
    const mockAccounts: Partial<SteamAccount>[] = [];
    accountFind.mockResolvedValue(mockAccounts);
    (SystemIO.readSteamVDF as jest.Mock).mockImplementation(() => {
      return {};
    });
    screenshotRepoCreate.mockImplementation((dto) => dto);
    const collector = new ScreenshotCollector();
    const result = await collector.collect('/path/steam');
    expect(accountFind).toHaveBeenCalledWith({ select: ['steamId'] });
    expect(SystemIO.readSteamVDF).toHaveBeenCalledTimes(0);
    expect(screenshotRepoCreate).toHaveBeenCalledTimes(0);
    expect(screenshotRepoSave).toHaveBeenCalledTimes(0);
    expect(result).toHaveLength(0);
  });
  // 正常流程读取screenshots.vdf里的大量数据并转换成typeORM实体，保存到数据库
  it('read huge(100k) screenshots.vdf and measure async throughput', async () => {
    const ACCOUNT_NUM = 5;
    const PER_ACCOUNT = 20_000; // 100 k / 5
    const mockAccounts = Array.from({ length: ACCOUNT_NUM }, (_, i) => ({
      steamId: `7656119800000000${i + 1}`,
    }));
    accountFind.mockResolvedValue(mockAccounts);
    /* 只存 100 k 个 key，不存完整对象，省内存 */
    const buildAsync = (): Promise<Record<string, Record<string, Record<string, string>>>> =>
      new Promise((resolve) => {
        setTimeout(() => {
          const data: Record<string, Record<string, Record<string, string>>> = {};
          const appId = '100000'; // 单 app，方便计数
          data[appId] = {};
          for (let i = 0; i < PER_ACCOUNT; i++) {
            data[appId][i.toString()] = {
              type: '1',
              filename: `ss_${i}.jpg`,
              thumbnail: `ss_${i}_thumb.jpg`,
              imported: '1',
              width: '1920',
              height: '1080',
              gameid: '100000',
              creation: '1600000000',
              Permissions: '1',
              hscreenshot: '1',
            };
          }
          resolve(data);
        }, 30);
      });
    (SystemIO.readSteamVDF as jest.Mock).mockImplementation(() => buildAsync());
    screenshotRepoCreate.mockImplementation((dto) => dto);
    screenshotRepoSave.mockResolvedValue([]);
    const t0 = performance.now();
    const result = await new ScreenshotCollector().collect('/steam');
    const t1 = performance.now();
    const TOTAL = ACCOUNT_NUM * PER_ACCOUNT;
    // 核心断言
    expect(result).toHaveLength(TOTAL);
    expect(SystemIO.readSteamVDF).toHaveBeenCalledTimes(ACCOUNT_NUM);
    expect(screenshotRepoCreate).toHaveBeenCalledTimes(TOTAL);
    expect(screenshotRepoSave).toHaveBeenCalledTimes(Math.ceil(TOTAL / 500));
    expect(t1 - t0).toBeLessThan(300);
  });
});
