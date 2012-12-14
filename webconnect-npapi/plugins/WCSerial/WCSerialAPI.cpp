/**
 * -Joe Walnes
 */
#include "JSObject.h"
#include "variant_list.h"
#include "DOM/Document.h"
#include "global/config.h"

#include "Hardware.h"

#include "WCSerialAPI.h"

WCSerialPtr WCSerialAPI::getPlugin() {
    WCSerialPtr pluginPtr(plugin.lock());
    if (!pluginPtr) {
        throw FB::script_error("The plugin is invalid");
    }
    return pluginPtr;
}

/**
 * For testing. Simply returns the value passed in.
 */
FB::variant WCSerialAPI::echo(const FB::variant& msg) {
    return msg;
}

/**
 * Returns string array of available serial port names.
 */
FB::VariantList WCSerialAPI::availablePorts() {
    return FB::make_variant_list(Hardware::availablePorts());
}
