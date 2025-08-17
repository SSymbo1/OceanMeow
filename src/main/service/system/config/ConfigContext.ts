export interface ConfigContext<T> {
  read(): Promise<T>;
  read<K extends keyof T>(key: K): Promise<T[K]>;
  write(object: T): Promise<void>;
}
