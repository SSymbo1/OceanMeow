import { SteamDataCollector } from "#/service/steam/collector/SteamDataCollector";
import { SteamAccount } from "#/entity";
import { Steam } from "#/type/steam";
import { SystemDB } from "#/util/SystemDB";
import { SystemIO } from "#/util/SystemIO";
import { join } from "path";

interface LoginUsers {
    AccountName: string,
    PersonaName: string,
    RememberPassword: string,
    WantsOfflineMode: string,
    SkipOfflineModeWarning: string,
    AllowAutoLogin: string,
    MostRecent: string,
    Timestamp: string,
}

interface LoginUsersResult {
    [key: string]: LoginUsers
}
export class AccountCollector implements SteamDataCollector<SteamAccount> {
    async collect(steamInstallPath: string): Promise<SteamAccount[]> {
        const steamAccountRepo = SystemDB.getInstance().typeROM.getRepository(SteamAccount);
        const vdfResult: LoginUsersResult = await SystemIO.readSteamVDF(
            join(steamInstallPath, Steam.LOGIN_USER_VDF),
            'users'
        );
        let steamAccounts: SteamAccount[] = [];
        for (const [key, value] of Object.entries(vdfResult)) {
            steamAccounts.push(steamAccountRepo.create({
                accountId: key,
                steamId: String(BigInt(key) - BigInt(Steam.ID_CONVERT)),
                accountName: value.AccountName,
                personaName: value.PersonaName,
                avator: `${Steam.AVATOR_CACHE}/${key}.png`,
                lastLogin: value.Timestamp
            }));
        }
        const result = await steamAccountRepo.save(steamAccounts);
        // const result = await steamAccountRepo.find()
        return result;
    }

}