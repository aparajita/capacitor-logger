import { Capacitor } from '@capacitor/core'
import type { ILogger, LogLevelMap, Options } from './definitions'
import { LogLevel } from './definitions'
import { getLoggerBridge } from './global'

const isNative = Capacitor.isNativePlatform()

// Make a reverse map of LogLevel to string
const kLevelsByName: Record<string, LogLevel> = {}
const keys = Object.keys(LogLevel).filter((key) => /\D+/u.test(key))

keys.forEach((key, index) => {
  kLevelsByName[key] = index
})

const kDefaultTimerLabel = Symbol('default')

function logError(error: Error): void {
  console.error(`[Logger] ${error.message}`)
}

/**
 * This is the class that users will instantiate to log messages.
 */
export default class Logger implements ILogger {
  static kDefaultLevelLabels: LogLevelMap = {
    [LogLevel[LogLevel.silent]]: '',
    [LogLevel[LogLevel.error]]: '🔴',
    [LogLevel[LogLevel.warn]]: '🟠',
    [LogLevel[LogLevel.info]]: '🟢',
    [LogLevel[LogLevel.debug]]: '🔎',
  }

  private _level = LogLevel.info
  private readonly _labels = new Map<LogLevel, string>(
    Object.entries(Logger.kDefaultLevelLabels).map(([key, value]) => [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.getLevelWithName(key)!,
      value,
    ])
  )

  private _tag: string
  private _useSyslog = false
  private readonly timers = new Map<string | symbol, number>()

  constructor(tag: string, options?: Options) {
    this._tag = tag

    if (options) {
      if (typeof options.level === 'number') {
        this._level = options.level
      }

      if (typeof options.labels === 'object') {
        this.labels = options.labels
      }

      if (typeof options.useSyslog === 'boolean') {
        this._useSyslog = options.useSyslog
      }
    }
  }

  get level(): LogLevel {
    return this._level
  }

  set level(level: LogLevel | string) {
    if (typeof level === 'string') {
      const logLevel = this.getLevelWithName(level)

      if (logLevel) {
        this._level = logLevel
      }
    } else {
      this._level = level
    }
  }

  get levelName(): string {
    return LogLevel[this._level]
  }

  set levelName(level: string) {
    const index = Object.values(LogLevel).indexOf(level)

    if (index >= 0) {
      this._level = index
    }
  }

  getLevelWithName(name: string): LogLevel | undefined {
    return kLevelsByName[name]
  }

  get labels(): LogLevelMap {
    return Object.fromEntries(this._labels)
  }

  set labels(labels: LogLevelMap) {
    for (const [level, label] of Object.entries(labels)) {
      if (label) {
        const logLevel = this.getLevelWithName(level)

        if (logLevel) {
          this._labels.set(logLevel, label)
        }
      }
    }
  }

  get tag(): string {
    return this._tag
  }

