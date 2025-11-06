/* eslint-disable @typescript-eslint/no-explicit-any */
import { dialog, app } from 'electron';
import { execSync, spawn } from 'child_process';
import { logger } from '@/main/util/Logger';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';
import { Firewall } from '@/main/util/Firewall';
import { ApplicationResource } from '@/type/enum/Resource';
import { CommonMessage, ExchangeMessage, ExceptionMessage } from '@/type/enum/Message';

/* ---------- mock 区域 ---------- */
jest.mock('electron', () => ({
  dialog: {
    showMessageBox: jest.fn(),
    showErrorBox: jest.fn(),
  },
  app: {
    isPackaged: false,
    quit: jest.fn(),
  },
}));
jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn(),
}));
jest.mock('@/main/util/Logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('valve-key-values-binary', () => ({
  default: jest.fn(),
}));
jest.mock('@/main/service/system/config/impl/ApplicationConfigHolder');

/* ---------- 工具函数 ---------- */
const mockedDialog = dialog as jest.Mocked<typeof dialog>;
const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockedSpawn = spawn as jest.MockedFunction<typeof spawn>;
const mockedLogger = logger as jest.Mocked<typeof logger>;
const mockedApp = app as jest.Mocked<typeof app>;
const MockedApplicationConfigHolder = ApplicationConfigHolder as jest.MockedClass<
  typeof ApplicationConfigHolder
>;

/** 快速构造一个假的 configHolder 实例 */
function mockConfigHolder(port: number) {
  const instance = {
    read: jest.fn().mockResolvedValue({ port }),
  } as any;
  MockedApplicationConfigHolder.mockImplementation(() => instance);
  return instance;
}

/** 重置所有 mock 调用信息 */
beforeEach(() => {
  jest.clearAllMocks();
  // 默认让防火墙规则不存在
  mockedExecSync.mockImplementation((cmd: string) => {
    if (cmd.includes('netsh advfirewall firewall show rule')) {
      throw new Error('rule not found');
    }
    if (cmd.includes('net session')) {
      throw new Error('not admin');
    }
    return Buffer.from('');
  });
});

/* ---------- 测试用例 ---------- */
describe('Firewall.ensureRule', () => {
  it('should return Immediate when firewall rule is exist', async () => {
    mockedExecSync.mockImplementation((cmd: string) => {
      if (cmd.includes('netsh advfirewall firewall show rule')) return Buffer.from('');
      return Buffer.from('');
    });
    mockConfigHolder(8080);
    await Firewall.ensureRule();
    expect(mockedLogger.info).toHaveBeenCalledWith(
      CommonMessage.FIREWALL_RULE_EXIST.replace(
        '{rule}',
        ApplicationResource.FIREWALL_RULE.replace('{port}', '8080')
      )
    );
    expect(mockedDialog.showMessageBox).not.toHaveBeenCalled();
  });

  it('should add rules directly when current auth is administrator', async () => {
    mockedExecSync.mockImplementation((cmd: string) => {
      if (cmd.includes('netsh advfirewall firewall show rule')) throw new Error('not found');
      if (cmd.includes('net session')) return Buffer.from(''); // admin
      return Buffer.from('');
    });
    mockConfigHolder(8080);
    await Firewall.ensureRule();
    expect(mockedExecSync).toHaveBeenLastCalledWith(
      expect.stringContaining('netsh advfirewall firewall add rule')
    );
    expect(mockedLogger.info).toHaveBeenCalledWith(
      CommonMessage.FIREWALL_RULE_CREATE.replace(
        '{rule}',
        ApplicationResource.FIREWALL_RULE.replace('{port}', '8080')
      )
    );
  });

  it('should tries to delegate authority when current auth is not administrator and user clicks <Confirm> button', async () => {
    mockedDialog.showMessageBox.mockResolvedValueOnce({ response: 0, checkboxChecked: false });
    mockConfigHolder(8080);
    await Firewall.ensureRule();
    expect(mockedDialog.showMessageBox).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ExchangeMessage.ASK_FIREWALL_PERMISSION_MESSAGE,
      })
    );
    expect(mockedSpawn).toHaveBeenCalledWith(
      'powershell.exe',
      expect.arrayContaining([expect.stringContaining('Start-Process')]),
      expect.anything()
    );
  });

  it('should only warning pops up when current auth is not administrator and user clicks <Cancel> button', async () => {
    mockedDialog.showMessageBox.mockResolvedValueOnce({ response: 1, checkboxChecked: false });
    mockConfigHolder(8080);
    await Firewall.ensureRule();
    expect(mockedDialog.showMessageBox).toHaveBeenCalledTimes(2);
    expect(mockedDialog.showMessageBox).toHaveBeenLastCalledWith(
      expect.objectContaining({
        message: ExchangeMessage.ASK_FIREWALL_PERMISSION_DENIED,
      })
    );
    expect(mockedSpawn).not.toHaveBeenCalled();
  });

  it('should record error when abnormal reading configuration', async () => {
    const instance = { read: jest.fn().mockRejectedValue(new Error('read fail')) } as any;
    MockedApplicationConfigHolder.mockImplementation(() => instance);
    await Firewall.ensureRule();
    expect(mockedLogger.error).toHaveBeenCalledWith(
      ExceptionMessage.FIREWALL_ADD_EXCEPTION,
      expect.any(Error)
    );
  });
});

describe('Firewall.handleCommandLineArgs', () => {
  let originalArgv: string[];
  beforeEach(() => {
    originalArgv = process.argv;
  });
  afterEach(() => {
    process.argv = originalArgv;
  });

  it('should add rule and exit when include the <--add firewall> rule parameter', async () => {
    process.argv = [...originalArgv, '--add-firewall-rule'];
    Object.defineProperty(mockedApp, 'isPackaged', {
      value: true,
      writable: true,
    });
    mockConfigHolder(3306);
    const result = Firewall.handleCommandLineArgs();
    expect(result).toBe(true);
    await new Promise(setImmediate);
    expect(mockedExecSync).toHaveBeenCalledWith(
      expect.stringContaining('netsh advfirewall firewall add rule')
    );
    expect(mockedApp.quit).toHaveBeenCalled();
  });

  it('should return false when not contain parameters', () => {
    process.argv = originalArgv;
    const result = Firewall.handleCommandLineArgs();
    expect(result).toBe(false);
    expect(mockedApp.quit).not.toHaveBeenCalled();
  });
});
