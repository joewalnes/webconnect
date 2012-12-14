#pragma once

/**
 * Main plugin API, available through JavaScript.
 *
 * -Joe Walnes (and FireBreath)
 */
#include <string>
#include <sstream>
#include <boost/weak_ptr.hpp>
#include "JSAPIAuto.h"
#include "BrowserHost.h"
#include "WCSerial.h"

class WCSerialAPI : public FB::JSAPIAuto {
public:

    WCSerialAPI(const WCSerialPtr& plugin, const FB::BrowserHostPtr& host)
            : plugin(plugin), host(host) {
        registerMethod("echo", make_method(this, &WCSerialAPI::echo));
        registerMethod("availablePorts", make_method(this, &WCSerialAPI::availablePorts));
    }

    virtual ~WCSerialAPI() {};

    WCSerialPtr getPlugin();

    // --- Exposed API ---

    /**
     * For testing. Simply returns the value passed in.
     */
    FB::variant echo(const FB::variant& msg);

    /**
     * Returns string array of available serial port names.
     */
    FB::VariantList availablePorts();

private:
    WCSerialWeakPtr plugin;
    FB::BrowserHostPtr host;
};
