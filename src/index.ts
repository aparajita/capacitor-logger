import { registerPlugin } from '@capacitor/core'
import type { LoggerBridgePlugin } from './definitions'
import { setLoggerBridge } from './global'
import Logger from './logger'

async function loader(): Promise<unknown> {
  return import('./bridge').then((module) => new module.LoggerBridge())
}

const bridge = registerPlugin<LoggerBridgePlugin>('LoggerBridge', {
  web: loader,
  ios: loader,
  android: loader,
})

setLoggerBridge(bridge)

export { LogLevel, type Options } from './definitions'
export { Logger }
