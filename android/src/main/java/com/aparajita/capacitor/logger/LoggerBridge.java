package com.aparajita.capacitor.logger;

import com.aparajita.capacitor.logger.Logger.LogLevel;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "LoggerBridge")
public class LoggerBridge extends Plugin {

  private Logger logger;

  @Override
  public void load() {
    // Set the level to debug so all logs will go through.
    // Level filtering is handled by the TypeScript code.
    logger = new Logger(this, new Logger.Options(LogLevel.debug));
  }

  @PluginMethod
  public void log(PluginCall call) {
    LogLevel level;

    // These values should never actually be missing, but we have to keep Java happy
    Integer callLevel = call.getInt("level");

    if (callLevel == null) {
      level = LogLevel.info;
    } else {
      level = LogLevel.values()[callLevel];
    }

    String label = call.getString("label");

    if (label == null) {
      label = "";
    }

    String tag = call.getString("tag");

    if (tag == null) {
      tag = "";
    }

    String message = call.getString("message");

    if (message == null) {
      message = "";
    }

    logger.logWithTagAtLevel(level, label, tag, message);
    call.resolve();
  }
}
