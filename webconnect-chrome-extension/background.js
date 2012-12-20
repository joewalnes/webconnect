/**
 * Main extension code. Receives messages from web-pages and mediates
 * access to native plugin.
 *
 * -Joe Walnes
 */

// Native code.
var serialPlugin = document.getElementById('serialPlugin');

// Handle messages from page.
var pageMessageHandlers = {
   'test': function(args, callback) {
       var result = serialPlugin.echo(args.text);
       callback({text:result});
   },
   'availablePorts': function(args, callback) {
       var result = serialPlugin.availablePorts();
       callback({portNames:result});
   },
};

var PermissionResult = {
    ALLOW: 'allow',
    DENY: 'deny',
    ASK: 'ask'
};

function checkPermissions(site, callback) {
    // TODO: For reals
    setTimeout(function() {
        callback(PermissionResult.ASK, site);
    }, 0); 
}

function beginSession(port) {
    // TODO: detect port disconnect and cleanup
    // port.onDisconnect
    port.onMessage.addListener(function(msg) {
        console.debug('webconnect: received inbound message:', msg);
        var handler = pageMessageHandlers[msg.action];
        if (handler) {
            var callback = function(args) {
                port.postMessage({type:'webconnect.toPage', id:msg.id, args:args});
            }
            handler(msg.args || {}, callback);
        } else { 
            console.debug('webconnect: unknown action:', msg.action);
        }
    });
}

// Wire-up inbound messages from web-page to pageMessageHandlers (above).
chrome.extension.onConnect.addListener(function(port) {
    if (port.name == 'webconnect.contentScript') {
        var site = port.sender.tab.url;
        console.debug('webconnect: connection from content-script of site:', site);

        checkPermissions(site, function(result, pattern) {
            switch(result) {
                case PermissionResult.ALLOW:
                    console.debug('webconnect: ALLOWED! site:', site, 'pattern:', pattern);
                    port.postMessage({type:'webconnect.allowed', site:site, pattern:pattern});
                    beginSession(port); // Allow communications to continue.
                    break;
                case PermissionResult.DENY:
                    console.debug('webconnect: DENIED! site:', site, 'pattern:', pattern);
                    port.postMessage({type:'webconnect.denied', site:site, pattern:pattern});
                    port.disconnect(); // Good-bye.
                    break;
                case PermissionResult.ASK:
                    console.debug('webconnect: PermissionRequest. site:', site, 'pattern:', pattern);
                    chrome.tabs.sendMessage(port.sender.tab.id,
                        {type:'webconnect.ask-permission.request', site:site, pattern:pattern},
                        function(response) {
                            if (response.authorized) {
                                console.debug('webconnect: PermissionResponse=ALLOWED. site:', site, 'pattern:', pattern);
                                port.postMessage({type:'webconnect.allowed', site:site, pattern:pattern});
                                beginSession(port); // Allow communications to continue.
                            } else { 
                                console.debug('webconnect: PermissionResponse=DENIED. site:', site, 'pattern:', pattern);
                                port.postMessage({type:'webconnect.denied', site:site, pattern:pattern});
                                port.disconnect(); // Good-bye.
                            }
                        }); 
                    break;
                default: 
                    console.error('Unknown PermissionResult', result);
                    port.disconnect();
            }
        });
    }
});

console.debug('webconnect: backend initialized');
