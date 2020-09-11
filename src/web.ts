import { registerWebPlugin, WebPlugin } from '@capacitor/core'
import { WSLoggerOptions, WSLoggerPlugin } from './definitions'

enum LogLevel {
  info = 'log',
  warn = 'warn',
  error = 'error'
}

export class WSLoggerWeb extends WebPlugin implements WSLoggerPlugin {
  constructor() {
    super({
      name: 'WSLogger',
      platforms: ['web']
    })
  }

  private print(options: WSLoggerOptions, level: LogLevel): Promise<void> {
    const context = options.context || 'app'
    console[level](`[${context}] ${options.msg}`)
    return Promise.resolve()
  }

  log(options: WSLoggerOptions): Promise<void> {
    return this.print(options, LogLevel.info)
  }

  info(options: WSLoggerOptions): Promise<void> {
    return this.print(options, LogLevel.info)
  }

  warn(options: WSLoggerOptions): Promise<void> {
    return this.print(options, LogLevel.warn)
  }

  error(options: WSLoggerOptions): Promise<void> {
    return this.print(options, LogLevel.error)
  }
}

const WSLogger = new WSLoggerWeb()

export { WSLogger }

registerWebPlugin(WSLogger)
