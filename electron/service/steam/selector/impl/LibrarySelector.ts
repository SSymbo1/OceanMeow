import { LibraryDetail } from "#/entity/LibraryDetail";
import { SteamDataSelector } from "#/service/steam/selector/SteamDataSelector";
import { SystemDB } from '#/util/SystemDB';
import { Brackets } from 'typeorm';

export class LibrarySelector implements SteamDataSelector<LibraryDetail> {
    async search(account: string, keyword?: string): Promise<LibraryDetail[]> {
        const libraryDetailRepo = SystemDB.getInstance().typeROM.getRepository(LibraryDetail);
        if (keyword) {
            return await libraryDetailRepo
                .createQueryBuilder("detail")
                .where("detail.steam_short_id = :id", { id: account })
                .andWhere(new Brackets(condition => {
                    condition
                        .orWhere("detail.app_id LIKE :keyword", { keyword: `%${keyword}%` })
                        .orWhere("detail.app_name LIKE :keyword", { keyword: `%${keyword}%` })
                        .orWhere("detail.app_localized LIKE :keyword", { keyword: `%${keyword}%` });
                }))
                .getMany();
        } else {
            return await libraryDetailRepo
                .createQueryBuilder("detail")
                .where("detail.steam_short_id = :id", { id: account })
                .getMany();
        }
    }

}