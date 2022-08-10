import type { LoggerBridgePlugin } from './definitions'

// This is kept in a separate file to avoid circular dependencies
let bridge: LoggerBridgePlugin

export function getLoggerBridge(): LoggerBridgePlugin {
  return bridge
}

export function setLoggerBridge(plugin: LoggerBridgePlugin): void {
  bridge = plugin
}
