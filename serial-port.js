/**
 * SerialPort - Easy access to the serial port from inside a Chrome Packaged App or
 * Chrome extension.
 *
 * This API wraps chrome.serial <http://developer.chrome.com/trunk/apps/serial.html> making
 * it much easier to use. It models the WebSocket API to make it familiar.
 *
 * It requires permission:['serial'] in the packaged app or extension manifest.json file.
 *
 * Tested on OSX and Linux. (TODO: Windows).
 *
 * Features
 * ========
 *
 *   - Guess the serial port, based on platform.
 *   - Simple WebSocket like API.
 *   - Breaks serial stream into messages based on delimiter.
 *   - Pluggable encoding/decoding of messages.
 *
 * Example
 * =======
 *
 *   // Initialize with options (see below).
 *   SerialPort serial = new Serial({bitrate:57600});
 *
 *   // Wire up event callbacks.
 *   serial.onopen    = function()       { console.log('open'); }
 *   serial.onclose   = function()       { console.log('closed'); }
 *   serial.onmessage = function(event)  { console.log('msg', event.data); }
 *   serial.onerrore  = function(error)  { console.error(error); }
 *
 *   // Open serial port.
 *   serial.open();
 *
 *   // Send some data.
 *   // This will include a new line appended to the end. See delimiter section below.
 *   somebutton.onclick = function() {
 *     serial.send('hello');
 *   };
 *
 * Delimiters
 * ==========
 *
 * Rather than exposing the data as a continuous stream of characters (which
 * can be awkward to work with in a non-blocking environment), the library will break
 * the stream up into messages, which split by delimiters. The default delimiter is '\n',
 * but this can be changed using the inboundDelimiter and outboundDelimiter options passed
 * to the constructor.
 *
 * For example, if the serial port receives the stream of characters 'HELLO\nWORLD\naAND\nBYE',
 * this shall result in the the onmessage event being raised 3 times with data 'HELLO', 'WORLD',
 * 'AND'. Note the message does not contain the delimiter. Also the 'BYE' message was not received
 * as it the delimiter has not yet been received (indicating there may be more of the message).
 * 
 * Encoding and Decoding
 * =====================
 *
 * By default, the message you send/receive is a string. However, you can also plug in an encoder
 * and decoder which allows you to pass/receive other types from the API and perform the translation
 * just before sending to the hardware.
 *
 * For example, you could use the standard JSON.stringify() / JSON.parse() methods to convert
 * JavaScript objects to JSON strings.
 *
 *   SerialPort serial = new SerialPort({
 *       encoder: JSON.stringify,
 *       decoder: JSON.parse
 *   });
 *
 *   // sometime later
 *   serial.send({msg:'foo', count:1}); // Send an object, which will get converted to JSON.
 *
 *   serial.onmessage = function(event) {
 *     var msg = event.data; // The JSON string has already been decoded to an object.
 *     console.log(msg.someField);
 *   };
 *
 * Options
 * =======
 *
 *   port: Optional string (e.g. '/dev/ttyUSB3'). Default will attempt to guess.
 *   bitrate: Optional integer (e.g. 57600). Default: 9600.
 *   encoder: Function that will be applied to each outbound message. To encode objects using JSON, set this to JSON.stringify. Default: null (no transformation.
 *   decoder: Function that will be applied to each inbound message. To decode objects using JSON, set this to JSON.parse. Default: null (no transformation.
 *   inboundDelimiter: Character that marks end of inbound messages. Default: '\n'.
 *   outboundDelimiter: Character that marks end of outbound messages. Default: '\n'.
 *   idleReadDelay: To conserve CPU, make a short pause between read operations that return 0 bytes. Default 20 (milliseconds).
 *
 * -Joe Walnes
 */
function SerialPort(options) {
  options = options || {};
  function value(v, fallback) { return v === undefined ? fallback : v; }
  this.port = value(options.port, null);;
  this.bitrate = value(options.bitrate, 9600);
  this.encoder = value(options.encoder, null);
  this.decoder = value(options.decoder, null);
  this.inboundDelimiter = value(options.inboundDelimiter, '\n');
  this.outboundDelimiter = value(options.outboundDelimiter, '\n');
  this.idleReadDelay = value(options.idleReadDelay, 20);
}

SerialPort.CONNECTING = 0;
SerialPort.OPEN = 1;
SerialPort.CLOSING = 2;
SerialPort.CLOSED = 3;

