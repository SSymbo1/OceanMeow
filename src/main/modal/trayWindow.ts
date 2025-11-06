import { app, BrowserWindow, ipcMain, Tray, nativeImage } from 'electron';
import { mainWindow } from '@/main/modal/mainWindow';
import path from 'node:path';

export let trayMenuPopup: BrowserWindow | null = null;

export const setTrayMenuPopup = (window: BrowserWindow | null) => {
  trayMenuPopup = window;
};

export const setTray = () => {
  const tray = new Tray(
    nativeImage.createFromPath(
      app.isPackaged
        ? path.join(process.resourcesPath, 'icon.ico')
        : path.join(__dirname, '../public/icon.ico')
    )
  );
  tray.setToolTip('OceanMeow');
  tray.on('right-click', (e, bounds) => createTrayWindow(bounds));
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
};

const createTrayWindow = (bounds: Electron.Rectangle) => {
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
    trayMenuPopup.loadFile(
      path.join(__dirname, '../dist/src/renderer/components/component/popup/popup.html')
    );
  } else {
    trayMenuPopup.loadURL(
      'http://localhost:5173/src/renderer/components/component/popup/popup.html'
    );
  }
  trayMenuPopup.once('blur', () => trayMenuPopup?.close());
  trayMenuPopup.once('closed', () => (trayMenuPopup = null));
  ipcMain.on('tray-close', () => {
    app.quit();
  });
};
