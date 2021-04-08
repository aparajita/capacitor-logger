import Capacitor

@objc(WSLogger)
public class WSLogger: CAPPlugin {
  public enum LogLevel: Int {
    case off = 0
    case error
    case warn
    case info
    case debug
    case trace
  }

  let levelNames = [
    LogLevel.trace: "trace",
    LogLevel.debug: "debug",
    LogLevel.info: "info",
    LogLevel.warn: "warn",
    LogLevel.error: "error",
    LogLevel.off: "off"
  ]

  let levelValues = [
    "trace": LogLevel.trace,
    "debug": LogLevel.debug,
    "info": LogLevel.info,
    "warn": LogLevel.warn,
    "error": LogLevel.error,
    "off": LogLevel.off
  ]

  var levelPrefixes = [
    LogLevel.trace: "🔎",
    LogLevel.debug: "👉",
    LogLevel.info: "🟢",
    LogLevel.warn: "🟠",
    LogLevel.error: "🔴"
  ]

  var hideConsole = false
  var hideLogs = false

  override public func load() {
    loadCustomPrefixes()
    setHideFlag()
  }

  /*
   * Determine if we should hide logs. By default, use global the ios.hideLogs or hideLogs capacitor setting.
   * If there is a plugins.WSLogger.hideLogs setting, use that. This allows us to hide Capacitor logs
   * but keep user logs.
   */
  private func setHideFlag() {
    if let hide = (bridge.config.getValue("ios.hideLogs") as? Bool) ?? (bridge.config.getValue("hideLogs") as? Bool) {
      hideConsole = hide
      hideLogs = hideConsole
    }

    if let hide = getConfigValue("hideLogs") as? Bool? ?? hideConsole {
      hideLogs = hide
    }
  }

  /*
   * Load custom level prefixes from plugins.WSLogger.prefixes.
   */
  private func loadCustomPrefixes() {
    guard let prefixes = getConfigValue("prefixes") as? [String: Any] else {
      return
    }

    for level in prefixes.keys {
      if let symbol = prefixes[level] as? String,
         let value = levelValues[level]?.rawValue,
         let logLevel = LogLevel(rawValue: value) {
          levelPrefixes[logLevel] = symbol
      }
    }
  }

  /*
   * Print a message to the log at the given log level, optionally specifying
   * the free-form module scope.
   */
  public func print(_ message: String, level: LogLevel, module: String = "app") {
    let symbol = getLevelPrefix(level)
    Swift.print("\(symbol) [\(module)] \(message)")
  }

  /*
   * Get the level prefix for the given level. If the level is invalid,
   * return the prefix for LogLevel.info.
   */
  private func getLevelPrefix(_ level: LogLevel) -> String {
    if let prefix = levelPrefixes[level] {
      return prefix
    }

    return levelPrefixes[LogLevel.info] ?? ""
  }

  /*
   * Extract the "message" call option and print it at the given log level.
   * If there is a "module" call option, it is used, otherwise it defaults to "app".
   */
  private func handleCall(_ call: CAPPluginCall, _ level: LogLevel) {
    if !self.hideLogs {
      let message = call.getString("message") ?? ""

      if let module = call.getString("module") {
        self.print(message, level: level, module: module)
      } else {
        self.print(message, level: level)
      }
    }

    call.success()
  }

  /*
   * Route calls to console.<level>() to this plugin by replacing the built in
   * Console plugin with this plugin.
   */
  @objc func handleNativeConsole(_ call: CAPPluginCall) {
    // Replace the built in Console plugin with this plugin
    if bridge?.getPlugin(pluginName: "Console") != nil {
      bridge.plugins["Console"] = self
      Swift.print("[WSLogger] Now handling the console")
    }

    call.success()
  }

  /*
   * Handle calls to console.log(). A "level" call option may be specified.
   */
  @objc func log(_ call: CAPPluginCall) {
    // If we are handling console calls, there might be a level
    var level = "info"

    if let callLevel = call.getString("level") {
      level = callLevel
    }

    var logLevel = LogLevel.info

    if let value = levelValues[level],
       let convertedLevel = LogLevel(rawValue: value.rawValue) {
      logLevel = convertedLevel
    }

    self.handleCall(call, logLevel)
  }
}
