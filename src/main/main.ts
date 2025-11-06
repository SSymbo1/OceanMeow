import { logger } from '@/main/util/Logger';
import { CommonMessage } from '@/type/enum/Message';
import { Firewall } from '@/main/util/Firewall';
import { globalExceptionListener } from '@/main/handler';
import { app } from 'electron';
import { mainWindow } from '@/main/modal/mainWindow';
import { initApplicationWhenReady } from '@/main/handler/hook/applicationReady';
import {
  destroyApplicationWindowBeforeClose,
  releaseApplicationResourcesWhenClose,
} from '@/main/handler/hook/applicationClose';

// 设置异常拦截器
globalExceptionListener();
// 设置应用为单例应用
const appSingleLock = app.requestSingleInstanceLock();
if (!appSingleLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow && mainWindow.isMinimized()) {
      mainWindow.restore();
      mainWindow.focus();
    }
  });
}
// 启动应用相关hook
if (Firewall.handleCommandLineArgs()) {
  logger.info(CommonMessage.HANDLE_FIREWALL);
}
app.whenReady().then(async () => {
  await initApplicationWhenReady();
});
// 关闭应用相关hook
app.on('window-all-closed', async () => {
  await releaseApplicationResourcesWhenClose();
});
app.on('before-quit', async () => {
  await destroyApplicationWindowBeforeClose();
});
