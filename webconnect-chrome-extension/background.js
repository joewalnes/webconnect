/**
 * Main extension code. Receives messages from web-pages and mediates
 * access to native plugin.
 *
 * -Joe Walnes
 */

var debug = true;

// Native code.
var serialPlugin = document.getElementById('serialPlugin');

// Handle messages from page.
var pageMessageHandlers = {
   'test': function(args, callback) {
       var result = serialPlugin.echo(args.text);
       callback({text:result});
   }
};

// Wire-up inbound messages from web-page to pageMessageHandlers (above).
chrome.extension.onConnect.addListener(function(port) {
    if (port.name == 'webconnect.contentScript') {
        debug && console.debug('webconnect: connection from contentScript');
        port.onMessage.addListener(function(msg) {
            debug && console.debug('webconnect: received inbound message:', msg);
            var handler = pageMessageHandlers[msg.action];
            if (handler) {
                var callback = function(args) {
                    port.postMessage({type:'webconnect.toPage', id:msg.id, args:args});
                }
                handler(msg.args || {}, callback);
            } else { 
                debug && console.debug('webconnect: unknown action:', msg.action);
            }
        });
    }
    // TODO: detect port disconnect and cleanup
});

debug && console.debug('webconnect: backend initialized');
