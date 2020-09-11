import Capacitor

@objc(WSLogger)
public class WSLogger: CAPPlugin {
  static var symbols = [
    "info": "🟢",
    "warn": "🟠",
    "error": "🔴"
  ]
  
  public override func load() {
    self.loadCustomSymbols()
    let handleConsole = getConfigValue("handleConsole") as? Bool ?? true
    
    if handleConsole {
      // Replace the built in Console plugin with this plugin
      if let _ = bridge.getPlugin(pluginName: "Console") {
        bridge.plugins["Console"] = self
      }
    }
  }
  
  func loadCustomSymbols() {
    for level in WSLogger.symbols.keys {
      if let symbol = getConfigValue("\(level)Symbol") as? String {
        WSLogger.symbols[level] = symbol
      }
    }
  }
  
  public func print(_ message: String, level: String = "log", module: String = "app") {
    let symbol = getLevelSymbol(level)
    CAPLog.print("\(symbol) [\(module)] \(message)")
  }

  private func handleCall(_ call: CAPPluginCall, _ level: String = "info") {
    let message = call.getString("message") ?? ""
    let callLevel = call.getString("level")
    self.print(message, level: callLevel ?? level)
    call.success()
  }
  
  private func getLevelSymbol(_ level: String) -> String {
    let lowerLevel = level.lowercased()
    
    if WSLogger.symbols.keys.contains(lowerLevel) {
      return WSLogger.symbols[lowerLevel]!
    }
    
    return WSLogger.symbols["info"]!
  }

  @objc func log(_ call: CAPPluginCall) {
    self.handleCall(call)
  }

  @objc func info(_ call: CAPPluginCall) {
    self.handleCall(call, "info")
  }

  @objc func warn(_ call: CAPPluginCall) {
    self.handleCall(call, "warn")
  }

  @objc func error(_ call: CAPPluginCall) {
    self.handleCall(call, "error")
  }
}
