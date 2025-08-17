import { ConfigContext } from '@/main/service/system/config/ConfigContext';
import { SystemIO } from '@/main/util/SystemIO';
import { ApplicationConfig } from '@/main/entity/ApplicationConfig';

const CONFIG_MAP = {
  common: ['theme', 'defaultHome', 'defaultLanguage'],
  library: [
    'libraryShow',
    'librarySort',
    'librarySortOrder',
    'screenSortOrder',
    'libraryCoverInfo',
    'defaultScreenDumpPath',
    'defaultScreenCreateFolder',
    'defaultScreenDateOrdered',
    'defaultScreenForderType',
  ],
};

export class ApplicationGlobalConfig implements ConfigContext<ApplicationConfig> {
  private applicationConfig: ApplicationConfig = new ApplicationConfig();
  read(): Promise<ApplicationConfig>;
  read<K extends keyof ApplicationConfig>(key: K): Promise<ApplicationConfig[K]>;
  async read<K extends keyof ApplicationConfig>(
    key?: K
  ): Promise<ApplicationConfig | ApplicationConfig[K]> {
    const [common, library] = await Promise.all([
      SystemIO.readApplicationConfig('common'),
      SystemIO.readApplicationConfig('library'),
    ]);
    this.applicationConfig = { ...common, ...library };
    return key ? this.applicationConfig[key] : this.applicationConfig;
  }

  async write(object: ApplicationConfig): Promise<void> {
    const writes = Object.entries(CONFIG_MAP).map(([configFiled, configKeys]) => {
      const config = Object.fromEntries(
        configKeys.map((configItem) => [configItem, object[configItem as keyof ApplicationConfig]])
      );
      return SystemIO.writeApplicationConfig(configFiled, config);
    });
    await Promise.all(writes);
  }
}
