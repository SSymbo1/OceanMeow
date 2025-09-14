import { AccountCollector } from '@/main/service/steam/collector/impl/AccountCollector';
import { SystemIO } from '@/main/util/SystemIO';
import { SteamResource } from '@/type/enum/Resource';
import { account } from './usage.json';

interface AccountData {
  AccountName: string;
  PersonaName: string;
  RememberPassword: string;
  WantsOfflineMode: string;
  SkipOfflineModeWarning: string;
  AllowAutoLogin: string;
  MostRecent: string;
  Timestamp: string;
}

const accountRepoCreate = jest.fn();
const accountRepoSave = jest.fn();
jest.mock('@/main/util/SystemDB', () => ({
  SystemDB: {
    getInstance: () => ({
      typeROM: { getRepository: () => ({ create: accountRepoCreate, save: accountRepoSave }) },
    }),
  },
}));
jest.mock('@/main/util/SystemIO', () => ({
  SystemIO: { readSteamVDF: jest.fn() },
}));
jest.mock('@/type/enum/resource', () => ({
  SteamResource: {
    LOGIN_USER_VDF: '/config/loginusers.vdf',
    ID_CONVERT: '76561197960265728',
    AVATOR_CACHE: '/config/avatarcache',
  },
}));
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: (...args: string[]) => args.join('/'),
}));

// 对AccountCollector进行单元测试
describe('AccountCollector', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  // 正常流程读取loginusers.vdf并转换成typeORM实体，保存到数据库
  it('read normal loginusers.vdf and transform to typeORM entity for save', async () => {
    (SystemIO.readSteamVDF as jest.Mock).mockResolvedValue(account.normal);
    accountRepoCreate.mockImplementation((dto) => dto);
    await new AccountCollector().collect('/path/steam');
    expect(SystemIO.readSteamVDF).toHaveBeenCalledWith(
      `/path/steam/${SteamResource.LOGIN_USER_VDF}`,
      'users'
    );
    expect(accountRepoCreate).toHaveBeenCalledTimes(10);
    expect(accountRepoSave).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ accountName: 'test_account1' }),
        expect.objectContaining({ accountName: 'test_account2' }),
        expect.objectContaining({ accountName: 'test_account3' }),
        expect.objectContaining({ accountName: 'test_account4' }),
        expect.objectContaining({ accountName: 'test_account5' }),
        expect.objectContaining({ accountName: 'test_account6' }),
        expect.objectContaining({ accountName: 'test_account7' }),
        expect.objectContaining({ accountName: 'test_account8' }),
        expect.objectContaining({ accountName: 'test_account9' }),
        expect.objectContaining({ accountName: 'test_account10' }),
      ])
    );
  });
  // 正常流程loginusers.vdf中没有读取到数据
  it('read empty loginusers.vdf and transform to typeORM entity for save', async () => {
    (SystemIO.readSteamVDF as jest.Mock).mockResolvedValue({});
    accountRepoCreate.mockImplementation((dto) => dto);
    await new AccountCollector().collect('/path/steam');
    expect(SystemIO.readSteamVDF).toHaveBeenCalledWith(
      `/path/steam/${SteamResource.LOGIN_USER_VDF}`,
      'users'
    );
    expect(accountRepoCreate).toHaveBeenCalledTimes(0);
    expect(accountRepoSave).toHaveBeenCalledTimes(0);
  });
  // 正常流程读取loginusers.vdf里的大量数据并转换成typeORM实体，保存到数据库
  it('read huge(5000) loginusers.vdf and transform to typeORM entity for save', async () => {
    const data: Record<string, AccountData> = {};
    const sampleData = (account.normal as Record<string, AccountData>)[
      Object.keys(account.normal)[0]
    ];
    for (let i = 0; i < 5000; i++) {
      data[`76561198000000000${i}`] = { ...sampleData, AccountName: `user_${i}` };
    }
    (SystemIO.readSteamVDF as jest.Mock).mockResolvedValue(data);
    accountRepoCreate.mockImplementation((dto) => dto);
    const t0 = performance.now();
    await new AccountCollector().collect('/path/steam');
    expect(SystemIO.readSteamVDF).toHaveBeenCalledWith(
      `/path/steam/${SteamResource.LOGIN_USER_VDF}`,
      'users'
    );
    expect(accountRepoCreate).toHaveBeenCalledTimes(5000);
    expect(accountRepoSave).toHaveBeenCalledTimes(1);
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(30);
  });
});
