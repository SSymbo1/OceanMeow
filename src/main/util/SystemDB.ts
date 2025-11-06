import 'reflect-metadata';
import { app } from 'electron';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { logger } from '@/main/util/Logger';
import { AlertMessage, ExceptionMessage } from '@/type/enum/Message';
import { ApplicationResource } from '@/type/enum/Resource';
import { TypeOrmElectronLogger } from '@/main/util/TypeORMLogger';
import * as entity from '@/main/entity';

export class SystemDB {
  private static instance: SystemDB;
  private _typeROM: DataSource | null = null;

  private constructor() {}

  public static getInstance(): SystemDB {
    if (!SystemDB.instance) {
      SystemDB.instance = new SystemDB();
    }
    return SystemDB.instance;
  }

  private getEnvDB(): string {
    return app.isPackaged
      ? join(process.resourcesPath, ApplicationResource.DB_FILE)
      : join(process.cwd(), ApplicationResource.FILE_ROOT, ApplicationResource.DB_FILE);
  }

  public async initDB() {
    if (this._typeROM) {
      logger.warn(AlertMessage.DB_CONNECTION_EXIST_ALERT);
      return;
    }
    this._typeROM = new DataSource({
      type: 'better-sqlite3',
      database: this.getEnvDB(),
      synchronize: false,
      logging: true,
      logger: new TypeOrmElectronLogger(),
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
    try {
      await this._typeROM.initialize();
    } catch (error) {
      logger.error(ExceptionMessage.DB_EXCEPTION, error);
      throw error;
    }
  }

  public get typeROM(): DataSource {
    if (!this._typeROM) {
      throw new Error(AlertMessage.DB_CONNECTION_NOT_EXIST_ALERT);
    }
    return this._typeROM;
  }

  public async closeDB() {
    if (this._typeROM) {
      await this._typeROM.destroy();
    }
  }
}
