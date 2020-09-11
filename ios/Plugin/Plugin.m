#import <Capacitor/Capacitor.h>

CAP_PLUGIN(WSLogger, "WSLogger",
  CAP_PLUGIN_METHOD(log, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(info, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(warn, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(error, CAPPluginReturnPromise);
)
