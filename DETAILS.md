WebConnect Implementation Details
=================================

This document explains how the internals of WebConnect work.

A survey of the landscape
-------------------------

These were the options considered to allow JavaScript access to hardware.

=== Packaged Apps Hardware APIs (Chrome) ===

As of recent Chrome builds there now exists the 
[chrome.serial](http://developer.chrome.com/trunk/apps/serial.html) and
[chrome.usb](http://developer.chrome.com/trunk/apps/usb.html) APIs.

These can be used from Chrome Packaged Apps which are basically locally
installable web-apps with additional privileges.

When the WebConnect API is used from a Chrome Packaged App, it shall use
these APIs.

Unfortunately, these APIs cannot be used from standard web-pages or even
browser extensions, making it limited in use. Developing and deploying
Chrome Packaged Apps is more cumbersome than standard web apps, so this
option has limited appeal.

Summary: Chrome hardware APIs are available to packaged apps, but not
standard web-apps or browser extensions.


=== Native Client and Untrusted PPAPI (Chrome) ===

Recent builds of Chrome now have [Native Client](https://developers.google.com/native-client/)
(NaCL) available. This allows C
or C++ code to be cross compiled and run inside the browser.

Native Client provides a runtime sandboxed container that restricts what
the native C/C++ code can do. For example, you cannot open files outside
the assigned sandbox directory assigned. Plugins are run in a separate
process and communicate via inter-process-messaging (IPC).

PPAPI (Pepper Plugin API) is the C/C++ API you interact with. It is used
for untrusted plugins (Native Client) and trusted plugins (see below).

Due to the restrictions of the Native Client sandbox, it is not possible
to access hardware resources, unless PPAPI provides custom interfaces to
do this (which it currently does not). 

Summary: Native Client does not help.


=== Trusted PPAPI (Chrome) ===

Chrome also has an extension mechanism based on the same PPAPI interfaces
for [trusted plugins](http://www.chromium.org/nativeclient/getting-started/getting-started-background-and-basics#TOC-Trusted-vs-Untrusted).
Unlike the untrusted Native Client hosted plugins,
these DO have full access to the local computer resources (files, processes,
etc). 

In addition, they run in the same process as the browser renderer,
allowing direct calls to be made from JavaScript without having to use an
asyncronous messaging API.

As you'd expect, this is obviously a security issue, so installing a plugin
has to be done explicitly by the end user. This includes downloading a
platform specific library, and starting Chrome with command line arguments
to enable it. This is not something an end-user can easily do.

Trusted plugins cannot be distributed the the Chrome store.

Building trusted plugins is non-trivial - it's not meant for mainstream
use and the only way to do it currently is by checking out the entire
Chromium source tree and building from there.

Summary: Trusted plugins do help, but they are hard to build and even harder
to distribute. Tools would be required to help users install these.


=== NPAPI (FireFox, Opera, Safari, and sorta Chrome) ===

[NPAPI](http://en.wikipedia.org/wiki/NPAPI) (Netscape Plugin API) 
is the age-old interface to writing plugins
such as Flash, PDF Reader, QuickTime, etc.

It is a hairy C API, with lots of browser and platform specific quirks.

It's the officially supported way to write plugins in FireFox, Opera and
Safari (and many others), on many platforms including Windows, Linux and
OS-X.

Chrome currently supports it, though this may change in the future as it
is now deprecated in favor of PPAPI. Chromium OS does not support NPAPI.

Internet Explorer does not support it (it did once, briefly).

NPAPI is painful to work with, but it does give unrestricted access to
the local resources.

NPAPI cannot be installed just be clicking a link on a page. Typically a
user would have to download and run an installer that would copy the
plugin libraries to the computer and install them in the browser.

Summary: NPAPI is hairy, but gives the required capabilities in FireFox,
Opera and Safari. Also works in Chrome for the moment, but this may
change one day.


=== Active-X (Internet Explorer) ===

[Active-X](http://en.wikipedia.org/wiki/ActiveX) is
Microsoft's plugin mechanism for Internet Explorer. Similar capabilities
to NPAPI.

Will work in most versions of Internet Explorer on standard PCs. Will [not
work in IE10 in Metro mode](http://msdn.microsoft.com/en-us/library/ie/hh968248(v=vs.85).aspx).

Summary: Will give IE users the access they need.


=== Firebreath ===

[Firebreath](http://firebreath.org) is an open source project that simplifies native plugin
development on top of NPAPI and Active-X. It is relatively painless
to write a plugin in C++ once using Firebreath's abstractions that
will then work in all the various NPAPI browsers and platforms, and
Active-X. It's great!

The project contains abstractions to unifiy the various NPAPI versions
and Active-X into a single API, cross platform build script and libraries
for common browser plugin tasks. It heavily uses Boost and neatly
integrates Boost's C++ object reference counting into the browser's
JavaScript reference tracking.

Summary: Using Firebreath will give good coverage of the major browsers
on the major platforms. That is, so long as Chrome continue to support
NPAPI.


=== Signed Java Applets ===

[Signed Java Applets](http://en.wikipedia.org/wiki/Java_applet#Signed)
can be embedded in web-pages that run with elevated priviliges.

Using [Java Native Interface](http://en.wikipedia.org/wiki/Java_Native_Interface)
(JNI), the Java Applet can also invoke native C/C++ code to access the serial port.

The web-page JavaScript may then communicate with Java using
[LiveConnect](http://en.wikipedia.org/wiki/LiveConnect).

However browser Java support is not as wide-spread as it once was. Few
browsers come bundled with a client side JVM these days, so it typically
requires an extra installation step.

In addition, client side Java Applets have a slow startup time (due to the
cost of initiating a JVM), and causes the page to become unresponsive at
startup. Not an ideal user experience (though there may be ways around this
- for example by loading it in a background page in a Chrome extension).

Summary: Signed Applets may work, but JVM still needs to be installed, and
the overhead is not ideal.


=== Flash ===

Flash provides no mechanism for integrating with custom hardware.


=== Installable Service ===

Another approach would be to install a small standalone service that runs 
on the user's computer (outside of the web-browser), that proxies the
hardware to a web-page via a WebSocket (with necessary authentication,
of course).

This service could be written in many languages (C, C++, Python, Ruby,
Go, Java, .NET, Perl, etc). It may even be possible to build it as a
[Chrome Packaged App](http://developer.chrome.com/apps/about_apps.html)
which has permissions to talk to hardware.

The downside is that this is a separate service the user would have to
install, though if the installation process was simple enough, it may
not be an issue.

Summary: This is a great fallback plan, to cover all the browsers and
platforms that another solution cannot be found for.


=== Custom Browser ===

If the browser itself is open source (Chrome, Firefox), it's also possible
to fork the browser, integrate the APIs and create a custom build.

Not ideal though as no-one wants to download a specialized browser, and
the overhead of keeping it up to date will be high.


=== Open Standards ===

The ultimate goal will be if we could create a web-standard that was adopted
by browser vendors. There are already many
[similar standards](http://www.w3.org/TR/#tr_Javascript_APIs) in the works.

This is obviously a much longer term thing, and the work on the WebConnect
project can help get the momentum and interest necessary.



So, how will WebConnect do it?
------------------------------

*   Phase 1 [DONE]: Use chrome.serial. This is the simplest but not that practical.
    as it's limited to Chrome packaged apps. Enough to get a proof-of-concept though.
*   Phase 2: Use FireBreath to create a native NPAPI plugin for hardware access, and
    wrap it up in a Chrome extension that provides UI integration for managing which
    pages/domains may access the serial port. Supports Chrome on Windows, OS-X and Linux.
*   Phase 3: Create a FireFox extension version of the Chrome extension in phase 2.
    This will re-use the NPAPI plugin. Supports FireFox on Windows, OS-X and Linux.
*   Phase 4: Evaluate benefit of targetting other browses (IE and Safari), and repeat.
*   Phase 5: Evangalize and work on web-standards to attempt to make this an official
    API supported by browsers.




    

