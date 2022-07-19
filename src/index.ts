import { registerPlugin } from '@capacitor/core'
import type { CapLoggerPlugin } from './definitions'
import { kPluginName } from './definitions'
import Logger from './logger'
import { name } from './package.json'
import LoggerBridge from './web'

console.log(`loaded ${name}`)

// Because we are using @aparajita/capacitor-native-decorator,
// we have one version of the TS code to rule them all, and there
// is no need to lazy load. 😁
const plugin = new LoggerBridge()

registerPlugin<CapLoggerPlugin>(kPluginName, {
  web: plugin,
  ios: plugin,
  android: plugin
})

// We need to export LogLevel itself so users can have access to the underlying values.
// eslint-disable-next-line @typescript-eslint/consistent-type-exports
export { LogLevel, Options } from './definitions'
export { Logger }
