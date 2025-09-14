import { serve } from '@hono/node-server';
import { localNetInfo } from '@/main/server/handler/context';
import { logger } from '../util/Logger';
import { CommonMessage } from '@/type/enum/Message';
import store from '@/main/server/handler/store';
import buildRouter from './router/route';

let server: ReturnType<typeof serve> | null = null;

export async function start() {
  const localNetContext = await localNetInfo();
  store.set('server', { ip: localNetContext.ip, port: localNetContext.port });
  if (server) await stop();
  const app = buildRouter();
  server = serve({ fetch: app.fetch, port: localNetContext.port, hostname: localNetContext.ip });
  logger.info(
    CommonMessage.SERVER_START.replace('{domain}', localNetContext.ip).replace(
      '{port}',
      localNetContext.port.toString()
    )
  );
  return localNetContext.port;
}

export async function stop() {
  if (!server) return;
  const tmp = server;
  server = null;
  store.clear();
  await new Promise<void>((resolve, reject) => tmp.close((err) => (err ? reject(err) : resolve())));
  logger.info(CommonMessage.SERVER_CLOSE);
}
