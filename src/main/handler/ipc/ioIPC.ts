import { ipcMain } from 'electron';
import { LocalContext } from '@/main/service/steam/context/impl/LocalContext';
import { WinFileLocator } from '@/main/service/system/folder/impl/WinFileLocator';

const localContext = new LocalContext();
const fileLocator = new WinFileLocator();

export function ioIPC() {
  ipcMain.handle('file:locate', (_, filePath: string) => {
    fileLocator.locateFile(filePath);
  });
  ipcMain.handle('reg:steam', async () => {
    return await localContext.regGetSteamInstallPath();
  });
}
