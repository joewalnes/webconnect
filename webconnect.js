(function() {

  var debug = false;
  var nextRequestId = 1;
  var callbacks = {};

  function SerialPort() {
  };

  function sendRequest(action, args, callback) {
      var id = nextRequestId++;
      window.postMessage({type:'webconnect.fromPage', action:'test', id:id, args:args}, '*');
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

})();
