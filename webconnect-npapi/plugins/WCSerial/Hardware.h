#pragma once

/**
 * Provides access to underlying hardware.
 *
 * -Joe Walnes
 */
#include <list>
#include <string>

namespace Hardware {

/**
* List available serial port names.
*/
std::list<std::string> availablePorts();

};
