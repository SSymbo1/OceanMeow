export interface SteamDataSelector<T> {
    search(account: string, keyword?: string, ...args: any): Promise<T[]>;
}