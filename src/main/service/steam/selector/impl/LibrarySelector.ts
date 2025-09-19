import { LibraryDetail } from '@/main/entity/po/LibraryDetail';
import { SteamDataSelector } from '@/main/service/steam/selector/SteamDataSelector';
import { SystemDB } from '@/main/util/SystemDB';
import { Brackets } from 'typeorm';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';

export class LibrarySelector implements SteamDataSelector<LibraryDetail> {
  /**
   * 根据账号和关键词搜索库详情信息
   * @param {string} account - 用户Steam短id
   * @param {string} [keyword] - 可选的搜索关键词
   * @returns {Promise<LibraryDetail[]>} 返回用户库信息数组
   * @example
   * // 示例用法
   * const results = await search('user123', 'game');
   * @description 该方法会根据配置中的排序方式对结果进行排序：
   * - librarySort 为 '0' 时，按 screenCount 排序
   * - librarySort 为 '1' 时，按 timeHour 排序
   * - 其他情况按 lastPlay 排序
   *
   * 排序顺序由 libraryConfig.librarySortOrder 决定：
   * - true 表示升序 (ASC)
   * - false 或未定义表示降序 (DESC)
   *
   * 当提供关键词时，会在 app_id、app_name 和 app_localized 字段中进行模糊匹配
   */
  async search(account: string, keyword?: string): Promise<LibraryDetail[]> {
    let sort: string;
    const libraryDetailRepo = SystemDB.getInstance().typeROM.getRepository(LibraryDetail);
    const applicationConfigHolder = new ApplicationConfigHolder();
    const libraryConfig = await applicationConfigHolder.read('library');
    if (libraryConfig.librarySort === '0') {
      sort = 'detail.screenCount';
    } else if (libraryConfig.librarySort === '1') {
      sort = 'detail.timeHour';
    } else {
      sort = 'detail.lastPlay';
    }
    if (keyword) {
      return await libraryDetailRepo
        .createQueryBuilder('detail')
        .where('detail.steam_short_id = :id', { id: account })
        .andWhere(
          new Brackets((condition) => {
            condition
              .orWhere('detail.app_id LIKE :keyword', { keyword: `%${keyword}%` })
              .orWhere('detail.app_name LIKE :keyword', { keyword: `%${keyword}%` })
              .orWhere('detail.app_localized LIKE :keyword', { keyword: `%${keyword}%` });
          })
        )
        .orderBy(sort, libraryConfig.librarySortOrder ? 'ASC' : 'DESC')
        .getMany();
    } else {
      return await libraryDetailRepo
        .createQueryBuilder('detail')
        .where('detail.steam_short_id = :id', { id: account })
        .orderBy(sort, libraryConfig.librarySortOrder ? 'ASC' : 'DESC')
        .getMany();
    }
  }
}
