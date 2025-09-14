import { SteamDataCollector } from '@/main/service/steam/collector/SteamDataCollector';
import { SteamAccount } from '@/main/entity';
import { SteamResource } from '@/type/enum/Resource';
import { SystemDB } from '@/main/util/SystemDB';
import { SystemIO } from '@/main/util/SystemIO';
import { join } from 'path';

interface LoginUsers {
  AccountName: string;
  PersonaName: string;
  Timestamp: string;
}

interface LoginUsersResult {
  [key: string]: LoginUsers;
}
export class AccountCollector implements SteamDataCollector<SteamAccount> {
  async collect(steamInstallPath: string): Promise<SteamAccount[]> {
    const steamAccountRepo = SystemDB.getInstance().typeROM.getRepository(SteamAccount);
    const vdfResult: LoginUsersResult = await SystemIO.readSteamVDF(
      join(steamInstallPath, SteamResource.LOGIN_USER_VDF),
      'users'
    );
    const steamAccounts: SteamAccount[] = [];
    for (const [key, value] of Object.entries(vdfResult)) {
      steamAccounts.push(
        steamAccountRepo.create({
          accountId: key,
          steamId: String(BigInt(key) - BigInt(SteamResource.ID_CONVERT)),
          accountName: value.AccountName,
          personaName: value.PersonaName,
          avatar: `${SteamResource.AVATAR_CACHE}/${key}.png`,
          lastLogin: value.Timestamp,
        })
      );
    }
    return steamAccounts.length !== 0 ? await steamAccountRepo.save(steamAccounts) : [];
  }
}
