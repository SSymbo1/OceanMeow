import log from 'electron-log';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { Resource } from '#/type/resource';

interface LogConfig {
    fileLevel: 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error' | false;
    consoleLevel: 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error' | false;
    maxSize: number;
    format: string;
    logName: string;
}

export class Logger {

    private static instance: Logger;
    private readonly config: LogConfig;

    private constructor() {
        this.config = this.loadConfig();
        this.initialize();
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private loadConfig(): LogConfig {
        const defaultConfig: LogConfig = {
            fileLevel: 'info',
            consoleLevel: 'debug',
            maxSize: 10 * 1024 * 1024,
            logName: '/logs/application_${date}.log',
            format: '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {scope} >>> {text}'
        };
        try {
            let applicationConfig = app.isPackaged
                ? path.join(process.resourcesPath, Resource.APPLICATION_CONFIG)
                : path.join(process.cwd(), Resource.ROOT_DEV, Resource.APPLICATION_CONFIG);
            if (fs.existsSync(applicationConfig)) {
                const configContent = fs.readFileSync(applicationConfig, 'utf-8');
                const config = JSON.parse(configContent);
                return {
                    ...defaultConfig,
                    ...(config.logger || {})
                };
            }
            return defaultConfig;
        } catch (error) {
            return defaultConfig;
        }
    }

    private initialize() {
        log.transports.file.level = this.config.fileLevel;
        log.transports.console.level = this.config.consoleLevel;
        const logPath = path.join(process.resourcesPath, this.config.logName);
        log.transports.file.fileName = this.config.logName;
        log.transports.file.maxSize = this.config.maxSize;
        log.transports.file.format = this.config.format;
        log.transports.console.format = this.config.format;
    }

    error(message: string, ...meta: any[]): void {
        log.error(message, ...meta);
    }

    warn(message: string, ...meta: any[]): void {
        log.warn(message, ...meta);
    }

    info(message: string, ...meta: any[]): void {
        log.info(message, ...meta);
    }

    verbose(message: string, ...meta: any[]): void {
        log.verbose(message, ...meta);
    }

    debug(message: string, ...meta: any[]): void {
        log.debug(message, ...meta);
    }

    silly(message: string, ...meta: any[]): void {
        log.silly(message, ...meta);
    }

    getLogPath(): string {
        return log.transports.file.getFile().path;
    }

    getConfig(): LogConfig {
        return { ...this.config };
    }
}

export const logger = Logger.getInstance();