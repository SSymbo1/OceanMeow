import fs from 'fs';
import path from 'path';
import VKVB from 'valve-key-values-binary';
import * as VDF from '@node-steam/vdf';
import { app } from 'electron';
import { ApplicationResource } from '@/type/enum/Resource';
import { ExceptionMessage } from '@/type/enum/Message';
import { logger } from '@/main/util/Logger';

type ShortcutsRoot = {
  shortcuts: Shortcut[];
};

type Shortcut = {
  appid: number;
  AppName: string;
};

export class SystemIO {
  public static async readFile(filePath: string): Promise<string> {
    try {
      return await fs.promises.readFile(filePath, 'utf-8');
    } catch (error) {
      logger.error(ExceptionMessage.IO_EXCEPTION, error);
      return '';
    }
  }

  public static async readApplicationConfig(objectKey: string): Promise<any> {
    const configPath = app.isPackaged
      ? path.join(process.resourcesPath, ApplicationResource.CONFIG_FILE)
      : path.join(process.cwd(), ApplicationResource.FILE_ROOT, ApplicationResource.CONFIG_FILE);
    try {
      const config = await this.readFile(configPath);
      return JSON.parse(config)[objectKey];
    } catch (error) {
      logger.error(ExceptionMessage.VDF_EXCEPTION, error);
      return;
    }
  }

  public static writeApplicationConfigSync(objectKey: string, objectValue: object): void {
    const configPath = app.isPackaged
      ? path.join(process.resourcesPath, ApplicationResource.CONFIG_FILE)
      : path.join(process.cwd(), ApplicationResource.FILE_ROOT, ApplicationResource.CONFIG_FILE);

    const configRaw = fs.readFileSync(configPath, 'utf8');
    const configObj = JSON.parse(configRaw);
    configObj[objectKey] = objectValue;
    fs.writeFileSync(configPath, JSON.stringify(configObj, null, 2));
    fs.fsyncSync(fs.openSync(configPath, 'r+'));
  }

  public static async readSteamVDF(vdfPath: string, objectKey?: string) {
    const vdfFile = await this.readFile(vdfPath);
    if (vdfFile !== null) {
      try {
        const vdfParsed = VDF.parse(vdfFile);
        return objectKey === undefined ? vdfParsed : (vdfParsed[objectKey] ?? null);
      } catch (error) {
        logger.error(ExceptionMessage.VDF_EXCEPTION, error);
        return null;
      }
    } else {
      return null;
    }
  }

  public static async readSteamAppinfoVDF(vdfPath: string): Promise<object | null> {
    const bufferFile = fs.readFileSync(vdfPath);
    if (bufferFile !== null) {
      try {
        const parseVDF = VKVB.parse<ShortcutsRoot>(bufferFile);
        return parseVDF.toJSON();
      } catch (error) {
        logger.error(ExceptionMessage.VDF_EXCEPTION, error);
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
        logger.error(ExceptionMessage.IO_EXCEPTION, error);
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
