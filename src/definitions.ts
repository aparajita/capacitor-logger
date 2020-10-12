declare module '@capacitor/core' {
  interface PluginRegistry {
    WSLogger: WSLoggerPlugin
  }
}

export interface WSLoggerOptions {
  message: string
  context?: string
}

export type WSLoggerFunction = (options: WSLoggerOptions) => Promise<void>

export interface WSLoggerPlugin {
  log: WSLoggerFunction
  info: WSLoggerFunction
  warn: WSLoggerFunction
  error: WSLoggerFunction
}
