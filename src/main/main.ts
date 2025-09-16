import { SystemDB } from '@/main/util/SystemDB';
import { logger } from '@/main/util/Logger';
import { CommonMessage } from '@/type/enum/Message';
import { Firewall } from '@/main/util/Firewall';
import { protocolRegister, ipcRegisterHandler, globalExceptionListener } from '@/main/handler';
import { app, BrowserWindow, Menu, ipcMain, nativeImage, Tray } from 'electron';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';
import { stop } from '@/main/server/app';
import path from 'path';

let mainWindow: BrowserWindow | null = null;
let trayMenuPopup: BrowserWindow | null = null;

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

// 设置应用托盘
const setTray = () => {
  const tray = new Tray(
    nativeImage.createFromPath(
      app.isPackaged
        ? path.join(process.resourcesPath, 'icon.ico')
        : path.join(__dirname, '../public/icon.ico')
    )
  );
  tray.setToolTip('Application');
  tray.on('right-click', (e, bounds) => createTrayPopup(bounds));
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
};

// 设置主窗口
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 530,
    minWidth: 800,
    minHeight: 530,
    maxWidth: 900,
    maxHeight: 530,
    maximizable: false,
    frame: false,
    transparent: false,
    backgroundColor: '#ffffff',
    thickFrame: true,
    icon: app.isPackaged
      ? path.join(process.resourcesPath, 'icon.ico')
      : path.join(__dirname, '../public/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  Menu.setApplicationMenu(null);
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/src/renderer/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173/src/renderer/index.html');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  ipcMain.on('window-min', () => mainWindow?.minimize());
  ipcMain.on('window-quit', () => app.quit());
  ipcMain.on('window-close', async () => {
    const appConfig = new ApplicationConfigHolder();
    const { closeApplication } = await appConfig.read('common');
    if (closeApplication === '0') {
      app.quit();
    } else {
      mainWindow?.webContents.send('before-hide');
      setTimeout(() => {
        mainWindow?.hide();
      }, 200);
    }
  });
  mainWindow.on('close', async () => {});
};

// 设置托盘菜单
const createTrayPopup = (bounds: Electron.Rectangle) => {
  const width = 150;
  const height = 230;
  if (trayMenuPopup) {
    trayMenuPopup.close();
    trayMenuPopup = null;
  }
  trayMenuPopup = new BrowserWindow({
    width: width,
    height: height,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  const x = Math.round(bounds.x + bounds.width / 2 - width / 2);
  const y = Math.round(bounds.y - height);
  trayMenuPopup.setBounds({ x, y, width, height });
  if (app.isPackaged) {
    trayMenuPopup.loadFile(path.join(__dirname, '../dist/src/renderer/popup.html'));
  } else {
    trayMenuPopup.loadURL('http://localhost:5173/src/renderer/popup.html');
  }
  trayMenuPopup.once('blur', () => trayMenuPopup?.close());
  trayMenuPopup.once('closed', () => (trayMenuPopup = null));
};

// 启动应用相关hook
if (Firewall.handleCommandLineArgs()) {
  logger.info(CommonMessage.HANDLE_FIREWALL);
}
app.whenReady().then(async () => {
  await SystemDB.getInstance().initDB();
  await Firewall.ensureRule();
  protocolRegister();
  ipcRegisterHandler();
  createWindow();
  setTray();
  logger.info(CommonMessage.APPLICATION_START.replace('{pid}', process.pid.toString()));
});

app.on('before-quit', async () => {
  mainWindow?.destroy();
  mainWindow = null;
  trayMenuPopup?.destroy();
  trayMenuPopup = null;
});

// 关闭应用相关hook
app.on('window-all-closed', async () => {
  await stop();
  await SystemDB.getInstance().closeDB();
  logger.info(CommonMessage.APPLICATION_CLOSE);
  app.exit();
});
