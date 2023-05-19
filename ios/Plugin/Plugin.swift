import Capacitor

@objc(LoggerBridge)
public class LoggerBridge: CAPPlugin {
  // Set the level to debug so that all logs can go through.
  // Filtering of logs is done by the TypeScript code.
  private lazy var _logger = Logger(withPlugin: self, options: Logger.Options(level: Logger.LogLevel.debug))

  /*
   * Handle calls to Logger.<level>() from JS.
   */
  @objc func log(_ call: CAPPluginCall) {
    var level = Logger.LogLevel.info.rawValue

    if let callLevel = call.getInt("level") {
      level = callLevel
    }

    var logLevel = Logger.LogLevel.info

    if let convertedLevel = Logger.LogLevel(rawValue: level) {
      logLevel = convertedLevel
    }

    // tag and levelLabel should never be missing, but we have to keep swift happy
    let tag = call.getString("tag") ?? ""
    let label = call.getString("label") ?? ""      
    let content = call.getAny("message") ?? ""
    let message = flatten(content)
      
    _logger.log(atLevel: logLevel, label: label, tag: tag, message: message)

    call.resolve()
  }
    
  func flatten(_ values: Any) -> String {
      return [values].flatMap { $0 as? [Any] ?? [$0] }.map {
          if (JSONSerialization.isValidJSONObject($0)) {
              if let jsonData = try? JSONSerialization.data(withJSONObject: $0, options: []) {
                  return String(data: jsonData, encoding: .ascii) ?? ""
              }
          }
          return String(describing: $0)
      }.joined(separator: " ")
  }

  @objc func setUseSyslog(_ call: CAPPluginCall) {
    if let use = call.getBool("use") {
      _logger.useSyslog = use
    }

    call.resolve()
  }
}
