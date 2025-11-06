import { ScreenDetail } from '@/main/entity';
import { DataBackup } from '@/main/service/system/backup/DataBackup';
import { SystemDB } from '@/main/util/SystemDB';
import { SteamDumpConfig } from '@/main/entity/po/SteamDumpConfig';
import { DumpFolderType, CreateFolder, OrderByDate } from '@/type/enum/Option';
import { logger } from '@/main/util/Logger';
import { Brackets } from 'typeorm';
import { ExceptionMessage } from '@/type/enum/Message';
import fs from 'node:fs';
import path from 'node:path';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';

type ScreenDumpResult = {
  app_id: string;
  steam_id: string;
  effected: boolean;
};

export class ScreenshotBackup implements DataBackup<ScreenDumpResult> {
  /**
   * 导出指定应用的截图数据
   * @param {string} steamPath - Steam客户端的安装路径
   * @param {SteamDumpConfig} dumpConfig - 截图导出配置对象，包含应用ID和Steam账号ID等信息
   * @param {string[]} files - 需要导出的截图索引列表
   * @returns {Promise<ScreenDumpResult>} 返回包含导出结果的Promise，包含应用ID、Steam账号ID和成功导出的数量
   * @throws {Error} 当数据库查询失败或截图导出过程中出现错误时抛出
   */
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

  /**
   * 配置Steam转储设置
   * @async
   * @param {string} appID - 应用程序ID
   * @param {string} steamID - Steam账户ID
   * @returns {Promise<SteamDumpConfig>} 返回Steam转储配置对象，如果不存在则返回默认配置
   * @throws {Error} 当数据库查询或默认配置读取失败时可能抛出错误
   */
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

  /**
   * 将屏幕截图转储到指定路径
   * @param steamPath Steam程序路径
   * @param config 转储配置信息
   * @param screens 截图详细信息列表
   * @returns 转储是否成功
   * @throws 当转储过程中发生异常时抛出
   */
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

  /**
   * 根据配置构建转储目标路径
   * @param {SteamDumpConfig} config - Steam转储配置对象，包含应用信息、路径等
   * @returns {string} 返回处理后的转储目标路径字符串
   * @throws {Error} 当路径创建失败时可能抛出错误
   * @description 此方法根据配置中的文件夹类型选择不同的文件夹名称：
   * 1. 默认类型使用应用ID作为文件夹名
   * 2. 应用名称类型使用应用名称作为文件夹名
   * 3. 本地化类型使用应用本地化名称为文件夹名
   * 4. 其他情况使用配置中指定的文件夹名
   *
   * 文件夹名称会进行以下处理：
   * - 移除非法字符：< > : " | ? *
   * - 去除首尾空白
   * - 替换首尾的点为下划线
   *
   * 如果目标路径不存在，则会创建该目录
   */
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

  /**
   * 构建按日期排序的dump目标文件夹结构
   * @param {string} dumpPath - dump文件的基础路径
   * @param {ScreenDetail[]} screens - 截图详情数组，包含每个截图的创建时间等信息
   * @returns {Record<string, ScreenDetail[]>} 返回一个以日期为键、对应截图详情数组为值的对象
   * @description 该方法将截图按照创建日期分组，并为每个日期创建对应的目录结构。
   * 使用Object.groupBy方法将screens数组按照creation日期的前10位（YYYY-MM-DD）进行分组。
   * 然后检查每个日期对应的目录是否存在，如果不存在则创建。
   * 返回的Record对象中，key是日期字符串，value是对应日期的ScreenDetail数组。
   */
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

  /**
   * 将截图从Steam路径转储到指定路径
   * @param {string} steamPath - Steam客户端的安装路径
   * @param {string} dumpPath - 目标转储路径
   * @param {ScreenDetail[] | Record<string, ScreenDetail[]>} screens - 截图详情数组或按类别分组的截图详情记录
   * @returns {void}
   * @private
   */
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
