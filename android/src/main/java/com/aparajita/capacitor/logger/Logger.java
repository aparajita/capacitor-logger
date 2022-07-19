package com.aparajita.capacitor.logger;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.util.ArrayMap;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.getcapacitor.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import org.jetbrains.annotations.Contract;
import org.json.JSONObject;

public class Logger {

  public enum LogLevel {
    silent,
    error,
    warn,
    info,
    debug
  }

  public static class Options {

    LogLevel level;
    Map<String, String> labels;

    Options() {
      level = LogLevel.info;
      labels = null;
    }

    Options(@NonNull Options other) {
      level = other.level;
      labels = other.labels;
    }

    Options(LogLevel level) {
      this.level = level;
      this.labels = null;
    }

    Options(Map<String, String> labels) {
      this.level = LogLevel.info;
      this.labels = labels;
    }

    Options(LogLevel level, Map<String, String> labels) {
      this.level = level;
      this.labels = labels;
    }
  }

  public LogLevel level;
  private final Map<LogLevel, String> labels = new ArrayMap<>();
  private String tag;
  private final ArrayMap<String, Long> timers = new ArrayMap<>();
  private final String kDefaultTimerLabel = "default";

  public Logger(@NonNull BridgeActivity activity) {
    super();
    this.initWithActivity(activity, new Options());
  }

  public Logger(@NonNull BridgeActivity activity, Options options) {
    super();
    this.initWithActivity(activity, options);
  }

  private void initWithActivity(
    @NonNull BridgeActivity activity,
    Options options
  ) {
    Context context = activity.getApplicationContext();
    PackageManager pm = context.getPackageManager();
    ApplicationInfo info;

    try {
      info = pm.getApplicationInfo(context.getPackageName(), 0);
    } catch (PackageManager.NameNotFoundException e) {
      info = null;
    }

    String tag = (String) (info != null ? pm.getApplicationLabel(info) : "App");
    CapConfig config = activity.getBridge().getConfig();
    init(tag, config, options);
  }

  public Logger(Plugin plugin) {
    super();
    initWithPlugin(plugin, new Options());
  }

  public Logger(Plugin plugin, Options options) {
    super();
    initWithPlugin(plugin, options);
  }

  private void initWithPlugin(@NonNull Plugin plugin, Options options) {
    init(plugin.getAppId(), plugin.getBridge().getConfig(), options);
  }

  public Logger(String tag) {
    super();
    init(tag, new Options());
  }

  public Logger(String tag, Options options) {
    super();
    init(tag, options);
  }

  private void init(
    String tag,
    @Nullable CapConfig config,
    @Nullable Options options
  ) {
    Options resolvedOptions = options != null
      ? new Options(options)
      : new Options();

    if (config != null) {
      // The logger plugin's name is LoggerBridge, we want to look at the config
      // named "Logger".
      PluginConfig loggerConfig = config.getPluginConfiguration("Logger");
      String configLevel = loggerConfig.getString("level");

      if (configLevel != null) {
        Object maybeLevel = getLevelWithName(configLevel);

        if (maybeLevel != null) {
          resolvedOptions.level = (LogLevel) maybeLevel;
        }
      }

      JSONObject configLabels = loggerConfig.getObject("labels");

      if (configLabels != null) {
        resolvedOptions.labels = new ArrayMap<>();

        for (Iterator<String> it = configLabels.keys(); it.hasNext();) {
          String key = it.next();
          String value = configLabels.optString(key);

          if (!value.isEmpty()) {
            resolvedOptions.labels.put(key, value);
          }
        }
      }
    }

    init(tag, resolvedOptions);
  }

  private void init(String tag, @NonNull Options options) {
    this.level = options.level;
    this.labels.putAll(
        Map.of(
          LogLevel.silent,
          "",
          LogLevel.error,
          "🔴",
          LogLevel.warn,
          "🟠",
          LogLevel.info,
          "🟢",
          LogLevel.debug,
          "\uD83D\uDD0E"
        )
      );

    if (options.labels != null) {
      setLabels(options.labels);
    }

    this.tag = tag;
  }

  @Nullable
  public Object getLevelWithName(String name) {
    try {
      return LogLevel.valueOf(name);
    } catch (IllegalArgumentException ex) {
      return null;
    }
  }

  public String getLevelName() {
    return level.name();
  }

  public void setLevelName(String name) {
    try {
      level = LogLevel.valueOf(name);
    } catch (IllegalArgumentException e) {
      // Ignore it
    }
  }

  public Map<String, String> getLabels() {
    ArrayMap<String, String> result = new ArrayMap<>();

    for (Map.Entry<LogLevel, String> entry : labels.entrySet()) {
      result.put(entry.getKey().name(), entry.getValue());
    }

    return result;
  }

  public void setLabels(@NonNull Map<String, String> labels) {
    for (Map.Entry<String, String> entry : labels.entrySet()) {
      Object level = getLevelWithName(entry.getKey());

      if (level != null) {
        this.labels.put((LogLevel) level, entry.getValue());
      }
    }
  }

