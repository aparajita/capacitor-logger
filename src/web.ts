import { registerWebPlugin, WebPlugin } from '@capacitor/core';
import { WSLoggerOptions, WSLoggerPlugin } from './definitions';

export enum LogLevel {
  info = 'log',
  warn = 'warn',
  error = 'error',
}

export class WSLoggerWeb extends WebPlugin implements WSLoggerPlugin {
  private static readonly systemConsole = console;

  constructor() {
    super({
      name: 'WSLogger',
      platforms: ['web'],
    });
  }

  handleConsole() {
    // A no-op on the web
  }

  private static print(
    options: WSLoggerOptions,
    level: LogLevel,
  ): Promise<void> {
    const context = options.context || 'app';
    return Promise.resolve(
      this.systemConsole[level](`[${context}] ${options.message}`),
    );
  }

  static log(
    options: WSLoggerOptions,
    level: LogLevel = LogLevel.info,
  ): Promise<void> {
    return WSLoggerWeb.print(options, level);
  }

  log(options: WSLoggerOptions): Promise<void> {
    return WSLoggerWeb.log(options);
  }

  static info(options: WSLoggerOptions): Promise<void> {
    return WSLoggerWeb.print(options, LogLevel.info);
  }

  info(options: WSLoggerOptions): Promise<void> {
    return WSLoggerWeb.info(options);
  }

  static warn(options: WSLoggerOptions): Promise<void> {
    return WSLoggerWeb.print(options, LogLevel.warn);
  }

  warn(options: WSLoggerOptions): Promise<void> {
    return WSLoggerWeb.warn(options);
  }

  static error(options: WSLoggerOptions): Promise<void> {
    return WSLoggerWeb.print(options, LogLevel.error);
  }

  error(options: WSLoggerOptions): Promise<void> {
    return WSLoggerWeb.error(options);
  }
}

const WSLogger = new WSLoggerWeb();

export { WSLogger };

registerWebPlugin(WSLogger);
