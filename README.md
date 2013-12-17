WebConnect - JavaScript access to hardware devices
==================================================

__Note: This is a work in progress... still lots to do. Many of the things on this page haven't been implemented yet!__

What is this?
-------------

WebConnect provides a set of simple to use JavaScript APIs to make it easy to talk to hardware devices using your serial port. Yep, you can talk to hardware directly from a simple web-page!

It has been primarily designed for communicating with devices such as [Arduino](http://arduino.cc/) or [mBed](http://mbed.org).

The APIs will allow a simple web-page page to communicate with the device, making it easy to build control panels or visualize sensor data.

Examples uses
-------------

*   Plot a real time chart of sensor readings.
*   Provide buttons and sliders to control a device.
*   Create an editor for settings stored on the device.
*   Upload new firmware via a simple user interface.
*   Connect to a meshed wireless network node and visualize the network topology.
*   Something that involves sharks with frickin' laser beams.

API
---

The main abstraction is `SerialPort`. This provides a simple mechanism to discover connected serial ports, connect to them, and send/receive _messages_.

_Messages_ are an abstraction to simplify working with a stream of data in an asyncronous non-blocking world (the JavaScript runtime). Rather than receiving chunks of characters as they appear, the `SerialPort` API shall buffer the stream until it sees a logical message and pass your application the entire message.

By default, the `SerialPort` API shall break apart a stream of text at newline `\n` characters and treat each line as a message.

Hello World
-----------

    <script src="webconnect.js">
    <script>
      // Initialize serial port with default settings.
      // If you don't specify a port name (e.g. COM3 on Windows
      // or /dev/ttyBlah on Linux or OSX), it shall attempt to
      // connect to the first device it finds on a serial port.
      var serialPort = new SerialPort();
      serialPort.open();
    </script>

    <!-- Send the string '1' or '0' (followed by new line) when
         buttons are clicked. -->
    <button onclick="serialPort.send('1')>On</button>
    <button onclick="serialPort.send('0')>Off</button>



[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/joewalnes/webconnect/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

