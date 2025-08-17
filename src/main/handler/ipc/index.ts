import { steamIPC } from '@/main/handler/ipc/steamIPC';
import { ioIPC } from '@/main/handler/ipc/ioIPC';
import { systemIPC } from '@/main/handler/ipc/systemIPC';
import { loggerIPC } from '@/main/handler/ipc/loggerIPC';

export function ipcRegisterHandler() {
  steamIPC();
  ioIPC();
  loggerIPC();
  systemIPC();
}
