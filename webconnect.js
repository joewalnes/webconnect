/**
 * Provides access to the SerialPort using the WebConnect browser extension.
 *
 * -Joe Walnes
 */
(function() {

  var debug = false;
  var nextRequestId = 1;
  var callbacks = {};

  function SerialPort() {
  };

  function sendRequest(action, args, callback) {
      var id = nextRequestId++;
      window.postMessage({type:'webconnect.fromPage', action:action, id:id, args:args}, '*');
      callbacks[id] = callback;
  }

  function receiveMessage(event) {
      var msg = event.data;
      if (event.source == window && msg.type == 'webconnect.toPage') {
          debug && console.debug('SerialPort got:', msg);
          var id = msg.id;
          if (id !== undefined) {
              var callback = callbacks[id];
              delete callbacks[id];
              callback && callback(msg.args);
          }
      }
  }

  window.addEventListener("message", receiveMessage, false);
  window.SerialPort = SerialPort;

  // API

  SerialPort.test = function(text, callback) {
      sendRequest('test', {text:text}, function(args) {
         callback(args.text);
      });
  };

  /**
   * List available ports names. Takes a callback that's passed
   * an array of strings.
   *
   * On Windows, this will look something like ['COM1', 'COM2', ...].
   * On Mac/Linux, something like ['/dev/ttyusbblah1', ...].
   *
   * Usage:
   *
   *   SerialPort.availablePorts(function(portNames) {
   *       console.log(portNames);
   *   });
   */
  SerialPort.availablePorts = function(callback) {
      sendRequest('availablePorts', {}, function(args) {
         callback(args.portNames);
      });
  };
})();
