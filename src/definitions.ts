declare module '@capacitor/core' {
  interface PluginRegistry {
    WSLogger: WSLoggerPlugin;
  }
}

export enum LogLevel {
  off,
  error,
  warn,
  info,
  debug,
  trace,
}

export interface WSLoggerPlugin {
  setLevel(level: LogLevel | string): void;
  getLevel(): LogLevel;
  getLevelName(): string;
  handleNativeConsole(): Promise<void>;
}
