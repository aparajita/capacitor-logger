import { registerWebPlugin, WebPlugin } from '@capacitor/core';
import { LogLevel, WSLoggerPlugin } from './definitions';
import { native } from '@aparajita/capacitor-native-decorator';

export const kLogLevelNames = [
  'off',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
];

export class WSLoggerWeb extends WebPlugin implements WSLoggerPlugin {
  private static readonly _console = console;
  private static _level = LogLevel.info;

  constructor() {
    super({
      name: 'WSLogger',
      platforms: ['web', 'ios', 'android'],
    });

    // @ts-ignore
    window.console = this;

    if (process.env.WS_LOG_LEVEL) {
      const level = kLogLevelNames.indexOf(process.env.WS_LOG_LEVEL);

      if (level >= 0) {
        WSLoggerWeb._level = level;
      }
    }
  }

  setLevel(level: LogLevel | string): void {
    if (typeof level === 'string') {
      const index = kLogLevelNames.indexOf(level);

      if (index >= 0) {
        WSLoggerWeb._level = index as LogLevel;
      }
    } else {
      WSLoggerWeb._level = level;
    }
  }

  getLevel(): LogLevel {
    return WSLoggerWeb._level;
  }

  getLevelName(): string {
    return kLogLevelNames[WSLoggerWeb._level];
  }

  @native()
  handleNativeConsole(): Promise<void> {
    // A no-op on the web
    return Promise.resolve();
  }

  get memory() {
    return WSLoggerWeb._console.memory;
  }

  assert(condition?: boolean, ...data: any[]): void {
    if (WSLoggerWeb._level > LogLevel.off) {
      WSLoggerWeb._console.assert(condition, ...data);
    }
  }

  clear(): void {
    WSLoggerWeb._console.clear();
  }

  count(label?: string): void {
    if (WSLoggerWeb._level > LogLevel.off) {
      WSLoggerWeb._console.count(label);
    }
  }

  countReset(label?: string): void {
    if (WSLoggerWeb._level > LogLevel.off) {
      WSLoggerWeb._console.countReset(label);
    }
  }

  debug(...data: any[]): void {
    if (WSLoggerWeb._level >= LogLevel.debug) {
      WSLoggerWeb._console.debug(...data);
    }
  }

  dir(item?: any, options?: any): void {
    if (WSLoggerWeb._level >= LogLevel.info) {
      WSLoggerWeb._console.dir(item, options);
    }
  }

  dirxml(...data: any[]): void {
    if (WSLoggerWeb._level >= LogLevel.info) {
      WSLoggerWeb._console.dirxml(...data);
    }
  }

  error(...data: any[]): void {
    if (WSLoggerWeb._level >= LogLevel.error) {
      WSLoggerWeb._console.error(...data);
    }
  }

  group(...data: any[]): void {
    if (WSLoggerWeb._level > LogLevel.off) {
      WSLoggerWeb._console.group(...data);
    }
  }

  groupCollapsed(...data: any[]): void {
    if (WSLoggerWeb._level > LogLevel.off) {
      WSLoggerWeb._console.groupCollapsed(...data);
    }
  }

  groupEnd(): void {
    if (WSLoggerWeb._level > LogLevel.off) {
      WSLoggerWeb._console.groupEnd();
    }
  }

  info(...data: any[]): void {
    if (WSLoggerWeb._level >= LogLevel.info) {
      WSLoggerWeb._console.info(...data);
    }
  }

  log(...data: any[]): void {
    if (WSLoggerWeb._level >= LogLevel.info) {
      WSLoggerWeb._console.log(...data);
    }
  }

  profile(label?: string): void {
    WSLoggerWeb._console.time(label);
  }

  profileEnd(label?: string): void {
    WSLoggerWeb._console.time(label);
  }

  table(tabularData?: any, properties?: string[]): void {
    if (WSLoggerWeb._level > LogLevel.off) {
      WSLoggerWeb._console.table(tabularData, properties);
    }
  }

  time(label?: string): void {
    if (WSLoggerWeb._level > LogLevel.off) {
      WSLoggerWeb._console.time(label);
    }
  }

  timeEnd(label?: string): void {
    if (WSLoggerWeb._level > LogLevel.off) {
      WSLoggerWeb._console.timeEnd(label);
    }
  }

  timeLog(label?: string, ...data: any[]): void {
    if (WSLoggerWeb._level > LogLevel.off) {
      WSLoggerWeb._console.timeLog(label, ...data);
    }
  }

  timeStamp(label?: string): void {
    WSLoggerWeb._console.timeStamp(label);
  }

  trace(...data: any[]): void {
    if (WSLoggerWeb._level >= LogLevel.trace) {
      WSLoggerWeb._console.trace(...data);
    }
  }

  warn(...data: any[]): void {
    if (WSLoggerWeb._level >= LogLevel.warn) {
      WSLoggerWeb._console.warn(...data);
    }
  }
}

const WSLogger = new WSLoggerWeb();

export { WSLogger };

registerWebPlugin(WSLogger);
