package app.willsub.capacitor.logger;

import android.webkit.ConsoleMessage;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebChromeClient;

/**
 * Custom WebChromeClient class that handles console messages.
 */
public class MyBridgeWebChromeClient extends BridgeWebChromeClient {

    private WSLogger logger;

    public MyBridgeWebChromeClient(Bridge bridge, WSLogger logger) {
        super(bridge);
        this.logger = logger;
    }

    /**
     * Handle calls to console.level() by forwarding to WSLogger.
     *
     * @param consoleMessage Formatted text from the console.level() call
     * @return true
     */
    @Override
    public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
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
