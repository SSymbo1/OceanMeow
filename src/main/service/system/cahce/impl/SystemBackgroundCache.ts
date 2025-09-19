import { BackgroundImage } from '@/main/entity';
import { SystemCache } from '../SystemCache';
import { app } from 'electron';
import { join, parse } from 'path';
import { mkdirSync, readdirSync, copyFileSync } from 'fs';
import { ApplicationConfigHolder } from '../../config/impl/ApplicationConfigHolder';
import { ApplicationResource } from '@/type/enum/Resource';

export class SystemBackgroundCache implements SystemCache<BackgroundImage> {
  async initApplicationCacheFolder(): Promise<void> {
    const configHolder = new ApplicationConfigHolder();
    const cacheConfig = await configHolder.read('cache');
    if (app.isPackaged) {
      mkdirSync(join(process.resourcesPath, cacheConfig.cacheFolder), { recursive: true });
    } else {
      mkdirSync(join(process.cwd(), ApplicationResource.FILE_ROOT, cacheConfig.cacheFolder), {
        recursive: true,
      });
    }
  }

  async readApplicationCacheFiles(fileName?: string): Promise<BackgroundImage[]> {
    const configHolder = new ApplicationConfigHolder();
    const cacheConfig = await configHolder.read('cache');
    const commonConfig = await configHolder.read('common');
    const backgroundLocal = commonConfig.homeBackground;
    const cacheDir = app.isPackaged
      ? join(process.resourcesPath, cacheConfig.cacheFolder)
      : join(process.cwd(), ApplicationResource.FILE_ROOT, cacheConfig.cacheFolder);
    const cacheFiles: string[] = fileName ? [fileName] : readdirSync(cacheDir);
    const backgroundImages: BackgroundImage[] = cacheFiles.map((file) => {
      const { base } = parse(file);
      return {
        fileName: base,
        filePath: cacheDir,
        isBackground: base === backgroundLocal,
      };
    });
    return backgroundImages;
  }

  async writeApplicationCacheFiles(fileName: string): Promise<void> {
    const configHolder = new ApplicationConfigHolder();
    const cacheConfig = await configHolder.read('cache');
    const commonConfig = await configHolder.read('common');
    if (app.isPackaged) {
      copyFileSync(
        fileName,
        join(process.resourcesPath, cacheConfig.cacheFolder, parse(fileName).base)
      );
    } else {
      copyFileSync(
        fileName,
        join(
          process.cwd(),
          ApplicationResource.FILE_ROOT,
          cacheConfig.cacheFolder,
          parse(fileName).base
        )
      );
    }
    configHolder.write({
      common: {
        ...commonConfig,
        homeBackground: parse(fileName).base,
      },
    });
  }
}
