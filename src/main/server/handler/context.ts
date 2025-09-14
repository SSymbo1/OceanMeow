import { createConnection } from 'net';
import { SystemIO } from '@/main/util/SystemIO';
import os from 'os';

interface LocalNetInfo {
  ip: string;
  port: number;
  portOccupied: boolean;
}

export async function localNetInfo(): Promise<LocalNetInfo> {
  const shareConfig = await SystemIO.readApplicationConfig('share');
  const port = shareConfig.port;
  const ipv4 = Object.values(os.networkInterfaces())
    .flat()
    .find((addr) => addr?.family === 'IPv4' && !addr.internal);
  const ip = ipv4?.address ?? 'localhost';
  const portOccupied =
    port === 0
      ? false
      : await new Promise<boolean>((resolve) => {
          const timer = setTimeout(() => resolve(false), 2000);
          const socket = createConnection({ host: ip, port })
            .once('connect', () => {
              clearTimeout(timer);
              socket.destroy();
              resolve(true);
            })
            .once('error', () => {
              clearTimeout(timer);
              resolve(false);
            });
        });
  return { ip, port, portOccupied };
}
