import { SystemBackgroundCache } from '@/main/service/system/cache/impl/SystemBackgroundCache';
import { SystemDB } from '@/main/util/SystemDB';
import { logger } from '@/main/util/Logger';
import { Firewall } from '@/main/util/Firewall';
import { protocolRegister, ipcRegisterHandler } from '@/main/handler';
import { createMainWindow } from '@/main/modal/mainWindow';
import { setTray } from '@/main/modal/trayWindow';
import { CommonMessage } from '@/type/enum/Message';

export const initApplicationWhenReady = async () => {
  const backgroundCache = new SystemBackgroundCache();
  await backgroundCache.initApplicationCacheFolder();
  await SystemDB.getInstance().initDB();
  await Firewall.ensureRule();
  protocolRegister();
  ipcRegisterHandler();
  createMainWindow();
  setTray();
  logger.info(CommonMessage.APPLICATION_START.replace('{pid}', process.pid.toString()));
};
