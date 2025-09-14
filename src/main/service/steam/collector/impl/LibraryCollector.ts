import { SteamDataCollector } from '@/main/service/steam/collector/SteamDataCollector';
import { Library, LibraryTime, SteamAccount } from '@/main/entity';
import { SteamResource } from '@/type/enum/Resource';
import { SystemDB } from '@/main/util/SystemDB';
import { SystemIO } from '@/main/util/SystemIO';
import { join } from 'path';
import fs from 'fs';
import pLimit from 'p-limit';

export class LibraryCollector implements SteamDataCollector<Library> {
  /**
   * 采集Steam游戏库信息
   * @param steamInstallPath Steam安装路径
   * @returns Promise<Library[]> 返回采集到的游戏库信息数组
   *
   * 该方法执行以下步骤：
   * 1. 获取所有Steam账户信息
   * 2. 读取每个账户的localconfig.vdf文件，获取游戏库存信息
   * 3. 从库存信息中提取游戏ID和游戏时间记录
   * 4. 验证游戏是否存在于本地缓存中
   * 5. 读取appinfo.vdf文件获取游戏详细信息
   * 6. 为每个有效游戏创建Library对象并保存到数据库
   */
  async collect(steamInstallPath: string): Promise<Library[]> {
    const limit = pLimit(10);
    // 获取Repo对象并获取采集到的Steam账户
    const libraryRepo = SystemDB.getInstance().typeROM.getRepository(Library);
    const libraryTimeRepo = SystemDB.getInstance().typeROM.getRepository(LibraryTime);
    const accounts = await SystemDB.getInstance()
      .typeROM.getRepository(SteamAccount)
      .find({
        select: ['steamId'],
      });
    // 获取每个账户localconfig.vdf中的库存信息
    const accountLocalConfigVDF = await Promise.all(
      accounts.map((account) =>
        limit(async () => {
          const localConfigPath = join(
            steamInstallPath,
            SteamResource.LOCAL_CONFIG_VDF.replace('{user_id}', account.steamId)
          );
          const localConfigVDF = await SystemIO.readSteamVDF(
            localConfigPath,
            'UserLocalConfigStore'
          );
          const apps = localConfigVDF?.Software?.Valve?.Steam?.apps || {};
          return { accountId: account.steamId, apps };
        })
      )
    );
    // 根据采集的库存信息，获取每个账户的LibraryTime
    const localConfigAppID = new Set<string>();
    const localConfigAppTime: LibraryTime[] = [];
    accountLocalConfigVDF.forEach(({ accountId, apps }) => {
      Object.entries(apps).forEach(([appId, value]) => {
        localConfigAppID.add(appId);
        const { Playtime, LastPlayed } = value as any;
        localConfigAppTime.push({
          accountId,
          appId,
          playTime: String(Playtime || ''),
          lastPlay: String(LastPlayed || ''),
        });
      });
    });
    // 根据本地库缓存夹，过滤掉不存在的游戏，并根据过滤后的游戏信息转换为LibraryTime对象并保存
    const steamLibraryCacheFolder = fs
      .readdirSync(join(steamInstallPath, SteamResource.LIBRARY_COVER_CAP), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    const cacheSet = new Set(steamLibraryCacheFolder);
    const validAppID = Array.from(localConfigAppID).filter((id) => cacheSet.has(id));
    const validLibraryTimes = localConfigAppTime.filter((t) => cacheSet.has(t.appId));
    for (let i = 0; i < validLibraryTimes.length; i += 500) {
      const batch = validLibraryTimes.slice(i, i + 500);
      await libraryTimeRepo.save(batch);
    }
    // 获取本地的appinfo.vdf
    const appInfoPath = join(steamInstallPath, SteamResource.APPLICATION_VDF);
    const appInfoVDF: any = await SystemIO.readSteamAppinfoVDF(appInfoPath);
    if (!appInfoVDF) return [];
    // 根据过滤后的库存信息，获取库内游戏信息转换为Library对象并保存
    const libraries = (
      await Promise.all(
        validAppID.map(async (appID) =>
          limit(async () => {
            const common = appInfoVDF[appID]?.appinfo?.common;
            const extended = appInfoVDF[appID]?.extended;
            if (!common) return null;
            const [pic, picHero, picLogo] = await Promise.all([
              SystemIO.getFilePath(
                join(steamInstallPath, SteamResource.LIBRARY_COVER_CAP, appID),
                SteamResource.LIB_PIC_FILE,
                SteamResource.LIB_PIC_FILE_LOCAL,
                SteamResource.LIB_PIC_FILE_CAP,
                SteamResource.LIB_PIC_FILE_CAP_LOCAL
              ),
              SystemIO.getFilePath(
                join(steamInstallPath, SteamResource.LIBRARY_COVER_CAP, appID),
                SteamResource.LIB_PIC_HERO,
                SteamResource.LIB_PIC_HERO_LOCAL
              ),
              SystemIO.getFilePath(
                join(steamInstallPath, SteamResource.LIBRARY_COVER_CAP, appID),
                SteamResource.LIB_PIC_LOGO,
                SteamResource.LIB_PIC_LOGO_LOCAL
              ),
            ]);
            return libraryRepo.create({
              appId: appID,
              name: common.name || '',
              nameLocal:
                common.name_localized?.schinese ||
                common.name_localized?.english ||
                common.name ||
                '',
              savePath: '',
              libraryPic: `${SteamResource.LIBRARY_COVER_CAP}/${appID}/${pic?.replace(/\\/g, '/')}`,
              libraryHero: `${SteamResource.LIBRARY_COVER_CAP}/${appID}/${picHero?.replace(/\\/g, '/')}`,
              libraryLogo: `${SteamResource.LIBRARY_COVER_CAP}/${appID}/${picLogo?.replace(/\\/g, '/')}`,
              savePattern: '',
              saveRoot: '',
              developer: common?.associations?.[0]?.name || extended?.developer || '',
              appType: common.type || '',
            });
          })
        )
      )
    ).filter(Boolean) as Library[];
    for (let i = 0; i < libraries.length; i += 500) {
      const batch = libraries.slice(i, i + 500);
      await libraryRepo.save(batch);
    }
    return libraries;
  }
}
