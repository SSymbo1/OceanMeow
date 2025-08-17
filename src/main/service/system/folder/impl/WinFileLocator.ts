import { FileLocator } from '@/main/service/system/folder/FileLocator';
import { logger } from '@/main/util/Logger';
import { shell } from 'electron';
import fs from 'fs';

export class WinFileLocator implements FileLocator {
  locateFile(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      logger.error(`File ${filePath} does not exist`);
      return;
    }
    shell.showItemInFolder(filePath);
  }
}