/**
 * State of port. One of: SerialPort.CONNECTING, SerialPort.OPEN,
 * SerialPort.CLOSING or SerialPort.CLOSED.
 */
SerialPort.prototype.readyState = SerialPort.CLOSED;

/**
 * Underlying chrome.serial connectionId used to communicated with hardware.
 */
SerialPort.prototype.connectionId = undefined;

/**
 * If no port was specified in the constructor, and a port was successfully
 * guessed, this string contains that value.
 */
SerialPort.prototype.guessedPort = undefined;

/**
 * While a message is being read (before the the delimiter is encountered), the
 * data is buffered here (array of strings).
 */
SerialPort.prototype.readBuffer = undefined;

/**
 * Assign a function to this method to be notified when the port has been
 * succesfully open. After this occurs, the serialPort.readyState will
 * be SerialPort.OPEN and it is safe to send messages.
 */
SerialPort.prototype.onopen = function() {};

/**
 * Assign a function to this method to be notified when the port has been
 * closed. This may be the result of disconnected hardware, or an explicit
 * call to serialPort.close(). After this occurs, the serialPort.readyState will
 * be SerialPort.CLOSED and it is no longer safe to send messages.
 */
SerialPort.prototype.onclose = function() {};

/**
 * Assign a function to this method to be notified when an error occurs.
 * The error message (string) shall be passed to the function.
 */
SerialPort.prototype.onerror = function(error) {};

/**
 * Assign a function to this method to be notified when a full message has
 * arrived. Only one message shall be passed in at a time - if a batch of
 * messages arrive, the onmessage handler shall be called multiple times.
 *
 * The actual message is accessible as event.data.
 *
 * Messages are split up based on delimiters. The default is a '\n'. To
 * change this, use the inboundDelimiter option to the SerialPort constructor.
 *
 * If a decoder was passed to as an option to the SerialPort constructor,
 * the message will automatically be decoded, before being passed to this
 * callback (e.g. convert a JSON string to an object). The raw undecoded
 * value is avaliable as event.rawData.
 */
SerialPort.prototype.onmessage = function(event) {};

/**
 * Open a connection to the SerialPort.
 *
 * If a port was specified as an option in the SerialPort constructor,
 * that port shall be used, otherwise, an attempt shall be made to
 * guess the port and use that (see SerialPort.guessPort()). If a
 * successful guess is made, you can read the value
 * serialPort.guessedPort to find out what it was.
 *
 * Opening a SerialPort is asynchronous - calling .open() followed by .send()
 * is likely to fail. You should wait for the onopen event before sending
 * data.
 *
 * If the SerialPort cannot be opened, the onerror and onclose events shall be fired.
 *
 * If a SerialPort instance is opened and then later closed, it is safe to call open() again
 * to attempt to re-open.
 */
SerialPort.prototype.open = function() {
  if (this.readyState === SerialPort.CONNECTING) {
    this.onerror('Cannot open port that is already connecting.');
    throw 'Cannot open port that is already connecting.';
  }
  if (this.readyState === SerialPort.OPEN) {
    this.onerror('Cannot open port that is already open.');
    throw 'Cannot open port that is already open.';
  }
  var self = this;
  function open(port) {
    chrome.serial.open(port, {bitrate:self.bitrate}, function(connectionInfo) {
      self.connectionId = connectionInfo.connectionId;
      self.readyState = SerialPort.OPEN;

      // prepare for reading
      self.readBuffer = [];
      chrome.serial.read(self.connectionId, 1, onRead);
      
      self.onopen();
    });
  }
  function onRead(readInfo) {
    if (readInfo.bytesRead) {
      var str = String.fromCharCode.apply(null, new Uint8Array(readInfo.data));
     
      if (self.readyState == SerialPort.OPEN) {
        chrome.serial.read(self.connectionId, 1, onRead); // Again!
      }

      for (var i = 0; i < str.length; i++) {
        var c = str[i];
        if (c === self.inboundDelimiter) {
          var fullMessage = self.readBuffer.join('');
          var decoded = self.decoder ? self.decoder(fullMessage) : fullMessage;
          var event = {
            data: decoded,
            rawData: fullMessage
          };
          self.onmessage(event);
          self.readBuffer = [];
        } else {
          self.readBuffer.push(c);
        }
      }
    } else {
      // Annoyingly, the chrome.serial API hammers the CPU if calling read() repeatedly.
      // To address this, we introduce a slight delay between reads.
      // Note: We only delay if the last read resulted in no-data. If we read some data,
      // we try to read all the remaining as fast as possible.
      setTimeout(function() {
        if (self.readyState == SerialPort.OPEN) {
          chrome.serial.read(self.connectionId, 1, onRead);
        }
      }, self.idleReadDelay);
    }
  }
  if (this.port) {
    open(port);
  } else {
    SerialPort.guess(function(err, port) {
      if (err) {
        self.readyState = SerialPort.CLOSED;
        self.onerror(err);
        self.onclose();
      } else {
        self.guessedPort = port; 
        open(port);
      }
    });
  };
  this.readyState = SerialPort.CONNECTING;
};

