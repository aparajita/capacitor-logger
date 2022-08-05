import { registerPlugin } from '@capacitor/core'
import type { CapLoggerPlugin } from './definitions'
import { kPluginName } from './definitions'
import info from './info.json'
import Logger from './logger'
import LoggerBridge from './web'

console.log(`loaded ${info.name} v${info.version}`)

// Because we are using @aparajita/capacitor-native-decorator,
// we have one version of the TS code to rule them all, and there
// is no need to lazy load. 😁
const plugin = new LoggerBridge()

registerPlugin<CapLoggerPlugin>(kPluginName, {
  web: plugin,
  ios: plugin,
  android: plugin
})

export { LogLevel, type Options } from './definitions'
export { Logger }
