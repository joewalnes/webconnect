WebConnect FireBreath Plugin
============================

This directory contains the native browser plugin that provides the access to
the serial port hardware.

It uses [http://firebreath.org/](FireBreath) to provide a C++ library that
can be loaded into browsers supporting NPAPI (FireFox, Chrome, Safari) or
Active-X (Internet Explorer). It supports Windows, OS-X and Linux.

The plugin itself should not be treated as safe to use directly from
a web-page. Instead it should only be loaded from a browser extension
which should mediate access (e.g. checking if that particular domain
allows access to a serial port).

Building
--------

Prequisites:
*   GNU Make: Standard on OS-X and Linux. On Windows, install [Cygwin](http://www.cygwin.com).
*   [CMake](http://www.cmake.org/): Cross platform make tool used to build FireBreath modules.
*   Python 2.7

Build:

    make

