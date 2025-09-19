import { createConnection } from 'net';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';
import os from 'os';

interface LocalNetInfo {
  ip: string;
  port: number;
  portOccupied: boolean;
}

/**
 * 获取本地网络信息，包括IP地址、端口号和端口占用情况
 * @async
 * @returns {Promise<LocalNetInfo>} 返回一个包含本地网络信息的对象，包括IP地址、端口号和端口是否被占用
 * @throws {Error} 如果读取配置或网络连接过程中发生错误
 * @example
 * // 示例用法
 * const netInfo = await localNetInfo();
 * console.log(`IP地址: ${netInfo.ip}, 端口: ${netInfo.port}, 端口占用: ${netInfo.portOccupied}`);
 */
export async function localNetInfo(): Promise<LocalNetInfo> {
  const applicationConfigHolder = new ApplicationConfigHolder();
  const shareConfig = await applicationConfigHolder.read('share');
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
