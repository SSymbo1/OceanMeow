/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { app } from 'electron';
import { DataSource } from 'typeorm';
import { SystemDB } from '@/main/util/SystemDB';
import { logger } from '@/main/util/Logger';
import { TypeOrmElectronLogger } from '@/main/util/TypeORMLogger';
import { join } from 'path';
import { ExceptionMessage, AlertMessage } from '@/type/enum/Message';
import { ApplicationResource } from '@/type/enum/Resource';
import * as entity from '@/main/entity';

jest.mock('electron', () => ({
  app: { isPackaged: false },
}));
jest.mock('@/main/util/Logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('typeorm', () => ({
  DataSource: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(),
    destroy: jest.fn(),
  })),
}));
jest.mock('@/main/util/TypeORMLogger', () => ({
  TypeOrmElectronLogger: jest.requireActual('@/main/util/TypeORMLogger').TypeOrmElectronLogger,
}));
jest.mock('@/main/entity', () => ({}));
(process as any).resourcesPath = '/fake-resources';

describe('SystemDB', () => {
  let systemDB: SystemDB;

  beforeEach(() => {
    jest.clearAllMocks();
    (SystemDB as any).instance = undefined;
    systemDB = SystemDB.getInstance();
  });

  it('should be single instance', () => {
    const i1 = SystemDB.getInstance();
    const i2 = SystemDB.getInstance();
    expect(i1).toBe(i2);
  });

  it('should ensure database path correct (dev environment)', () => {
    Object.defineProperty(app, 'isPackaged', { value: false, writable: true });
    const expected = join(
      process.cwd(),
      ApplicationResource.FILE_ROOT,
      ApplicationResource.DB_FILE
    );
    expect(systemDB['getEnvDB']()).toBe(expected);
  });

  it('should ensure database path correct (package environment)', () => {
    Object.defineProperty(app, 'isPackaged', { value: true, writable: true });
    const expected = join(process.resourcesPath, ApplicationResource.DB_FILE);
    expect(systemDB['getEnvDB']()).toBe(expected);
  });

  it('should alert and return when repeat initialization instance', async () => {
    (systemDB as any)._typeROM = {} as DataSource;
    await systemDB.initDB();
    expect(logger.warn).toHaveBeenCalledWith(AlertMessage.DB_CONNECTION_EXIST_ALERT);
  });

  it('should init successfully', async () => {
    const mockDataSource = {
      initialize: jest.fn().mockResolvedValue(undefined),
    } as any;
    (DataSource as jest.Mock).mockReturnValue(mockDataSource);
    await systemDB.initDB();
    expect(DataSource).toHaveBeenCalledWith({
      type: 'better-sqlite3',
      database: systemDB['getEnvDB'](),
      synchronize: false,
      logging: true,
      logger: expect.any(TypeOrmElectronLogger),
      entities: [
        entity.Library,
        entity.Screenshots,
        entity.SteamAccount,
        entity.LibraryTime,
        entity.LibraryDetail,
        entity.ScreenDetail,
        entity.SteamDumpConfig,
        entity.VdfTracker,
      ],
    });
    expect(mockDataSource.initialize).toHaveBeenCalled();
  });

  it('should log and throw exception when init fail', async () => {
    const error = new Error('init failed');
    const mockDataSource = {
      initialize: jest.fn().mockRejectedValue(error),
    } as any;
    (DataSource as jest.Mock).mockReturnValue(mockDataSource);

    await expect(systemDB.initDB()).rejects.toThrow(error);
    expect(logger.error).toHaveBeenCalledWith(ExceptionMessage.DB_EXCEPTION, error);
  });

  it('should colse database successfully', async () => {
    const mockDestroy = jest.fn().mockResolvedValue(undefined);
    (systemDB as any)._typeROM = { destroy: mockDestroy } as unknown as DataSource;
    await systemDB.closeDB();
    expect(mockDestroy).toHaveBeenCalled();
  });
});