/**
 * Close the SerialPort.
 *
 * This is asynchronous - the onclose callback shall be called when done.
 *
 * After the onclose callback has fired, it is safe to call open() to
 * attempt to re-open.
 */
SerialPort.prototype.close = function() {
  var self = this;
  if (this.readyState === SerialPort.OPEN) {
    this.readyState = SerialPort.CLOSING;
    chrome.serial.close(this.connectionId, function() {
      self.readyState = SerialPort.CLOSED;
      self.onclose();
    });
    self.connectionId = undefined;
  } else {
    this.onerror('Cannot close port unless it is already open.');
    throw 'Cannot close port unless it is already open.';
  }
};

/**
 * Send a message to the SerialPort.
 *
 * If an encoder function was passed to the SerialPort constructor
 * options, it shall automatically be applied to the message before
 * it is sent to the wire. For example, if the encoder is JSON.stringify,
 * the object shall be automatically converted to JSON.
 *
 * If no encoder function was specified, then the message MUST be a string.
 *
 * Every message shall have '\n' appeneded on the wire, or a user specified
 * delimiter passed as the outboundDelimiter option to the SerialPort
 * constructor.
 *
 * This should only be called when serialPort.readyState == SerialPort.OPEN,
 * i.e. after the onopen event, but before the onclose event.
 */
SerialPort.prototype.send = function(msg) {
  if (this.readyState === SerialPort.OPEN) {
    if (this.encoder) {
      msg = this.encoder(msg);
    }
    var buffer = new ArrayBuffer(msg.length + 1);
    var charView = new Uint8Array(buffer);
    for (var i = 0; i < msg.length; i++) {
      charView[i] = msg.charCodeAt(i);
    }
    charView[msg.length] = this.outboundDelimiter.charCodeAt(0);
    chrome.serial.write(this.connectionId, buffer, function() {});
    chrome.serial.flush(this.connectionId, function() {});
  } else {
    this.onerror('Cannot close port that is not open');
  }
};

/**
 * Attempt to guess a serial port, based on ports available,
 * and platform specific pattern rules.
 *
 * Pass a callback function that accepts two parameters:
 *   - err: String if there's an error, otherwise undefined.
 *   - port: String if there's no error.
 *
 * Usage:
 *
 *   SerialPort.guess(function(err, port) {
 *     if (err) {
 *       console.log('Error:', err);
 *     } else {
 *       console.log('Found port:', port);
 *     }
 *   });
 */
SerialPort.guess = function(callback) {

  function platformSpecificPrefixes() {
    var platform = navigator.platform;
    if (platform.startsWith('Mac')) {
      return ['/dev/tty.usbmodem', '/dev/tty.usbserial'];
    } else if (platform.startsWith('Linux')) {
      return ['/dev/ttyACM', '/dev/ttyUSB'];
    } else {
      // TODO: Windows
      throw 'Unsupported platform: ' + platform;
    }
  };

  if (!chrome || !chrome.serial) {
    throw 'Chrome Serial port API not available';
  }

  var prefixes = platformSpecificPrefixes();
  chrome.serial.getPorts(function(ports) {
    var filtered = ports.filter(function(port) {
      return prefixes.some(function(prefix) { return port.startsWith(prefix); });
    });
    if (!filtered.length) {
      callback('No likely serial ports found.', undefined);
    } else {
      callback(undefined, filtered[0]);
    }
  });

};

// TODO: larger read lengths.
// TODO: Protect against exceptions in user callbacks.
// TODO: Detect when port is closed and fire callback.
// TODO: Auto-reconnect.
