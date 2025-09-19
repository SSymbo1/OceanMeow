import { ScreenDetail } from '@/main/entity';
import { SteamDataSelector } from '@/main/service/steam/selector/SteamDataSelector';
import { SystemDB } from '@/main/util/SystemDB';
import { Brackets } from 'typeorm';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';

export class ScreenshotSelector implements SteamDataSelector<ScreenDetail> {
  /**
   * 根据账号,应用id和关键词搜索库详情信息
   * @param {string} account - Steam用户短ID
   * @param {string} appID - Steam游戏ID
   * @param {string} [keyword] - 可选的关键词，用于筛选截图创建时间
   * @returns {Promise<ScreenDetail[]>} 返回查询游戏截图信息数组
   * @throws {Error} 当数据库查询失败时可能抛出错误
   * @example
   * // 示例1: 使用关键词搜索
   * const results = await search('user123', 'app456', '2023-01-01');
   * @example
   * // 示例2: 不使用关键词搜索
   * const results = await search('user123', 'app456');
   * @description 该方法根据提供的账户和应用ID查询截图数据详情信息。
   * 如果提供了关键词，则额外筛选创建时间大于等于该关键词的记录。
   * 结果根据libraryConfig中的screenSortOrder参数决定升序或降序排列。
   */
  async search(account: string, appID: string, keyword?: string): Promise<ScreenDetail[]> {
    const screenDetailRepo = SystemDB.getInstance().typeROM.getRepository(ScreenDetail);
    const applicationConfigHolder = new ApplicationConfigHolder();
    const libraryConfig = await applicationConfigHolder.read('library');
    if (keyword) {
      return await screenDetailRepo
        .createQueryBuilder('detail')
        .where('detail.steam_short_id = :id', { id: account })
        .andWhere(
          new Brackets((condition) => {
            condition
              .andWhere('detail.app_id = :app', { app: appID })
              .andWhere('detail.screen_creation >= :time', { time: keyword });
          })
        )
        .orderBy('detail.screen_creation', libraryConfig.screenSortOrder ? 'ASC' : 'DESC')
        .getMany();
    } else {
      return await screenDetailRepo
        .createQueryBuilder('detail')
        .where('detail.steam_short_id = :id', { id: account })
        .andWhere(
          new Brackets((condition) => {
            condition.andWhere('detail.app_id = :app', { app: appID });
          })
        )
        .orderBy('detail.screen_creation', libraryConfig.screenSortOrder ? 'ASC' : 'DESC')
        .getMany();
    }
  }
}
