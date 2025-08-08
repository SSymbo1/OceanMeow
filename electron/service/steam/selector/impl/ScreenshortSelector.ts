import { ScreenDetail } from "#/entity";
import { SteamDataSelector } from "#/service/steam/selector/SteamDataSelector";
import { SystemDB } from "#/util/SystemDB";
import { Brackets } from 'typeorm';

export class ScreenshortSelector implements SteamDataSelector<ScreenDetail> {
    async search(account: string, appID: string, keyword?: string): Promise<ScreenDetail[]> {
        const screenDetailRepo = SystemDB.getInstance().typeROM.getRepository(ScreenDetail);
        if (keyword) {
            return await screenDetailRepo
                .createQueryBuilder("detail")
                .where("detail.steam_short_id = :id", { id: account })
                .andWhere(new Brackets(condition => {
                    condition
                        .andWhere("detail.app_id = :app", { app: appID })
                        .andWhere("detail.screen_creation >= :time", { time: keyword })
                }))
                .getMany()
        } else {
            return await screenDetailRepo
                .createQueryBuilder("detail")
                .where("detail.steam_short_id = :id", { id: account })
                .andWhere(new Brackets(condition => {
                    condition
                        .andWhere("detail.app_id = :app", { app: appID })
                }))
                .getMany()
        }
    }

}