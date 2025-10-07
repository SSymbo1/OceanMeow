import { ConfigContext } from '../ConfigContext';
import { ApplicationConfig } from '@/main/entity/dto/ApplicationConfig';
import { SystemIO } from '@/main/util/SystemIO';

export class ApplicationConfigHolder implements ConfigContext<ApplicationConfig> {
  read(): Promise<ApplicationConfig>;
  /**
   * 读取应用程序配置的方法
   * @async
   * @template K - ApplicationConfig 的键类型
   * @param {keyof ApplicationConfig} [key] - 可选的配置键名，如果提供则只读取该键对应的配置
   * @returns {Promise<ApplicationConfig | ApplicationConfig[K]>}
   *         - 如果未提供 key，返回完整的 ApplicationConfig 对象
   *         - 如果提供了 key，返回该键对应的配置值 ApplicationConfig[K]
   * @example
   * // 读取完整配置
   * const fullConfig = await appConfig.read();
   * // 读取特定配置项
   * const specificConfig = await appConfig.read('database');
   */
  async read<K extends keyof ApplicationConfig>(key?: K): Promise<ApplicationConfig[K]>;
  async read<K extends keyof ApplicationConfig>(
    key?: K
  ): Promise<ApplicationConfig | ApplicationConfig[K]> {
    const defaultConfig = new ApplicationConfig();
    if (key) {
      const config = await SystemIO.readApplicationConfig(key);
      return this.mergeConfig(defaultConfig[key], config) as ApplicationConfig[K];
    }
    const fullConfig: any = {};
    for (const k of Object.keys(defaultConfig) as Array<keyof ApplicationConfig>) {
      const config = await SystemIO.readApplicationConfig(k);
      fullConfig[k] = this.mergeConfig(defaultConfig[k], config);
    }
    return fullConfig as ApplicationConfig;
  }

  /**
   * 写入应用程序配置信息，合并现有配置与新配置
   * @async
   * @param {ApplicationConfig | Partial<ApplicationConfig>} object - 要写入的应用程序配置对象，可以是完整配置或部分配置
   * @returns {Promise<void>} - 返回一个Promise，在写入操作完成时解析
   * @throws {Error} - 如果读取现有配置或写入配置过程中发生错误
   * @description
   * 此方法会执行以下操作：
   * 1. 异步读取当前配置
   * 2. 创建当前配置的深拷贝作为基础
   * 3. 遍历输入对象的所有键，将新配置合并到当前配置中
   * 4. 将合并后的配置写入系统
   * 注意：合并时会保留现有配置中未在新配置中指定的字段
   * @example
   * // 写入完整配置
   * await appConfig.write(fullConfig);
   * // 写入部分配置
   * await appConfig.write({ database: { host: 'localhost', port: 3306 } });
   */
  write(object: ApplicationConfig): void;
  write(object: Partial<ApplicationConfig>): void;
  async write(object: ApplicationConfig | Partial<ApplicationConfig>): Promise<void> {
    const current = await this.read();
    const next: any = { ...current };
    for (const k of Object.keys(object) as Array<keyof ApplicationConfig>) {
      next[k] = { ...current[k], ...object[k] };
    }
    SystemIO.writeApplicationConfig(next);
  }

  /**
   * 合并配置对象的私有方法
   * @template T - 继承自Record<string, any>的泛型类型，表示配置对象的类型
   * @param {T} templateConfig - 模板配置对象，作为合并的基础
   * @param {any} [originConfig] - 可选的原始配置对象，用于覆盖模板配置
   * @returns {T} 返回一个新的配置对象，它是模板配置和原始配置的合并结果
   * @description 该方法会创建一个新的配置对象，首先复制模板配置的所有属性，
   * 然后用原始配置中非空且存在的属性值覆盖对应的模板配置值。
   * 如果原始配置不存在或不是对象，则直接返回模板配置的副本。
   */
  private mergeConfig<T extends Record<string, any>>(templateConfig: T, originConfig?: any): T {
    if (!originConfig || typeof originConfig !== 'object') return { ...templateConfig };
    const res = { ...templateConfig };
    for (const key of Object.keys(templateConfig)) {
      if (originConfig[key] == null || originConfig[key] === '') continue;
      (res as any)[key] = originConfig[key];
    }
    return res;
  }
}