  public String getTag() {
    return tag;
  }

  public void setTag(@NonNull String tag) {
    if (!tag.isEmpty()) {
      this.tag = tag;
    }
  }

  public void error(String message) {
    logWithTagAtLevel(LogLevel.error, "", tag, message);
  }

  public void warn(String message) {
    logWithTagAtLevel(LogLevel.warn, "", tag, message);
  }

  public void info(String message) {
    logWithTagAtLevel(LogLevel.info, "", tag, message);
  }

  public void log(String message) {
    info(message);
  }

  public void debug(String message) {
    logWithTagAtLevel(LogLevel.debug, "", tag, message);
  }

  public void logAtLevel(LogLevel level, String message) {
    logWithTagAtLevel(level, "", tag, message);
  }

  public void logAtLevel(String level, String message) {
    logWithTagAtLevel(resolveLevelName(level), "", tag, message);
  }

  public void logWithTagAtLevel(LogLevel level, String tag, String message) {
    logWithTagAtLevel(level, "", tag, message);
  }

  public void logWithTagAtLevel(String level, String tag, String message) {
    logWithTagAtLevel(resolveLevelName(level), "", tag, message);
  }

  private LogLevel resolveLevelName(String name) {
    Object level = getLevelWithName(name);

    if (level != null) {
      return (LogLevel) level;
    }

    return LogLevel.info;
  }

  public void logWithTagAtLevel(
    LogLevel level,
    String label,
    String tag,
    String message
  ) {
    if (this.level.compareTo(level) < 0) {
      return;
    }

    if (label.isEmpty()) {
      label = labels.get(level);
    }

    // If the label is ASCII, surround it with []
    String format;

    if (label != null) {
      format = label.charAt(0) <= 127 ? "[%s]: %s" : "%s %s";
    } else {
      label = "";
      format = "%s%s";
    }

    message = String.format(format, label, message);

    if (tag.isEmpty()) {
      tag = this.tag;
    }

    switch (level) {
      case error:
        Log.e(tag, message);
        break;
      case warn:
        Log.w(tag, message);
        break;
      case info:
        Log.i(tag, message);
        break;
      case debug:
        Log.d(tag, message);
        break;
    }
  }

  public void dir(Object value) {
    String message;

    if (value != null) {
      if (value.getClass().isArray()) {
        Object[] arr = (Object[]) value;
        message = Arrays.deepToString(arr);
      } else {
        try {
          message = value.toString();
        } catch (Exception ex) {
          message = String.format("<%s>", ex.getMessage());
        }
      }
    } else {
      message = "null";
    }

    info(message);
  }

  public void time() {
    time(kDefaultTimerLabel);
  }

  public void time(String label) {
    timers.put(label, new Date().getTime());
  }

  public void timeLog() {
    timeLog(kDefaultTimerLabel);
  }

  public void timeLog(String label) {
    label = resolveTimerLabel(label);

    if (timers.containsKey(label)) {
      Long start = timers.get(label);

      // This will always be true
      if (start != null) {
        long now = new Date().getTime();
        long diff = now - start;
        info(
          String.format(
            Locale.getDefault(),
            "%s: %s",
            label,
            formatMilliseconds(diff)
          )
        );
      }
    } else {
      warn(String.format("timer '%s' does not exist", label));
    }
  }

  public void timeEnd() {
    timeEnd(kDefaultTimerLabel);
  }

  public void timeEnd(String label) {
    label = resolveTimerLabel(label);
    timeLog(label);
    timers.remove(label);
  }

  @Contract(pure = true)
  private String resolveTimerLabel(@NonNull String label) {
    return label.isEmpty() ? kDefaultTimerLabel : label;
  }

  @NonNull
  private String formatMilliseconds(long milliseconds) {
    long seconds = Math.floorDiv(milliseconds, 1000);
    long minutes = Math.floorDiv(seconds, 60);
    long hours = Math.floorDiv(minutes, 60);
    long millis = milliseconds % 1000;

    if (seconds < 1) {
      return String.format(Locale.getDefault(), "%dms", milliseconds);
    }

    if (minutes < 1) {
      return String.format(Locale.getDefault(), "%d.%ds", seconds, millis);
    }

    seconds = seconds % 60;

    if (hours < 1) {
      return String.format(
        Locale.getDefault(),
        "%d:%02d.%03d (min:sec.ms)",
        minutes,
        seconds,
        millis
      );
    }

    minutes = minutes % 60;
    return String.format(
      Locale.getDefault(),
      "%d:%02d:%02d (hr:min:sec)",
      hours,
      minutes,
      seconds
    );
  }

  public void trace() {
    StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
    ArrayList<String> stack = new ArrayList<>();

    for (StackTraceElement element : stackTrace) {
      stack.add(element.toString());
    }

    info("trace\n" + String.join("\n", stack));
  }
}
