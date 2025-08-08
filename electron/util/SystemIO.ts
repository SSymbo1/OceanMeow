import fs from 'fs';
import path from 'path';
import VKVB from 'valve-key-values-binary';
import * as VDF from '@node-steam/vdf'
import { app } from 'electron';
import { Resource } from '#/type/resource'
import { System } from '#/type/message/system';
import { logger } from '#/util/Logger';

type ShortcutsRoot = {
    shortcuts: Shortcut[];
}

type Shortcut = {
    appid: number;
    AppName: string;
}

export class SystemIO {

    public static async readFile(filePath: string): Promise<string | null> {
        try {
            const file = fs.readFileSync(filePath, 'utf-8');
            return file;
        } catch (error) {
            logger.error(System.SYSTEM_IO_ERROR, error);
            return null;
        }
    }

    public static async readApplicationConfig(objectKey: string): Promise<any> {
        let configPath = app.isPackaged
            ? path.join(process.resourcesPath, Resource.APPLICATION_CONFIG)
            : path.join(process.cwd(), Resource.ROOT_DEV, Resource.APPLICATION_CONFIG);
        try {
            const config = fs.readFileSync(configPath, 'utf-8');
            return JSON.parse(config)[objectKey];
        } catch (error) {
            logger.error(System.READ_CONFIG_ERROR, error);
            return;
        }
    }

    public static async writeApplicationConfig(objectKey: string, objectValue: Object) {

    }

    public static async readSteamVDF(vdfPath: string, objectKey?: string) {
        const vdfFile = await this.readFile(vdfPath);
        if (vdfFile !== null) {
            try {
                const vdfParsed = VDF.parse(vdfFile);
                return objectKey === undefined ? vdfParsed : vdfParsed[objectKey] ?? null;
            } catch (error) {
                logger.error(System.VDF_READ_ERROR, error);
                return null;
            }
        } else {
            return null;
        }
    }

    public static async readSteamAppinfoVDF(vdfPath: string): Promise<Object | null> {
        const bufferFile = fs.readFileSync(vdfPath);
        if (bufferFile !== null) {
            try {
                const parseVDF = VKVB.parse<ShortcutsRoot>(bufferFile);
                return parseVDF.toJSON();
            } catch (error) {
                logger.error(System.VDF_READ_ERROR, error);
                return null;
            }
        } else {
            return null;
        }
    }

    public static async getFilePath(
        rootDir: string,
        targetFileName: string,
        ...fallbackFileNames: string[]
    ): Promise<string | null> {
        const searchFile = async (currentDir: string, fileName: string): Promise<string | null> => {
            try {
                await fs.promises.access(currentDir);
            } catch (error) {
                logger.error(System.SYSTEM_IO_ERROR, error);
                return null;
            }
            const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.isFile() && entry.name === fileName) {
                    return path.relative(rootDir, fullPath);
                }
                if (entry.isDirectory()) {
                    const result = await searchFile(fullPath, fileName);
                    if (result) return result;
                }
            }
            return null;
        };
        let result = await searchFile(rootDir, targetFileName);
        if (result) return result;
        for (const fallback of fallbackFileNames) {
            result = await searchFile(rootDir, fallback);
            if (result) return result;
        }
        return null;
    }

}
