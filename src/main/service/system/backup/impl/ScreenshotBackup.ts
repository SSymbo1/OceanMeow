import { ScreenDetail } from '@/main/entity';
import { DataBackup } from '@/main/service/system/backup/DataBackup';
import { SystemDB } from '@/main/util/SystemDB';
import { SteamDumpConfig } from '@/main/entity/po/SteamDumpConfig';
import { DumpFolderType, CreateFolder, OrderByDate } from '@/type/enum/Option';
import { logger } from '@/main/util/Logger';
import { Brackets } from 'typeorm';
import { ExceptionMessage } from '@/type/enum/Message';
import fs from 'fs';
import path from 'path';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';

type ScreenDumpResult = {
  app_id: string;
  steam_id: string;
  effected: boolean;
};

export class ScreenshotBackup implements DataBackup<ScreenDumpResult> {
  async dump(
    steamPath: string,
    dumpConfig: SteamDumpConfig,
    files: string[]
  ): Promise<ScreenDumpResult> {
    const screens = await SystemDB.getInstance()
      .typeROM.getRepository(ScreenDetail)
      .createQueryBuilder('detail')
      .where('detail.app_id = :app', { app: dumpConfig.appID })
      .andWhere(
        new Brackets((condition) => {
          condition
            .andWhere('detail.steam_short_id = :account', { account: dumpConfig.steamID })
            .andWhere('detail.screen_index in (:...files)', { files });
        })
      )
      .getMany();
    const effected = this.dumpScreenBuilder(steamPath, dumpConfig, screens);
    await SystemDB.getInstance().typeROM.getRepository(SteamDumpConfig).save(dumpConfig);
    return {
      app_id: dumpConfig.appID,
      steam_id: dumpConfig.steamID,
      effected: effected,
    };
  }

  async config(appID: string, steamID: string): Promise<SteamDumpConfig> {
    const config = await SystemDB.getInstance()
      .typeROM.getRepository(SteamDumpConfig)
      .createQueryBuilder('config')
      .where('config.app_id = :app', { app: appID })
      .andWhere(
        new Brackets((condition) => {
          condition.andWhere('config.steam_id = :account', { account: steamID });
        })
      )
      .getOne();
    if (!config) {
      const applicationConfigHolder = new ApplicationConfigHolder();
      const defaultDumpConfig = await applicationConfigHolder.read('library');
      return {
        appID: appID,
        steamID: steamID,
        dumpPath: defaultDumpConfig.defaultScreenDumpPath,
        createFolder: defaultDumpConfig.defaultScreenCreateFolder
          ? CreateFolder.ENABLE
          : CreateFolder.DISABLE,
        folderType: defaultDumpConfig.defaultScreenFolderType,
        folderName: '',
        orderByDate: defaultDumpConfig.defaultScreenDateOrdered
          ? OrderByDate.ENABLE
          : OrderByDate.DISABLE,
      } as SteamDumpConfig;
    } else {
      return config;
    }
  }

  private dumpScreenBuilder(
    steamPath: string,
    config: SteamDumpConfig,
    screens: ScreenDetail[]
  ): boolean {
    const dumpPath =
      config.createFolder === CreateFolder.ENABLE
        ? this.buildDumpTargetPath(config)
        : config.dumpPath;
    try {
      this.dumpScreen(
        steamPath,
        dumpPath,
        config.orderByDate === OrderByDate.ENABLE
          ? this.buildDumpTargetOrderedFolder(dumpPath, screens)
          : screens
      );
      return true;
    } catch (error) {
      logger.error(ExceptionMessage.DUMP_EXCEPTION, error);
      return false;
    }
  }

  private buildDumpTargetPath(config: SteamDumpConfig): string {
    let folderName: string;
    if (config.folderType === DumpFolderType.FOLDER_TYPE_DEFAULT) {
      folderName = config.appID;
    } else if (config.folderType === DumpFolderType.FOLDER_TYPE_APP_NAME) {
      folderName = config.appName;
    } else if (config.folderType === DumpFolderType.FOLDER_TYPE_APP_LOCALIZED) {
      folderName = config.appLocation;
    } else {
      folderName = config.folderName;
    }
    folderName = folderName
      .replace(/[<>:"|?*]/g, ' ')
      .trim()
      .replace(/^\.+|\.+$/g, '_');
    const dumpPath = path.join(config.dumpPath, folderName);
    if (!fs.existsSync(decodeURIComponent(dumpPath))) {
      fs.mkdirSync(decodeURIComponent(dumpPath));
    }
    return dumpPath;
  }

  private buildDumpTargetOrderedFolder(
    dumpPath: string,
    screens: ScreenDetail[]
  ): Record<string, ScreenDetail[]> {
    const orderedScreens = Object.groupBy(screens, (screen) =>
      screen.creation.slice(0, 10)
    ) as Record<string, ScreenDetail[]>;
    for (const day of Object.keys(orderedScreens)) {
      const dir = decodeURIComponent(path.join(dumpPath, day));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    }
    return orderedScreens;
  }

  private dumpScreen(
    steamPath: string,
    dumpPath: string,
    screens: ScreenDetail[] | Record<string, ScreenDetail[]>
  ) {
    if (Array.isArray(screens)) {
      for (const screen of screens) {
        const source = path.join(steamPath, screen.screenFull);
        const target = path.join(dumpPath, path.basename(screen.screenFull));
        fs.copyFileSync(source, target);
      }
    } else {
      for (const [key, value] of Object.entries(screens)) {
        this.dumpScreen(steamPath, path.join(dumpPath, key), value);
      }
    }
  }
}
