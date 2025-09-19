export interface SystemCache<T> {
  initApplicationCacheFolder(): Promise<void>;
  readApplicationCacheFiles(fileName?: string): Promise<T[]>;
  writeApplicationCacheFiles(fileName: string): Promise<void>;
}
