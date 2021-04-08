package com.aparajita.capacitor.logger;

import android.util.Log;
import com.getcapacitor.*;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONObject;

@NativePlugin
public class WSLogger extends Plugin {

    public enum LogLevel {
        off,
        error,
        warn,
        info,
        debug,
        trace
    }

    private Map<LogLevel, String> levelPrefixes;
    private String tag;
    private Boolean hideLogs = false;

    @Override
    public void load() {
        tag = getLogTag();
        loadCustomPrefixes();
        setHideFlag();
    }

    /**
     * Determine if we should hide logs. By default, use the ios.hideLogs or hideLogs capacitor setting.
     * If there is a plugins.WSLogger.hide setting, use that. This allows us to hide Capacitor logs but keep user logs.
     */
    private void setHideFlag() {
        CapConfig config = bridge.getConfig();
        hideLogs = config != null && config.getBoolean("android.hideLogs", config.getBoolean("hideLogs", false));
        Object value = getConfigValue("hideLogs");

        if (value instanceof Boolean) {
            hideLogs = (Boolean) value;
        }
    }

    /**
     * Load custom level prefixes from plugins.WSLogger.prefixes.
     */
    private void loadCustomPrefixes() {
        levelPrefixes = new HashMap<>();
        levelPrefixes.put(LogLevel.error, "🔴");
        levelPrefixes.put(LogLevel.warn, "🟠");
        levelPrefixes.put(LogLevel.info, "🟢");
        levelPrefixes.put(LogLevel.debug, "👉");
        levelPrefixes.put(LogLevel.trace, "🔎");

        JSONObject prefixes = (JSONObject) getConfigValue("prefixes");

        if (prefixes != null) {
            for (Map.Entry<LogLevel, String> entry : levelPrefixes.entrySet()) {
                try {
                    LogLevel level = entry.getKey();
                    String prefix = (String) prefixes.get(level.toString());
                    levelPrefixes.put(level, prefix);
                } catch (Exception e) {
                    // level is not in prefixes, ignore
                }
            }
        }
    }

    /**
     * Print a basic message to the log.
     *
     * @param message Raw message
     */
    public void print(String message) {
        print(message, LogLevel.info, "app");
    }

    /**
     * Print a message to the log at the given named log level. If level not a valid LogLevel,
     * LogLevel.info is used.
     *
     * @param message Raw message
     * @param level Log level
     */
    public void print(String message, String level) {
        LogLevel logLevel;

        try {
            logLevel = LogLevel.valueOf(level.toLowerCase());
        } catch (Exception e) {
            logLevel = LogLevel.info;
        }

        print(message, logLevel, "app");
    }

    /**
     * Print a message to the log at the given log level.
     *
     * @param message Raw message
     * @param level Log level
     */
    public void print(String message, LogLevel level) {
        print(message, level, "app");
    }

    /**
     * Print a message to the log at the given log level, scoped to the given module name.
     * The complete log entry is in the format:
     *
     * prefix [module] message
     *
     * where prefix is the one corresponding to the given level.
     *
     * @param message Raw message
     * @param level Log level
     * @param module Free-form module scope
     */
    public void print(String message, LogLevel level, String module) {
        if (hideLogs) {
            return;
        }

        String symbol = getLevelPrefix(level);
        String msg = String.format("%s [%s] %s", symbol, module, message);

        switch (level) {
            case error:
                Log.e(tag, msg);
                break;
            case warn:
                Log.w(tag, msg);
                break;
            case info:
                Log.i(tag, msg);
                break;
            case debug:
                Log.d(tag, msg);
                break;
            case trace:
                Log.v(tag, msg);
                break;
        }
    }

    /**
     * @param level Log level
     * @return Prefix for the given level
     */
    private String getLevelPrefix(LogLevel level) {
        if (levelPrefixes.containsKey(level)) {
            return levelPrefixes.get(level);
        }

        return levelPrefixes.get(LogLevel.info);
    }

    /**
     * Handle a plugin call where the log level may be given in the call options.
     * If there is a "level" call option, and it is a valid LogLevel name, it is
     * used as the log level. Otherwise the level default to info.
     *
     * @param call Plugin call data
     */
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

    /**
     * Extract the "message" call option and print it at the given log level.
     * If there is a "module" call option, it is used.
     *
     * @param call Plugin call options
     * @param level Log level
     */
    private void handleCall(PluginCall call, LogLevel level) {
        String message = call.getString("message", "");
        String module = call.getString("module", "app");
        print(message, level, module);
        call.success();
    }

    /**
     * Patch console.[level] calls to route through this plugin. We do this by installing
     * a custom WebChromeClient that marshals the data in a form that the plugin understands
     * and then calls print(message, level).
     *
     * @param call Plugin call options
     */
    @PluginMethod
    public void handleNativeConsole(PluginCall call) {
        final WSLogger logger = this;

        class HandleConsoleRunner implements Runnable {

            public void run() {
                bridge.getWebView().setWebChromeClient(new MyBridgeWebChromeClient(bridge, logger));
            }
        }

        bridge.executeOnMainThread(new HandleConsoleRunner());
        Log.i(tag, "[WSLogger] Now handling the console");
        call.success();
    }
}
