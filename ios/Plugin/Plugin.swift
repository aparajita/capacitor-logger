import Capacitor

@objc(WSLogger)
public class WSLogger: CAPPlugin {
  public enum LogLevel: String {
    case info
    case warn
    case error
  }
  
  var levelPrefixes = [
    LogLevel.info.rawValue: "🟢",
    LogLevel.warn.rawValue: "🟠",
    LogLevel.error.rawValue: "🔴"
  ]
  
  var hideConsole = false
  var hideLogs = false
  
  public override func load() {
    loadCustomPrefixes()
    
    if let hide = (bridge.config.getValue("ios.hideLogs") as? Bool) ?? (bridge.config.getValue("hideLogs") as? Bool) {
      hideConsole = hide
      hideLogs = hideConsole
    }
    
    if let hide = getConfigValue("hide") as? Bool ?? hideConsole {
      hideLogs = hide
    }
  }
  
  func loadCustomPrefixes() {
    guard let prefixes = getConfigValue("prefixes") as? [String:Any] else {
      return
    }
    
    for level in prefixes.keys {
      if let symbol = prefixes[level] as? String {
        levelPrefixes[level] = symbol
      }
    }
  }
  
  public func print(_ message: String, level: LogLevel = LogLevel.info, module: String) {
    let symbol = getLevelPrefix(level)
    Swift.print("\(symbol) [\(module)] \(message)")
  }
  
  private func getLevelPrefix(_ level: LogLevel) -> String {
    if levelPrefixes.keys.contains(level.rawValue) {
      return levelPrefixes[level.rawValue]!
    }
    
    return levelPrefixes[LogLevel.info.rawValue]!
  }

  private func handleCall(_ call: CAPPluginCall, _ level: LogLevel) {
    if !self.hideLogs {
      let message = call.getString("message") ?? ""
      let module = call.getString("context") ?? "app"
      self.print(message, level: level, module: module)
    }
    
    call.success()
  }

  @objc func handleConsole(_ call: CAPPluginCall) {
    // Replace the built in Console plugin with this plugin
    if let _ = bridge.getPlugin(pluginName: "Console") {
      bridge.plugins["Console"] = self
    }
  }
  
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

  @objc func info(_ call: CAPPluginCall) {
    self.handleCall(call, .info)
  }

  @objc func warn(_ call: CAPPluginCall) {
    self.handleCall(call, .warn)
  }

  @objc func error(_ call: CAPPluginCall) {
    self.handleCall(call, .error)
  }
}
