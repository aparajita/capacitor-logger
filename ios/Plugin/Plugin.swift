import Capacitor

@objc(LoggerBridge)
public class LoggerBridge: CAPPlugin {
  private var _logger: Logger?

  override public func load() {
    // Set the level to debug so that all logs can go through.
    // Filtering of logs is done by the TypeScript code.
    _logger = Logger(withPlugin: self, options: Logger.Options(level: Logger.LogLevel.debug))
  }

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
    let message = call.getString("message") ?? ""
    _logger?.log(atLevel: logLevel, label: label, tag: tag, message: message)

    call.resolve()
  }

  @objc func setUseSyslog(_ call: CAPPluginCall) {
    if let use = call.getBool("use") {
      _logger?.useSyslog = use
    }

    call.resolve()
  }
}
