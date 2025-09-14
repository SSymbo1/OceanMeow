import { LibraryDetail } from '@/main/entity/po/LibraryDetail';
import { SteamDataSelector } from '@/main/service/steam/selector/SteamDataSelector';
import { SystemDB } from '@/main/util/SystemDB';
import { Brackets } from 'typeorm';
import { SystemIO } from '@/main/util/SystemIO';

export class LibrarySelector implements SteamDataSelector<LibraryDetail> {
  async search(account: string, keyword?: string): Promise<LibraryDetail[]> {
    let sort: string;
    const libraryDetailRepo = SystemDB.getInstance().typeROM.getRepository(LibraryDetail);
    const libraryConfig = await SystemIO.readApplicationConfig('library');
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
