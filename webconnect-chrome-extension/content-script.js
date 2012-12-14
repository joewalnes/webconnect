/**
 * Code injected into all web-pages will listen for messages posted to window and forward
 * them to the rest of the chrome extension (and vice-versa).
 *
 * See http://developer.chrome.com/extensions/content_scripts.html#host-page-communication
 *
 * This script is basically a simple proxy that passes messages from the page's window
 * to the extension background page.
 *
 * -Joe Walnes
 */

var debug = false;

// Communicate with the rest of the extension.
var extensionPort = null;

function onMessageFromPage(event) {
    var msg = event.data;
    if (event.source == window && msg.type == 'webconnect.fromPage') {
        if (!extensionPort) {
            // Lazily connect to backend extension.
            extensionPort = chrome.extension.connect({name:'webconnect.contentScript'});
            extensionPort.onMessage.addListener(onMessageFromExtension);
            debug && console.debug('webconnect: connecting to extension');
        }
        // Forward message to backend extension.
        debug && console.debug('webconnect: forwarding message:', msg);
        extensionPort.postMessage(msg);
    }
}

function onMessageFromExtension(msg) {
    if (msg.type == 'webconnect.toPage') {
        debug && console.debug('webconnect: received inbound message:', msg);
        window.postMessage(msg, '*'); // TODO Should '*' be something better?
    }
}

window.addEventListener('message', onMessageFromPage);
debug && console.debug('webconnect: injected');
