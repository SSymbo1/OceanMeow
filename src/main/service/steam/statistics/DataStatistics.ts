export interface DataStatistics<T> {
  accountDataStatistics(accountID: string): Promise<T>;
}
