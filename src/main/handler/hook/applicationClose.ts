import { app } from 'electron';
import { stop } from '@/main/server/app';
import { SystemDB } from '@/main/util/SystemDB';
import { logger } from '@/main/util/Logger';
import { CommonMessage } from '@/type/enum/Message';
import { mainWindow, setMainWindow } from '@/main/modal/mainWindow';
import { trayMenuPopup, setTrayMenuPopup } from '@/main/modal/trayWindow';

export const releaseApplicationResourcesWhenClose = async () => {
  await stop();
  await SystemDB.getInstance().closeDB();
  logger.info(CommonMessage.APPLICATION_CLOSE);
  app.exit();
};
export const destroyApplicationWindowBeforeClose = async () => {
  mainWindow?.destroy();
  setMainWindow(null);
  trayMenuPopup?.destroy();
  setTrayMenuPopup(null);
};
