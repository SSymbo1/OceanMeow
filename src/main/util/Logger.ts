import { app } from 'electron';
import { ApplicationResource } from '@/type/enum/Resource';
import log from 'electron-log';
import path from 'node:path';
import fs from 'node:fs';

interface LogConfig {
  fileLevel: 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error' | false;
  consoleLevel: 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error' | false;
  maxSize: number;
  format: string;
  logName: string;
  logFolder: string;
  maxFile: number;
  maxDate: number;
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
      logName: 'application_${date}.log',
      format: '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {scope} >>> {text}',
      logFolder: 'logs',
      maxFile: 10,
      maxDate: 7,
    };
    try {
      const applicationConfig = app.isPackaged
        ? path.join(process.resourcesPath, ApplicationResource.CONFIG_FILE)
        : path.join(process.cwd(), ApplicationResource.FILE_ROOT, ApplicationResource.CONFIG_FILE);
      if (fs.existsSync(applicationConfig)) {
        const configContent = fs.readFileSync(applicationConfig, 'utf-8');
        const config = JSON.parse(configContent);
        return {
          ...defaultConfig,
          ...(config.logger || {}),
        };
      }
      return defaultConfig;
    } catch {
      return defaultConfig;
    }
  }

  private initialize() {
    log.transports.console.level = this.config.consoleLevel;
    log.transports.console.format = this.config.format;
    if (app.isPackaged) {
      const date = new Date()
        .toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .replace(/[-/]/g, '');
      fs.mkdirSync(path.join(process.resourcesPath, this.config.logFolder), { recursive: true });
      log.transports.file.level = this.config.fileLevel;
      const dateLog = this.config.logName.replace('${date}', date);
      log.transports.file.resolvePathFn = () =>
        path.join(process.resourcesPath, this.config.logFolder, dateLog);
      log.transports.file.maxSize = this.config.maxSize;
    }
  }

  public error(message: string, ...meta: any[]): void {
    log.error(message, ...meta);
  }

  public warn(message: string, ...meta: any[]): void {
    log.warn(message, ...meta);
  }

  public info(message: string, ...meta: any[]): void {
    log.info(message, ...meta);
  }

  public verbose(message: string, ...meta: any[]): void {
    log.verbose(message, ...meta);
  }

  public debug(message: string, ...meta: any[]): void {
    log.debug(message, ...meta);
  }

  public silly(message: string, ...meta: any[]): void {
    log.silly(message, ...meta);
  }
}

export const logger = Logger.getInstance();
