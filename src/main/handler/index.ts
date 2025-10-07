import { steamIPC } from '@/main/handler/ipc/steamIPC';
import { ioIPC } from '@/main/handler/ipc/ioIPC';
import { systemIPC } from '@/main/handler/ipc/systemIPC';
import { loggerIPC } from '@/main/handler/ipc/loggerIPC';
import { serverIPC } from '@/main/handler/ipc/serverIPC';
import { rendererLoadFileProtocol } from '@/main/handler/protocol/rendererLoadFileProtocol';
import { rendererBackgroundProtocol } from '@/main/handler/protocol/rendererBackgroundProtocol';
import {
  uncaughtExceptionListener,
  unhandledRejectionListener,
} from '@/main/handler/listener/exceptionListener';

export function ipcRegisterHandler() {
  steamIPC();
  ioIPC();
  loggerIPC();
  systemIPC();
  serverIPC();
}

export function protocolRegister() {
  rendererLoadFileProtocol();
  rendererBackgroundProtocol();
}

export function globalExceptionListener() {
  uncaughtExceptionListener();
  unhandledRejectionListener();
}
