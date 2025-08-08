import "reflect-metadata";
import { app } from 'electron';
import { join } from 'path';
import { DataSource } from "typeorm";
import { logger } from '#/util/Logger';
import { System } from '#/type/message/system';
import { Resource } from '#/type/resource';
import { TypeOrmElectronLogger } from '#/util/TypeORMLogger';
import { Library, Screenshots, SteamAccount, LibraryTime, LibraryDetail, ScreenDetail } from '#/entity';

export class SystemDB {

    private static instance: SystemDB;
    private _typeROM: DataSource | null = null;

    private constructor() { }

    public static getInstance(): SystemDB {
        if (!SystemDB.instance) {
            SystemDB.instance = new SystemDB();
        }
        return SystemDB.instance;
    }

    private getEnvDB(): string {
        return app.isPackaged
            ? join(process.resourcesPath, Resource.DB_DEV)
            : join(process.cwd(), Resource.ROOT_DEV, Resource.DB_DEV);
    }

    public async initDB() {
        if (this._typeROM) {
            logger.warn(System.SEQUELIZE_EXIST);
            return;
        }
        this._typeROM = new DataSource({
            type: "better-sqlite3",
            database: this.getEnvDB(),
            synchronize: false,
            logging: true,
            logger: new TypeOrmElectronLogger(),
            entities: [Library, Screenshots, SteamAccount, LibraryTime, LibraryDetail, ScreenDetail],
        });
        try {
            await this._typeROM.initialize();
        } catch (error) {
            logger.error(System.SEQUELIZE_CONNECT_ERROR, error);
            throw error;
        }
    }

    public get typeROM(): DataSource {
        if (!this._typeROM) {
            throw new Error(System.SEQUELIZE_NOT_EXIST);
        }
        return this._typeROM;
    }

    public async closeDB() {
        if (this._typeROM) {
            await this._typeROM.destroy();
        }
    }

}