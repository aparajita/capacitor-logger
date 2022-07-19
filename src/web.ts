import { native, PluginReturnType } from '@aparajita/capacitor-native-decorator'
import { WebPlugin } from '@capacitor/core'
import type { CapLoggerPlugin, NativeLogData } from './definitions'
import { kPluginName } from './definitions'

/**
 * This class is the actual native plugin that acts as a bridge
 * between the native and web implementations.
 */
export default class LoggerBridge extends WebPlugin implements CapLoggerPlugin {
  static instance: LoggerBridge

  constructor() {
    super()
    LoggerBridge.instance = this
  }

  getRegisteredPluginName(): string {
    return kPluginName
  }

  // Never rejects
  @native(PluginReturnType.none)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async log(_data: NativeLogData): Promise<void> {
    // This is a no-op on the web
  }

  // Never rejects
  @native(PluginReturnType.none)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setUseSyslog(_useSyslog: { use: boolean }): Promise<void> {
    // This is a no-op on the web
  }
}
