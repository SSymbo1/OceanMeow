import { ipcMain } from 'electron';
import { logger } from '@/main/util/Logger';

export function loggerIPC() {
  ipcMain.handle('log:info', (_, message) => {
    logger.info(message);
  });
  ipcMain.handle('log:error', (_, message) => {
    logger.error(message);
  });
  ipcMain.handle('log:warn', (_, message) => {
    logger.warn(message);
  });
}
