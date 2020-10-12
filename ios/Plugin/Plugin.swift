import Capacitor

@objc(WSLogger)
public class WSLogger: CAPPlugin {
  public enum LogLevel: String {
    case info
    case warn
    case error
  }

  var levelPrefixes = [
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

  /**
   * Determine if we should hide logs. By default, use the ios.hideLogs or hideLogs capacitor setting.
   * If there is a plugins.WSLogger.hide setting, use that. This allows us to hide Capacitor logs but keep user logs.
   */
  func setHideFlag() {
    if let hide = (bridge.config.getValue("ios.hideLogs") as? Bool) ?? (bridge.config.getValue("hideLogs") as? Bool) {
      hideConsole = hide
      hideLogs = hideConsole
    }

    if let hide = getConfigValue("hide") as? Bool ?? hideConsole {
      hideLogs = hide
    }
  }

  /**
   * Load custom level prefixes from plugins.WSLogger.prefixes.
   */
  func loadCustomPrefixes() {
    guard let prefixes = getConfigValue("prefixes") as? [String: Any] else {
      return
    }

    for level in prefixes.keys {
      if let symbol = prefixes[level] as? String {
        if let logLevel = LogLevel(rawValue: level) {
          levelPrefixes[logLevel] = symbol
        }
      }
    }
  }

  /**
   * Print a message to the log at the given log level, optionally specifying
   * the free-form module scope. If the module is nil, it defaults to "app".
   */
  public func print(_ message: String, level: LogLevel, module: String?) {
    let symbol = getLevelPrefix(level)
    Swift.print("\(symbol) [\(module ?? "app")] \(message)")
  }

  /**
   * Get the level prefix for the given level. If the level is invalid,
   * return the prefix for LogLevel.info.
   */
  private func getLevelPrefix(_ level: LogLevel) -> String {
    if let prefix = levelPrefixes[level] {
      return prefix
    }

    return levelPrefixes[LogLevel.info] ?? ""
  }

  /**
   * Extract the "message" call option and print it at the given log level.
   * If there is a "module" call option, it is used.
   */
  private func handleCall(_ call: CAPPluginCall, _ level: LogLevel) {
    if !self.hideLogs {
      let message = call.getString("message") ?? ""
      let module = call.getString("module")
      self.print(message, level: level, module: module)
    }

    call.success()
  }

  /**
   * Route calls to console.level() to this plugin by replacing the built in
   * Console plugin with this plugin.
   */
  @objc func handleConsole(_ call: CAPPluginCall) {
    // Replace the built in Console plugin with this plugin
    if bridge.getPlugin(pluginName: "Console") != nil {
      bridge.plugins["Console"] = self
    }
  }

  /**
   * Handle calls to console.log(). A "level" call option may be specified.
   */
  @objc func log(_ call: CAPPluginCall) {
    // If we are handling console calls, there might be a level
    var level = "info"

    if let callLevel = call.getString("level") {
      level = callLevel
    }

    var logLevel = LogLevel.info

    if let convertedLevel = LogLevel(rawValue: level) {
      logLevel = convertedLevel
    }

    self.handleCall(call, logLevel)
  }

  /**
   * Handle calls to console.info().
   */
  @objc func info(_ call: CAPPluginCall) {
    self.handleCall(call, .info)
  }

  /**
   * Handle calls to console.warn().
   */
  @objc func warn(_ call: CAPPluginCall) {
    self.handleCall(call, .warn)
  }

  /**
   * Handle calls to console.error().
   */
  @objc func error(_ call: CAPPluginCall) {
    self.handleCall(call, .error)
  }
}
