import { ipcMain } from 'electron';
import { start, stop } from '@/main/server/app';

export function serverIPC() {
  ipcMain.handle('server:start', async () => await start());
  ipcMain.handle('server:stop', async () => await stop());
}
