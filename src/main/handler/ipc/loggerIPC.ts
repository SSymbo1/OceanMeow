import { ipcMain } from 'electron';
import { logger } from '@/main/util/Logger';

export function loggerIPC() {
  ipcMain.handle('log:info', (event, message) => {
    logger.info(message);
  });
  ipcMain.handle('log:error', (event, message) => {
    logger.error(message);
  });
  ipcMain.handle('log:warn', (event, message) => {
    logger.warn(message);
  });
}
