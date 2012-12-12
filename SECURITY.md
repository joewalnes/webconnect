WebConnect Security
===================

So, obviously you wouldn't want any web-page you visit to be able to access your hardware, sending commands to your Arduino or 3D printing questionable objects.

Much like other JavaScript device APIs, such as GeoLocation, webcam, voice, notifications, etc, users will have to grant permissions to apps.

The flow will be:

1. Web-page attemps to open SerialPort (asynchronously).
2. WebConnect shall check settings to see if hardware access (for all sites) is set to
   'Deny-all', 'Allow-all' or 'Allow-whitelisted' (default).
   If 'Deny-all': Disallow serial port, and fire onerror handler. End.
   If 'Allow-all': Allow serial port and continue to native code. End.
   If 'Allow-whitelisted': Continue to next step.
3. WebConnect shall check settings to see if URL matches pattern in current whitelist.
   If match: Allow serial port and continue to native code. End.
   Else: Continue to next step.
3. Browser shall ask user if they would like to 'Allow' or 'Deny' the current website
   access to the serial port.
   If 'Allow': Add website to whitelist, allow serial port anc continue to native code. End.
   Else: Disallow serial port, and fire onerror handler. End.

This is modelled on the flow of security for the existing JavaScript Geolocation API.

Users may manage the settings in the browser/extension settings page. Settings include:

*  Global 'Allow-all', 'Deny-all' or 'Allow-whitelisted' (default) option.
*  List of whitelisted websites that have been allowed.

Discussion points:

*  What is the mechanism used for pattern matching? How much of protocol/hostname/port/path-prefix
   should be included?
*  Should users be able to allow/deny specific ports to specific websites, for the case
   when a user has multiple devices attached to their machine?
*  Is there any danger in letting the web-page (after permission has been granted) to
   know the name of the available serial port?

