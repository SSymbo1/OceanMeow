import 'reflect-metadata';
import { SystemDB } from '@/main/util/SystemDB';
import { logger } from '@/main/util/Logger';
import { System } from '@/type/enum/system';
import { ipcRegisterHandler } from '@/main/handler/ipc';
import { protocolRegister } from '@/main/handler/protocol';
import { exceptionHandler } from '@/main/exception';
import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'path';

if (process.platform === 'win32') {
  try {
    if (app.isPackaged) {
      const squirrelPath = path.join(
        process.resourcesPath,
        'node_modules',
        'electron-squirrel-startup'
      );
      if (require(squirrelPath)) app.quit();
    } else {
      if (require('electron-squirrel-startup')) app.quit();
    }
  } catch (e) {
    logger.error('Squirrel startup error:', e);
  }
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
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
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  ipcMain.on('window-min', () => mainWindow?.minimize());
  ipcMain.on('window-close', () => mainWindow?.close());
};

exceptionHandler();

app.whenReady().then(async () => {
  await SystemDB.getInstance().initDB();
  protocolRegister();
  ipcRegisterHandler();
  createWindow();
  logger.info(System.APP_RUN);
});

app.on('window-all-closed', async () => {
  await SystemDB.getInstance().closeDB();
  app.quit();
});
