import { SteamDataCollector } from '@/main/service/steam/collector/SteamDataCollector';
import { Library, LibraryTime, SteamAccount } from '@/main/entity';
import { Steam } from '@/type/enum/steam';
import { SystemDB } from '@/main/util/SystemDB';
import { SystemIO } from '@/main/util/SystemIO';
import { join } from 'path';
import fs from 'fs';

export class LibraryCollector implements SteamDataCollector<Library> {
  /**
   * 收集Steam库信息的方法
   *
   * @param {string} steamInstallPath - Steam安装路径
   * @returns {Promise<Library[]>} 返回一个Promise，采集的Library对象数组
   *
   * @description
   * 该方法执行以下操作：
   * 1. 从数据库获取Steam账户信息
   * 2. 读取每个账户的本地配置文件，收集已安装的应用ID和游戏时间信息
   * 3. 检查库缓存文件夹，验证应用的实际存在性
   * 4. 过滤掉不存在于缓存文件夹中的应用
   * 5. 从应用信息VDF文件中获取应用的详细信息
   * 6. 创建Library对象并保存到数据库
   *
   * @example
   * const libraries = await collect('C:\\Program Files (x86)\\Steam');
   */
  async collect(steamInstallPath: string): Promise<Library[]> {
    const libraryRepo = SystemDB.getInstance().typeROM.getRepository(Library);
    const libraryTimeRepo = SystemDB.getInstance().typeROM.getRepository(LibraryTime);
    const accounts = await SystemDB.getInstance()
      .typeROM.getRepository(SteamAccount)
      .find({
        select: ['steamId'],
      });
    const localConfigAppId = new Set<string>();
    let localConfigAppTime: LibraryTime[] = [];
    const librarys: Library[] = [];
    for (const account of accounts) {
      const localConfigPath = join(
        steamInstallPath,
        Steam.LOCAL_CONFIG_VDF.replace('{user_id}', account.steamId)
      );
      const localConfigVDF = await SystemIO.readSteamVDF(localConfigPath, 'UserLocalConfigStore');
      const appInfo = localConfigVDF?.Software?.Valve?.Steam?.apps;
      Object.keys(appInfo).forEach((item) => {
        localConfigAppId.add(item);
      });
      for (const [key, value] of Object.entries(appInfo)) {
        const appTimeObject = value as { Playtime?: string; LastPlayed?: string };
        localConfigAppTime.push({
          accountId: account.steamId,
          appId: key,
          playTime: String(appTimeObject.Playtime) || '',
          lastPlay: String(appTimeObject.LastPlayed) || '',
        });
      }
    }
    const libraryCacheFolder = fs
      .readdirSync(join(steamInstallPath, Steam.LIBRARY_COVER_CAP), { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name);
    const folderSet = new Set(libraryCacheFolder);
    localConfigAppId.forEach((app) => {
      if (!folderSet.has(app)) localConfigAppId.delete(app);
    });
    localConfigAppTime = localConfigAppTime.filter((app) => folderSet.has(app.appId));
    await libraryTimeRepo.save(localConfigAppTime);
    const appInfoVDF: any | null = await SystemIO.readSteamAppinfoVDF(
      join(steamInstallPath, Steam.APPLICATION_VDF)
    );
    if (appInfoVDF !== null) {
      for (const app of Array.from(localConfigAppId)) {
        const common = appInfoVDF[app]?.appinfo?.common;
        const extended = appInfoVDF[app]?.extended;
        const picPath = await SystemIO.getFilePath(
          join(steamInstallPath, Steam.LIBRARY_COVER_CAP, String(app)),
          Steam.LIB_PIC_FILE,
          Steam.LIB_PIC_FILE_LOCAL,
          Steam.LIB_PIC_FILE_CAP
        );
        const picHeroPath = await SystemIO.getFilePath(
          join(steamInstallPath, Steam.LIBRARY_COVER_CAP, String(app)),
          Steam.LIB_PIC_HERO,
          Steam.LIB_PIC_HERO_LOCAL
        );
        const picLogoPath = await SystemIO.getFilePath(
          join(steamInstallPath, Steam.LIBRARY_COVER_CAP, String(app)),
          Steam.LIB_PIC_LOGO,
          Steam.LIB_PIC_LOGO_LOCAL
        );
        librarys.push(
          libraryRepo.create({
            appId: app,
            name: common.name || '',
            nameLocal:
              common.name_localized?.schinese ||
              common.name_localized?.english ||
              common.name ||
              '',
            savePath: '',
            libraryPic: `${Steam.LIBRARY_COVER_CAP}/${String(app)}/${picPath?.replace(/\\/g, '/')}`,
            libraryHero: `${Steam.LIBRARY_COVER_CAP}/${String(app)}/${picHeroPath?.replace(/\\/g, '/')}`,
            libraryLogo: `${Steam.LIBRARY_COVER_CAP}/${String(app)}/${picLogoPath?.replace(/\\/g, '/')}`,
            savePattern: '',
            saveRoot: '',
            developer: common?.associations[0]?.name || extended?.developer || '',
            appType: common.type || '',
          })
        );
      }
    }
    return await libraryRepo.save(librarys);
  }
}
