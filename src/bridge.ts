import { WebPlugin } from '@capacitor/core'
import type { LoggerBridgePlugin, NativeLogData } from './definitions'

/**
 * This class is the actual native plugin that acts as a bridge
 * between the native and web implementations.
 */
// eslint-disable-next-line import/prefer-default-export
export class LoggerBridge extends WebPlugin implements LoggerBridgePlugin {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async log(_data: NativeLogData): Promise<void> {
    // This is a no-op on the web
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setUseSyslog(_useSyslog: { use: boolean }): Promise<void> {
    // This is a no-op on the web
  }
}
