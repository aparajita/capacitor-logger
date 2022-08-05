//
//  Logger.swift
//  AparajitaCapacitorLogger
//
//  Created by Aparajita on 7/13/22.
//

import Capacitor
import Foundation
import os.log

public class Logger {
  public enum LogLevel: Int {
    case silent = 0
    case error
    case warn
    case info
    case debug

    public static subscript(_ str: String) -> LogLevel? {
      var index = 0

      while let item = LogLevel(rawValue: index) {
        if str == "\(item)" {
          return item
        }

        index += 1
      }

      return nil
    }

    public func asOSLogType() -> OSLogType {
      switch self {
      case .debug:
        return OSLogType.debug
      case .info:
        return OSLogType.info
      case .warn:
        return OSLogType.default
      case .error:
        return OSLogType.error
      case .silent:
        return OSLogType.info // Compiler wants this, it will never be used
      }
    }
  }

  public struct Options {
    public var level: LogLevel
    public var labels: [String: String]
    public var useSyslog: Bool

    public init(level: LogLevel = LogLevel.info, labels: [String: String] = [:], useSyslog: Bool = false) {
      self.level = level
      self.labels = labels
      self.useSyslog = useSyslog
    }
  }

  private var _labels: [LogLevel: String] = [
    LogLevel.silent: "",
    LogLevel.error: "🔴",
    LogLevel.warn: "🟠",
    LogLevel.info: "🟢",
    LogLevel.debug: "🔎"
  ]

  public var labels: [String: String] {
    get {
      var result: [String: String] = [:]

      for (level, label) in _labels {
        result[String(describing: level)] = label
      }

      return result
    }

    set {
      for (level, label) in newValue {
        if let logLevel = LogLevel[level] {
          _labels[logLevel] = label
        }
      }
    }
  }

  public var level = LogLevel.info

  public var levelName: String {
    get {
      String(describing: level)
    }
    set {
      if let newLevel = LogLevel[newValue] {
        level = newLevel
      }
    }
  }

  private var _tag = ""

  public var tag: String {
    get {
      _tag
    }
    set {
      if !newValue.isEmpty {
        _tag = newValue
      }
    }
  }

  private let kDefaultTimerLabel = "default"
  private var timers: [String: Date] = [:]
  public var useSyslog = false

  public convenience init(
    withAppDelegate delegate: UIApplicationDelegate,
    options: Options? = nil
  ) {
    var tag = "App"

    if let info = Bundle.main.infoDictionary,
       let name = info["CFBundleDisplayName"] as? String {
      tag = name
    }

    var config: InstanceConfiguration?

    if let controller = delegate.window??.rootViewController as? CAPBridgeViewController {
      config = controller.bridge?.config
    }

    self.init(withTag: tag, config: config, options: options)
  }

  public convenience init(
    withPlugin plugin: CAPPlugin,
    options: Options? = nil
  ) {
    self.init(withTag: plugin.pluginName, config: plugin.bridge?.config, options: options)
  }

  public convenience init(
    withTag tag: String,
    options: Options? = nil
  ) {
    self.init(withTag: tag, config: nil, options: options)
  }

  private init(
    withTag tag: String,
    config: InstanceConfiguration? = nil,
    options: Options? = nil
  ) {
    self.tag = tag

    if let config = config {
      // The logger plugin's name is LoggerBridge, we want to look at the config
      // named "Logger", so we can't use plugin.getConfigValue().
      if let configLevel = getConfigValue("level", from: config) as? String,
         let logLevel = LogLevel[configLevel] {
        level = logLevel
      }

      if let configLabels = getConfigValue("labels", from: config) as? [String: String] {
        labels = configLabels
      }

      if let configSyslog = getConfigValue("useSyslog", from: config) as? Bool {
        useSyslog = configSyslog
      }
    }

    if let options = options {
      self.level = options.level
      self.labels = options.labels
      self.useSyslog = options.useSyslog
    }
  }

  private func getConfigValue(_ configKey: String, from config: InstanceConfiguration) -> Any? {
    if let config = config.pluginConfigurations as? JSObject {
      return config[keyPath: KeyPath(stringLiteral: "Logger.\(configKey)")]
    }

    return nil
  }

  public func error(_ message: String) {
    log(atLevel: LogLevel.error, message: message)
  }

  public func warn(_ message: String) {
    log(atLevel: LogLevel.warn, message: message)
  }

  public func info(_ message: String) {
    log(atLevel: LogLevel.info, message: message)
  }

  public func log(_ message: String) {
    log(atLevel: LogLevel.info, message: message)
  }

  public func debug(_ message: String) {
    log(atLevel: LogLevel.debug, message: message)
  }

  public func dir(_ value: Any?) {
    // Check the log level here to avoid conversion to string
    if canLog(atLevel: LogLevel.info) {
      log(atLevel: LogLevel.info, message: String(describing: value))
    }
  }

  public func log(atLevel level: LogLevel, message: String) {
    // This will never fail, but we have to keep swift happy
    if let label = _labels[level] {
      log(atLevel: level, label: label, tag: tag, message: message)
    }
  }

  public func log(atLevel level: LogLevel, label: String?, tag: String, message: String) {
    // This will never fail, but we have to keep swift happy
    if let label = label ?? _labels[level] {
      print(atLevel: level, label: label, tag: tag, message: message)
    }
  }

  private func canLog(atLevel level: LogLevel) -> Bool {
    self.level.rawValue >= level.rawValue
  }

  private func print(atLevel level: LogLevel, label: String, tag: String, message: String) {
    guard canLog(atLevel: level) else {
      return
    }

    var msg = message

    if !label.isEmpty {
      // If the label is ASCII, put it after the tag, otherwise before.
      if label[label.startIndex].isASCII {
        msg = "[\(tag)] \(label): \(message)"
      } else {
        msg = "\(label) [\(tag)]: \(message)"
      }
    } else {
      msg = "[\(tag)]: \(message)"
    }

    if useSyslog {
      os_log("%{public}@", type: level.asOSLogType(), msg)
    } else {
      Swift.print(msg)
    }
  }

  public func time(_ label: String?) {
    timers[label ?? ""] = Date()
  }

  public func timeLog(_ label: String?) {
    if let timer = timers[label ?? ""] {
      info(formatTimeInterval(timer.timeIntervalSinceNow))
    } else {
      warn("timer \(label ?? kDefaultTimerLabel) does not exist")
    }
  }

  public func timeEnd(_ label: String?) {
    timeLog(label)
    timers.removeValue(forKey: label ?? kDefaultTimerLabel)
  }

  private func formatTimeInterval(_ interval: TimeInterval) -> String {
    let int = Int(interval)
    let millis = Int(((1 + interval.remainder(dividingBy: 1)) * 1000).rounded())
    let seconds = int % 60
    let minutes = (int / 60) % 60
    let hours = (int / 3600)

    if seconds < 1 {
      return "\(millis)ms"
    }

    if minutes < 1 {
      return "\(seconds).\(String(format: "%0.3d", millis))s"
    }

    if hours < 1 {
      return "\(minutes):\(String(format: "%0.2d", seconds)).\(String(format: "%0.3d", millis)) (min:sec.ms)"
    }

    return "\(hours):\(String(format: "%0.2d", minutes)):\(String(format: "%0.2d", seconds)) (hr:min:sec)"
  }

  public func trace() {
    info(String(format: "%@", Thread.callStackSymbols))
  }
}
