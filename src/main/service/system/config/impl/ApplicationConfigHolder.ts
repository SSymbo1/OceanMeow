import { ConfigContext } from '../ConfigContext';
import { ApplicationConfig } from '@/main/entity/dto/Application';
import { SystemIO } from '@/main/util/SystemIO';

export class ApplicationConfigHolder implements ConfigContext<ApplicationConfig> {
  read(): Promise<ApplicationConfig>;
  read<K extends keyof ApplicationConfig>(key: K): Promise<ApplicationConfig[K]>;
  async read<K extends keyof ApplicationConfig>(
    key?: K
  ): Promise<ApplicationConfig | ApplicationConfig[K]> {
    const applicationConfig = new ApplicationConfig();
    if (key !== undefined) {
      const configValue = await SystemIO.readApplicationConfig(key);
      return configValue ?? applicationConfig[key];
    }
    const configKeys = (Object.keys(applicationConfig) as Array<keyof ApplicationConfig>).filter(
      (k) => typeof (applicationConfig as any)[k] !== 'function'
    );
    const values = await Promise.all(
      configKeys.map(async (k) => await SystemIO.readApplicationConfig(k))
    );
    return configKeys.reduce<ApplicationConfig>((acc, k, i) => {
      if (values[i] !== undefined) (acc as any)[k] = values[i];
      return acc;
    }, applicationConfig);
  }
  write(object: ApplicationConfig): void {
    const applicationConfig = new ApplicationConfig();
    const entries = Object.entries(applicationConfig) as Array<[keyof ApplicationConfig, any]>;
    for (const [configField, defaultSection] of entries) {
      const configValue = Object.fromEntries(
        Object.keys(defaultSection).map((k) => [k, (object as any)[configField][k]])
      );
      SystemIO.writeApplicationConfigSync(configField, configValue);
    }
  }
}
