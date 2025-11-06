import { BackgroundImage } from '@/main/entity';
import { SystemCache } from '../SystemCache';
import { app } from 'electron';
import { join, parse } from 'node:path';
import { mkdirSync, readdirSync } from 'node:fs';
import { ApplicationConfigHolder } from '../../config/impl/ApplicationConfigHolder';
import { ApplicationResource } from '@/type/enum/Resource';
import { SystemImage } from '@/main/util/SystemImage';

export class SystemBackgroundCache implements SystemCache<BackgroundImage> {
  readonly THUMB_PATH = app.isPackaged
    ? join(process.resourcesPath, ApplicationResource.CACHE, ApplicationResource.THUMB)
    : join(
        process.cwd(),
        ApplicationResource.FILE_ROOT,
        ApplicationResource.CACHE,
        ApplicationResource.THUMB
      );
  readonly IMAGE_PATH = app.isPackaged
    ? join(process.resourcesPath, ApplicationResource.CACHE, ApplicationResource.IMAGE)
    : join(
        process.cwd(),
        ApplicationResource.FILE_ROOT,
        ApplicationResource.CACHE,
        ApplicationResource.IMAGE
      );

  async initApplicationCacheFolder(): Promise<void> {
    mkdirSync(this.THUMB_PATH, { recursive: true });
    mkdirSync(this.IMAGE_PATH, { recursive: true });
  }

  async readApplicationCacheFiles(fileName?: string): Promise<BackgroundImage[]> {
    const cacheFiles = fileName ? [fileName] : readdirSync(this.THUMB_PATH);
    const backgroundCacheList: BackgroundImage[] = cacheFiles.map((image) => {
      const { base } = parse(image);
      return {
        filePath: this.THUMB_PATH.replace(ApplicationResource.THUMB, ApplicationResource.IMAGE),
        fileName: base,
        thumbPath: this.THUMB_PATH,
        thumbName: base,
      };
    });
    return backgroundCacheList;
  }

  async writeApplicationCacheFiles(fileName: string): Promise<string> {
    const configHolder = new ApplicationConfigHolder();
    const commonConfig = await configHolder.read('common');
    await Promise.all([
      SystemImage.removeFolderImageByDate(this.THUMB_PATH, 3),
      SystemImage.removeFolderImageByDate(this.IMAGE_PATH, 3),
    ]);
    await Promise.all([
      SystemImage.imageCompress(fileName, this.THUMB_PATH, 'webp', 1),
      SystemImage.imageCompress(fileName, this.IMAGE_PATH, 'webp', 15),
    ]);
    configHolder.write({
      common: {
        ...commonConfig,
        homeBackground: parse(fileName).base,
      },
    });
    return `${parse(fileName).name}.webp`;
  }
}
