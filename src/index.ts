import { registerPlugin } from '@capacitor/core'
import type { LoggerBridgePlugin } from './definitions'
import { setLoggerBridge } from './global'
import info from './info.json'
import Logger from './logger'

console.log(`loaded ${info.name} v${info.version}`)

async function loader(): Promise<unknown> {
  return import('./bridge').then((module) => new module.LoggerBridge())
}

const bridge = registerPlugin<LoggerBridgePlugin>('LoggerBridge', {
  web: loader,
  ios: loader,
  android: loader
})

setLoggerBridge(bridge)

export { LogLevel, type Options } from './definitions'
export { Logger }
