export interface SteamContext {
  regGetSteamInstallPath(): Promise<string | null>;
  validateSteamInstallPath(steamPath: string): boolean;
}
