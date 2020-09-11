declare module '@capacitor/core' {
  interface PluginRegistry {
    WSLogger: WSLoggerPlugin;
  }
}

export interface WSLoggerOptions {
  msg: string
  context?: string
}

export interface WSLoggerPlugin {
  log(options: WSLoggerOptions): Promise<void>;
  info(options: WSLoggerOptions): Promise<void>;
  warn(options: WSLoggerOptions): Promise<void>;
  error(options: WSLoggerOptions): Promise<void>;
}
