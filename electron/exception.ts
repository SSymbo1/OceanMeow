import { logger } from '#/util/Logger';
import { app } from 'electron';

export function exceptionHandler() {
    process.on('uncaughtException', (err) => {
        logger.error('Electron Nodejs Uncaught Exception:', err);
    });
    process.on('unhandledRejection', (err) => {
        logger.error('Electron Nodejs Uncaught Exception:', err);
    });
    app.on('render-process-gone', (e, webContents, details) => {
        console.error('Electron Fatal Error:', details);
    });
}