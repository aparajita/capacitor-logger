#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(WSLogger, "WSLogger",
  CAP_PLUGIN_METHOD(handleNativeConsole, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(log, CAPPluginReturnPromise);
)
