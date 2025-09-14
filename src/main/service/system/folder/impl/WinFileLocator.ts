import { FileLocator } from '@/main/service/system/folder/FileLocator';
import { logger } from '@/main/util/Logger';
import { shell } from 'electron';
import { ExceptionMessage } from '@/type/enum/Message';
import fs from 'fs';

export class WinFileLocator implements FileLocator {
  locateFile(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      logger.error(ExceptionMessage.FILE_NOT_EXIST_EXCEPTION.replace('{file}', filePath));
      return;
    }
    shell.showItemInFolder(filePath);
  }
}
