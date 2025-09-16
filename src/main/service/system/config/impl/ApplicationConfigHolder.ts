import { ConfigContext } from '../ConfigContext';
import { ApplicationConfig } from '@/main/entity/dto/ApplicationConfig';
import { SystemIO } from '@/main/util/SystemIO';

export class ApplicationConfigHolder implements ConfigContext<ApplicationConfig> {
  read(): Promise<ApplicationConfig>;
  read<K extends keyof ApplicationConfig>(key: K): Promise<ApplicationConfig[K]>;
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
  write(object: ApplicationConfig): void;
  write(object: Partial<ApplicationConfig>): void;
  async write(object: ApplicationConfig | Partial<ApplicationConfig>): Promise<void> {
    const template = new ApplicationConfig();
    const updates = object as Partial<ApplicationConfig>;
    const updateConfig: any = {};
    await Promise.all(
      Object.keys(updates).map(async (configKey) => {
        const config = await this.read(configKey as keyof ApplicationConfig);
        updateConfig[configKey] = {
          ...template[configKey as keyof ApplicationConfig],
          ...config,
          ...updates[configKey as keyof ApplicationConfig],
        };
      })
    );
    SystemIO.writeApplicationConfig({ ...template, ...updateConfig });
  }
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
