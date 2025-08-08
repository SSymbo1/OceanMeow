export interface SteamDataCollector<T> {
    collect(steamInstallPath: string): Promise<T[]>
}