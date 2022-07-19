import type { DecoratedNativePlugin } from '@aparajita/capacitor-native-decorator'

export const kPluginName = 'LoggerBridge'

export enum LogLevel {
  silent,
  error,
  warn,
  info,
  debug
}

export type LogLevelName = Exclude<keyof typeof LogLevel, 'silent'>
export type LogLevelMap = { [key in LogLevelName]?: string }

export interface Options {
  level?: LogLevel
  labels?: LogLevelMap
  useSyslog?: boolean
}

/**
 * The interface for the Logger class constructor.
 */
export type LoggerWithTagConstructor = new (
  tag: string,
  options?: Options
) => ILogger

/**
 * The interface for the Logger class.
 */
export interface ILogger {
  /**
   * The current log level for this instance.
   * Getting this property returns a `LogLevel`.
   * You can set this property to a `LogLevel`
   * or to a level name. If the name is invalid,
   * it is ignored.
   */
  level: LogLevel

  /**
   * The current log level name for this instance.
   */
  readonly levelName: string

  /**
   * Returns the LogLevel for the given name. If the name is invalid,
   * returns undefined.
   */
  getLevelWithName: (name: string) => LogLevel | undefined

  /**
   * The set of level labels for this instance. Getting this property
   * returns a copy of the underlying map as Record<string, string>.
   * You can set the level labels by setting a map of level names to
   * labels as the value of this property. If a level name is invalid,
   * it is ignored.
   *
   * Note that if the first character of a label is ASCII, the label
   * is surrounded by square brackets.
   */
  labels: LogLevelMap

  /**
   * The tag for this instance. You can set it directly
   * via this property, but if the tag is empty, nothing happens.
   */
  tag: string

  /**
   * Whether or not to use syslog. On iOS, setting this to
   * true allows you to view logs in Console.app.
   * This has no effect on the web or android.
   */
  useSyslog: boolean

  /**
   * Log a message at the error level.
   */
  error: (message: string) => void

  /**
   * Log a message at the warn level.
   */
  warn: (message: string) => void

  /**
   * Log a message at the info level.
   */
  info: (message: string) => void

  /**
   * Log a message at the info level.
   */
  log: (message: string) => void

  /**
   * Log a message at the debug level.
   */
  debug: (message: string) => void

  /**
   * Log a message at the given level.
   */
  logAtLevel: (level: LogLevel | string, message: string) => void

  /**
   * Log a message at the given level with the given tag.
   */
  logWithTagAtLevel: (
    level: LogLevel | string,
    tag: string,
    message: string
  ) => void

  /**
   * Output a debug representation of a value.
   * Objects are logged as formatted JSON.
   */
  dir: (value: unknown) => void

  /**
   * If running on the web, clear the console.
   */
  clear: () => void

  /**
   * Web only, a no-op on native platforms.
   * Log the number of times this line has been called with the given label.
   */
  count: (label?: string | undefined) => void

  /**
   * Web only, a no-op on native platforms.
   * Resets the value of the counter with the given label.
   */
  countReset: (label?: string | undefined) => void

  /**
   * Web only, a no-op on native platforms.
   * Creates a new inline group, indenting all following output by another level
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  group: (...label: any[]) => void

  /**
   * Web only, a no-op on native platforms.
   * Creates a new collapsed inline group, indenting all following output by another level.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  groupCollapsed: (...label: any[]) => void

  /**
   * Web only, a no-op on native platforms.
   * Exits the current inline group.
   */
  groupEnd: () => void

  /**
   * Web only, a no-op on native platforms.
   * Displays tabular data as a table.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  table: (tabularData: any, properties?: readonly string[] | undefined) => void

  /**
   * Start a timer.
   */
  time: (label?: string) => void

  /**
   * Log the elapsed time of a timer.
   */
  timeLog: (label?: string) => void

  /**
   * Stop a timer and log the elapsed time.
   */
  timeEnd: (label?: string) => void

  /**
   * Output a stack trace at the current point of execution.
   */
  trace: () => void
}

/**
 * You will never use these types directly.
 */
export interface NativeLogData {
  level: LogLevel
  label: string
  tag: string
  message: string
}

export interface CapLoggerPlugin extends DecoratedNativePlugin {
  /**
   * This is the interface between Logger and the native side.
   */
  log: (data: NativeLogData) => Promise<void>

  /**
   * Set whether or not to use syslog.
   */
  setUseSyslog: (data: { use: boolean }) => Promise<void>
}
