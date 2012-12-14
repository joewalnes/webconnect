/**
 * -Joe Walnes
 */
#include <boost/filesystem.hpp>

#include "Hardware.h"

namespace fs = boost::filesystem;

namespace Hardware {

bool looks_like_serial_port(std::string name);

/**
 * List available serial port names.
 */
std::list<std::string> availablePorts() {
    fs::path dev("/dev");
    std::list<std::string> results;
    if (fs::exists(dev) && fs::is_directory(dev)) {
        fs::directory_iterator end_iter;
        for (fs::directory_iterator iter(dev); iter != end_iter; ++iter) {
            fs::path fullPath = dev / iter->leaf();
            if (looks_like_serial_port(iter->leaf())) {
                results.push_back(fullPath.file_string());
            }
        }
    }
    return results;
}

#if FB_X11
bool looks_like_serial_port(std::string name) {
      return name.find("ttyACM") == 0 || name.find("ttyUSB") == 0;
}
#elif FB_MACOSX
bool looks_like_serial_port(std::string name) {
      return name.find("tty.usbmodem") == 0 || name.find("tty.serial") == 0;
}
#elif FB_WIN
bool looks_like_serial_port(std::string name) {
    return false; // TODO
}
#else
#error "Unknown OS"
#endif

}
