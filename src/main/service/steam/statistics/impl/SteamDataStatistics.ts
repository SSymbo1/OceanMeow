import { LibraryDetail, ScreenDetail, SteamStatistics } from '@/main/entity';
import { DataStatistics } from '../DataStatistics';
import { SystemDB } from '@/main/util/SystemDB';
import { Between } from 'typeorm';

export class SteamDataStatistics implements DataStatistics<SteamStatistics> {
  async accountDataStatistics(accountID: string): Promise<SteamStatistics> {
    const libraryRepo = SystemDB.getInstance().typeROM.getRepository(LibraryDetail);
    const screenshotRepo = SystemDB.getInstance().typeROM.getRepository(ScreenDetail);
    const [totalGames, totalHours, totalScreens] = await Promise.all([
      libraryRepo
        .createQueryBuilder('lib')
        .select('COUNT(lib.app_id)', 'totalGames')
        .where('lib.steam_short_id = :id', { id: accountID })
        .getRawOne<{ totalGames: string | null }>(),
      libraryRepo
        .createQueryBuilder('lib')
        .select('SUM(lib.play_time_hour)', 'totalHours')
        .where('lib.steam_short_id = :id', { id: accountID })
        .getRawOne<{ totalHours: string | null }>(),
      screenshotRepo
        .createQueryBuilder('screen')
        .select('COUNT(screen.screen_image)', 'totalScreen')
        .where('screen.steam_short_id = :id', { id: accountID })
        .getRawOne<{ totalScreen: string | null }>(),
    ]);
    const { pictures, names } = await this.gameScreenStatistics(accountID);
    return {
      totalGames: Number(totalGames?.totalGames ?? 0),
      totalHoursPlayed: Number(totalHours?.totalHours ?? 0),
      totalScreenshots: Number(totalScreens?.totalScreen ?? 0),
      heroPictures: pictures,
      appNames: names,
    } as SteamStatistics;
  }
  async gameScreenStatistics(accountID: string): Promise<{
    pictures: string[];
    names: string[];
  }> {
    const libraryRepo = SystemDB.getInstance().typeROM.getRepository(LibraryDetail);
    const screenshotRepo = SystemDB.getInstance().typeROM.getRepository(ScreenDetail);
    // 游玩时间最长
    const mostPlayed = await libraryRepo.findOne({
      select: ['appHero', 'appName'],
      where: { shortId: accountID },
      order: { timeMinute: 'DESC' },
    });
    // 截图最多
    const mostScreen = await libraryRepo.findOne({
      select: ['appHero', 'appName'],
      where: { shortId: accountID },
      order: { screenCount: 'DESC' },
    });
    // 最近截图游戏
    const latestShotRec = await screenshotRepo.findOne({
      select: ['appId'],
      where: { shortId: accountID },
      order: { creation: 'DESC' },
    });
    const latestShotGame = latestShotRec
      ? await libraryRepo.findOne({
          select: ['appHero', 'appName'],
          where: { shortId: accountID, appId: latestShotRec.appId },
        })
      : null;
    // 最近游玩游戏
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    const recentPlayed = await libraryRepo.findOne({
      select: ['appHero', 'appName'],
      where: {
        shortId: accountID,
        lastPlay: Between(fifteenDaysAgo.toISOString(), new Date().toISOString()),
      },
      order: { lastPlay: 'DESC' },
    });
    // 匹配结果
    const resultList = [mostPlayed, mostScreen, latestShotGame, recentPlayed].filter(
      (g): g is LibraryDetail => g !== null
    );
    return {
      pictures: resultList.map((g) => g.appHero),
      names: resultList.map((g) => g.appName),
    };
  }
}
