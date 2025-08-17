import { ScreenDetail } from '@/main/entity';
import { SteamDataSelector } from '@/main/service/steam/selector/SteamDataSelector';
import { SystemDB } from '@/main/util/SystemDB';
import { Brackets } from 'typeorm';
import { SystemIO } from '@/main/util/SystemIO';

export class ScreenshotSelector implements SteamDataSelector<ScreenDetail> {
  async search(account: string, appID: string, keyword?: string): Promise<ScreenDetail[]> {
    const screenDetailRepo = SystemDB.getInstance().typeROM.getRepository(ScreenDetail);
    const libraryConfig = await SystemIO.readApplicationConfig('library');
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
