package app.willsub.capacitor.logger;

import android.util.Log;
import android.webkit.ConsoleMessage;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebChromeClient;
import com.getcapacitor.Logger;

public class MyBridgeWebChromeClient extends BridgeWebChromeClient {
  private WSLogger logger;

  public MyBridgeWebChromeClient(Bridge bridge, WSLogger logger) {
    super(bridge);
    this.logger = logger;
  }

  @Override
  public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
    String tag = Logger.tags("Console");

    if (consoleMessage.message() != null && isValidMsg(consoleMessage.message())) {
      String msg = consoleMessage.message();
      String level = consoleMessage.messageLevel().name();

      switch (level.toLowerCase()) {
        case "log":
          level = "info";
          break;

        case "warning":
          level = "warn";
          break;
      }

      logger.print(msg, level);
    }

    return true;
  }
}
