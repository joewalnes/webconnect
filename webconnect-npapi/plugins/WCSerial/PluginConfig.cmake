#/**********************************************************\ 
#
# Auto-Generated Plugin Configuration file
# for webconnect-serial
#
#\**********************************************************/

set(PLUGIN_NAME "WCSerial")
set(PLUGIN_PREFIX "WCS")
set(COMPANY_NAME "joewalnes")

# ActiveX constants:
set(FBTYPELIB_NAME WCSerialLib)
set(FBTYPELIB_DESC "WCSerial 1.0 Type Library")
set(IFBControl_DESC "WCSerial Control Interface")
set(FBControl_DESC "WCSerial Control Class")
set(IFBComJavascriptObject_DESC "WCSerial IComJavascriptObject Interface")
set(FBComJavascriptObject_DESC "WCSerial ComJavascriptObject Class")
set(IFBComEventSource_DESC "WCSerial IFBComEventSource Interface")
set(AXVERSION_NUM "1")

# NOTE: THESE GUIDS *MUST* BE UNIQUE TO YOUR PLUGIN/ACTIVEX CONTROL!  YES, ALL OF THEM!
set(FBTYPELIB_GUID 44cd6cd3-3225-577b-ae78-0c2f7df19a9b)
set(IFBControl_GUID 5471cd2a-29cc-5da7-8aec-36b1a0bc5c8a)
set(FBControl_GUID bdb0b311-d573-5a64-91aa-db26d31205b2)
set(IFBComJavascriptObject_GUID 64fd75f5-3bf9-5309-8ad3-d3a938a36481)
set(FBComJavascriptObject_GUID 0f0ace1a-b007-5271-91a9-5f37f33456c9)
set(IFBComEventSource_GUID 0f58db24-74d4-5e06-8d50-962327919a96)

# these are the pieces that are relevant to using it from Javascript
set(ACTIVEX_PROGID "joewalnes.WCSerial")
set(MOZILLA_PLUGINID "joewalnes.com/WCSerial")

# strings
set(FBSTRING_CompanyName "Joe Walnes")
set(FBSTRING_FileDescription "WebConnect: Access to serial port")
set(FBSTRING_PLUGIN_VERSION "1.0.0.0")
set(FBSTRING_LegalCopyright "Copyright 2012 Joe Walnes")
set(FBSTRING_PluginFileName "np${PLUGIN_NAME}.dll")
set(FBSTRING_ProductName "webconnect-serial")
set(FBSTRING_FileExtents "")
set(FBSTRING_PluginName "webconnect-serial")
set(FBSTRING_MIMEType "application/x-webconnect-serial")

# Uncomment this next line if you're not planning on your plugin doing
# any drawing:

set (FB_GUI_DISABLED 1)

# Mac plugin settings. If your plugin does not draw, set these all to 0
set(FBMAC_USE_QUICKDRAW 0)
set(FBMAC_USE_CARBON 0)
set(FBMAC_USE_COCOA 0)
set(FBMAC_USE_COREGRAPHICS 0)
set(FBMAC_USE_COREANIMATION 0)
set(FBMAC_USE_INVALIDATINGCOREANIMATION 0)

# If you want to register per-machine on Windows, uncomment this line
#set (FB_ATLREG_MACHINEWIDE 1)

add_firebreath_library(log4cplus)

