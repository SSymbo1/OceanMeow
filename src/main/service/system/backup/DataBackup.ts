import { SteamDumpConfig } from '@/type/electron/entity/SteamDumpConfig';

export interface DataBackup<T> {
  dump(steamPath: string, dumpConfig: SteamDumpConfig, files: string[]): Promise<T>;
  config(appID: string, steamID: string): Promise<SteamDumpConfig>;
}
