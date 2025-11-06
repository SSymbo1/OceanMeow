/* eslint-disable @typescript-eslint/no-explicit-any */
import { app } from 'electron';
import log from 'electron-log';
import fs from 'node:fs';
import path from 'node:path';
import { Logger } from '@/main/util/Logger';
import { ApplicationResource } from '@/type/enum/Resource';

/* ---------- mock 区域 ---------- */
jest.mock('electron-log', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  verbose: jest.fn(),
  debug: jest.fn(),
  silly: jest.fn(),
  transports: {
    console: {
      level: undefined,
      format: undefined,
    },
    file: {
      level: undefined,
      format: undefined,
      maxSize: undefined,
      resolvePathFn: undefined,
    },
  },
}));
jest.mock('electron', () => ({
  app: {
    isPackaged: false,
  },
}));
jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

/* ---------- 工具 ---------- */
const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedApp = app as jest.Mocked<typeof app>;
const mockedLog = log as jest.Mocked<typeof log>;
(process as any).resourcesPath = '/fake-resources';

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 清空单例缓存
    (Logger as any).instance = undefined;
    // 默认配置文件不存在
    mockedFs.existsSync.mockReturnValue(false);
  });

  it('should be single instance', () => {
    const i1 = Logger.getInstance();
    const i2 = Logger.getInstance();
    expect(i1).toBe(i2);
  });

  it('should use default config when config file not exists (dev environment)', () => {
    Object.defineProperty(mockedApp, 'isPackaged', {
      value: false,
      writable: true,
    });
    Logger.getInstance();
    expect(mockedFs.existsSync).toHaveBeenCalledWith(
      path.join(process.cwd(), ApplicationResource.FILE_ROOT, ApplicationResource.CONFIG_FILE)
    );
    expect(mockedLog.transports.console.level).toBe('debug');
    expect(mockedLog.transports.console.format).toBe(
      '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {scope} >>> {text}'
    );
    expect(mockedLog.transports.file.level).toBeUndefined();
  });

  it('should merge config when config file exist (package environment)', () => {
    Object.defineProperty(mockedApp, 'isPackaged', {
      value: true,
      writable: true,
    });
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({
        logger: {
          fileLevel: 'warn',
          consoleLevel: 'error',
          maxSize: 5 * 1024 * 1024,
          logFolder: 'logs_prod',
        },
      })
    );
    Logger.getInstance();
    expect(mockedLog.transports.console.level).toBe('error');
    expect(mockedLog.transports.file.level).toBe('warn');
    expect(mockedLog.transports.file.maxSize).toBe(5 * 1024 * 1024);
    expect(mockedFs.mkdirSync).toHaveBeenCalledWith(path.join(process.resourcesPath, 'logs_prod'), {
      recursive: true,
    });
    expect(mockedLog.transports.file.resolvePathFn).toBeDefined();
    const logPath = mockedLog.transports.file.resolvePathFn!({} as any);
    expect(logPath).toMatch(/application_\d{8}\.log$/);
  });

  it('should forward to <electron-log> when method is ready', () => {
    const logger = Logger.getInstance();
    logger.error('e1', { a: 1 });
    logger.warn('w1');
    logger.info('i1');
    logger.verbose('v1');
    logger.debug('d1');
    logger.silly('s1');
    expect(mockedLog.error).toHaveBeenCalledWith('e1', { a: 1 });
    expect(mockedLog.warn).toHaveBeenCalledWith('w1');
    expect(mockedLog.info).toHaveBeenCalledWith('i1');
    expect(mockedLog.verbose).toHaveBeenCalledWith('v1');
    expect(mockedLog.debug).toHaveBeenCalledWith('d1');
    expect(mockedLog.silly).toHaveBeenCalledWith('s1');
  });
});
