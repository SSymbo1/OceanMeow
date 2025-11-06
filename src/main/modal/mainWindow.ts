import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';
import path from 'node:path';

export let mainWindow: BrowserWindow | null = null;

export const setMainWindow = (window: BrowserWindow | null) => {
  mainWindow = window;
};

export const createMainWindow = () => {
  let quitFlag = false;
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
  ipcMain.on('window-min', () => {
    mainWindow?.minimize();
  });
  ipcMain.on('window-close', async () => {
    mainWindow?.close();
  });
  mainWindow.on('close', async (event) => {
    if (quitFlag) return;
    event.preventDefault();
    const cfgHolder = new ApplicationConfigHolder();
    const { closeApplication } = await cfgHolder.read('common');
    if (closeApplication === '0') {
      quitFlag = true;
      app.quit();
    } else {
      mainWindow?.hide();
    }
  });
};
