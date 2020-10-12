package app.willsub.capacitor.logger;

import android.util.Log;

import com.getcapacitor.CapConfig;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

@NativePlugin
public class WSLogger extends Plugin {
  public static enum LogLevel {
    info,
    warn,
    error
  }

  private static Map<LogLevel, String> levelPrefixes;

  static {
    levelPrefixes = new HashMap<>();
    levelPrefixes.put(LogLevel.info, "🟢");
    levelPrefixes.put(LogLevel.warn, "🟠");
    levelPrefixes.put(LogLevel.error, "🔴");
  }

  private String tag;
  private Boolean hideLogs = false;

  @Override
  public void load() {
    tag = getLogTag();
    checkHideFlags();
    loadCustomPrefixes();
  }

  private void checkHideFlags() {
    CapConfig config = bridge.getConfig();
    hideLogs = config != null && config.getBoolean("android.hideLogs", config.getBoolean("hideLogs", false));
    Object value = getConfigValue("hide");

    if (value instanceof Boolean) {
      hideLogs = (Boolean) value;
    }
  }

  private void loadCustomPrefixes() {
    JSONObject prefixes = (JSONObject) getConfigValue("prefixes");

    if (prefixes != null) {
      for (Map.Entry<LogLevel, String> entry : levelPrefixes.entrySet()) {
        try {
          LogLevel level = entry.getKey();
          String prefix = (String) prefixes.get(level.toString());
          levelPrefixes.put(level, prefix);
        } catch (Exception e) {
          // ignore
        }
      }
    }
  }

  public void print(String message) {
    print(message, LogLevel.info, "app");
  }

  public void print(String message, String level) {
    LogLevel logLevel;

    try {
      logLevel = LogLevel.valueOf(level.toLowerCase());
    } catch (Exception e) {
      logLevel = LogLevel.info;
    }

    print(message, logLevel, "app");
  }

  public void print(String message, LogLevel level) {
    print(message, level, "app");
  }

  public void print(String message, LogLevel level, String module) {
    if (hideLogs) {
      return;
    }

    String symbol = getLevelPrefix(level);
    String msg = String.format("%s [%s] %s", symbol, module, message);

    switch (level) {
      case info:
        Log.i(tag, msg);
        break;

      case warn:
        Log.w(tag,msg);
        break;

      case error:
        Log.e(tag, msg);
        break;
    }
  }

  private String getLevelPrefix(LogLevel level) {
    if (levelPrefixes.containsKey(level)) {
      return levelPrefixes.get(level);
    }

    return levelPrefixes.get(LogLevel.info);
  }

  private void handleCall(PluginCall call) {
    String level = call.getString("level", "info");
    LogLevel logLevel;

    try {
      logLevel = LogLevel.valueOf(level);
    } catch (Exception e) {
      logLevel = LogLevel.info;
    }

    handleCall(call, logLevel);
  }

  private void handleCall(PluginCall call, LogLevel level) {
    String message = call.getString("message", "");
    print(message, level);
    call.success();
  }

  @PluginMethod
  public void handleConsole(PluginCall call) {
    final WSLogger logger = this;

    class HandleConsoleRunner implements Runnable {
      public void run() {
        bridge.getWebView().setWebChromeClient(new MyBridgeWebChromeClient(bridge, logger));
      }
    }

    bridge.executeOnMainThread(new HandleConsoleRunner());
  }

  @PluginMethod
  public void log(PluginCall call) {
    handleCall(call);
  }

  @PluginMethod
  public void info(PluginCall call) {
    handleCall(call, LogLevel.info);
  }

  @PluginMethod
  public void warn(PluginCall call) {
    handleCall(call, LogLevel.warn);
  }

  @PluginMethod
  public void error(PluginCall call) {
    handleCall(call, LogLevel.error);
  }
}