  set tag(tag: string) {
    if (tag) {
      this._tag = tag
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  silent(_message: string): void {
    // This is here to facilitate dynamically calling
    // a logging method based on a level name without having
    // to special-case 'silent' in the code.
  }

  error(message: string): void {
    this.logMessage(LogLevel.error, this.tag, message)
  }

  warn(message: string): void {
    this.logMessage(LogLevel.warn, this.tag, message)
  }

  info(message: string): void {
    this.logMessage(LogLevel.info, this.tag, message)
  }

  log(message: string): void {
    this.info(message)
  }

  debug(message: string): void {
    this.logMessage(LogLevel.debug, this.tag, message)
  }

  logAtLevel(level: LogLevel | string, message: string): void {
    this.logWithTagAtLevel(level, this.tag, message)
  }

  logWithTagAtLevel(
    level: LogLevel | string,
    tag: string,
    message: string
  ): void {
    const logLevel =
      typeof level === 'string'
        ? this.getLevelWithName(level) ?? LogLevel.info
        : level

    if (this._level >= logLevel) {
      this.logMessage(logLevel, tag, message)
    }
  }

  dir(value: unknown): void {
    if (this._level < LogLevel.info) {
      return
    }

    if (isNative) {
      if (value && typeof value === 'object') {
        this.info(
          `${value.constructor.name}: ${JSON.stringify(value, null, 2)}`
        )
      } else {
        this.info(JSON.stringify(value))
      }
    } else {
      console.dir(value)
    }
  }

  private logMessage(level: LogLevel, tag: string, message: string): void {
    if (this._level < level) {
      return
    }

    const label = this._labels.get(level) ?? ''

    if (isNative) {
      getLoggerBridge()
        .log({
          level,
          tag,
          label,
          message,
        })
        .catch(logError)
    } else {
      let msg: string

      if (label) {
        // If the label is ASCII, put it after the tag, otherwise before.
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (label.charCodeAt(0) < 128) {
          msg = `[${tag}] ${label}: ${message}`
        } else {
          msg = `${label} [${tag}]: ${message}`
        }
      } else {
        msg = `[${tag}]: ${message}`
      }

      // @ts-expect-error - We are legitimately indexing the console object
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      console[LogLevel[level]](msg)
    }
  }

  clear(): void {
    if (!isNative) {
      console.clear()
    }
  }

  count(label?: string | undefined): void {
    if (!isNative) {
      console.count(label)
    }
  }

  countReset(label?: string | undefined): void {
    if (!isNative) {
      console.countReset(label)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  group(...label: any[]): void {
    if (!isNative) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      console.group(...label)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  groupCollapsed(...label: any[]): void {
    if (!isNative) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      console.groupCollapsed(...label)
    }
  }

  groupEnd(): void {
    if (!isNative) {
      console.groupEnd()
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  table(tabularData: any, properties?: readonly string[] | undefined): void {
    if (!isNative) {
      console.table(tabularData, properties)
    }
  }

  time(label?: string | undefined): void {
    this.timers.set(Logger.resolveTimerLabel(label), Date.now())
  }

  timeLog(label?: string): void {
    const resolvedLabel = Logger.resolveTimerLabel(label)

    if (!this.timers.has(resolvedLabel)) {
      this.warn(
        `timer '${Logger.timeLabelToString(resolvedLabel)}' does not exist`
      )
      return
    }

    const startTime = this.timers.get(resolvedLabel)

    if (startTime) {
      const endTime = Date.now()
      const duration = endTime - startTime
      this.info(
        `${Logger.timeLabelToString(
          resolvedLabel
        )}: ${Logger.formatMilliseconds(duration)}`
      )
    }
  }

  timeEnd(label?: string): void {
    this.timeLog(label)
    this.timers.delete(Logger.resolveTimerLabel(label))
  }

  private static formatMilliseconds(milliseconds: number): string {
    /* eslint-disable @typescript-eslint/no-magic-numbers */
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const millisecondsRemainder = milliseconds % 1000

    if (seconds < 1) {
      return `${milliseconds}ms`
    }

    if (minutes < 1) {
      return `${seconds}.${millisecondsRemainder}s`
    }

    const secs = (seconds % 60).toString().padStart(2, '0')

    if (hours < 1) {
      const millis = millisecondsRemainder.toString().padStart(3, '0')
      return `${minutes}:${secs}.${millis} (min:sec.ms)`
    }

    const mins = (minutes % 60).toString().padStart(2, '0')
    return `${hours}:${mins}:${secs} (hr:min:sec)`
    /* eslint-enable */
  }

  private static resolveTimerLabel(label: string | undefined): string | symbol {
    // eslint-disable-next-line no-unneeded-ternary
    return label ? label : kDefaultTimerLabel
  }

  private static timeLabelToString(label: string | symbol): string {
    return typeof label === 'string'
      ? label
      : kDefaultTimerLabel.description ?? 'default'
  }

  trace(): void {
    if (isNative) {
      let stack = new Error().stack ?? '<no stack>'

      // Remove "Error" at the top of the stack
      stack = stack.replace(/^\s*Error.*\n/u, '')
      this.info(`trace\n${stack}`)
    } else {
      console.trace()
    }
  }

  get useSyslog(): boolean {
    return this._useSyslog
  }

  set useSyslog(use: boolean) {
    this._useSyslog = use

    if (Capacitor.getPlatform() === 'ios') {
      getLoggerBridge().setUseSyslog({ use }).catch(logError)
    }
  }
}
