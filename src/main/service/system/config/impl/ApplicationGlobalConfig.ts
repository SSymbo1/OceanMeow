import { ConfigContext } from '@/main/service/system/config/ConfigContext';
import { SystemIO } from '@/main/util/SystemIO';
import { ApplicationConfig } from '@/main/entity/dto/ApplicationConfig';

const CONFIG_MAP = {
  common: [
    'theme',
    'defaultHome',
    'defaultLanguage',
    'homeBackground',
    'closeApplication',
    'closeAskIgnored',
  ],
  library: [
    'libraryShow',
    'librarySort',
    'librarySortOrder',
    'screenSortOrder',
    'libraryCoverInfo',
    'defaultScreenDumpPath',
    'defaultScreenCreateFolder',
    'defaultScreenDateOrdered',
    'defaultScreenFolderType',
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

  write(object: ApplicationConfig): void {
    for (const [configFiled, configKeys] of Object.entries(CONFIG_MAP)) {
      const cfg = Object.fromEntries(
        configKeys.map((k) => [k, object[k as keyof ApplicationConfig]])
      );
      SystemIO.writeApplicationConfigSync(configFiled, cfg);
    }
  }
}
