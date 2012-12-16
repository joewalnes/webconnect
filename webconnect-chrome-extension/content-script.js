/**
 * Code injected into all web-pages will listen for messages posted to window and forward
 * them to the rest of the chrome extension (and vice-versa).
 *
 * See http://developer.chrome.com/extensions/content_scripts.html#host-page-communication
 *
 * This script is basically a simple proxy that passes messages from the page's window
 * to the extension background page.
 *
 * In addition, it also listens to requests to show a pop-up info bar at the top
 * of the page if the extension needs to ask the user to allow/deny access to the
 * hardware.
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
    if (event.source == window && msg.type == 'webconnect.ask') {
        showInfoBar();
    }
}

function onMessageFromExtension(msg) {
    if (msg.type == 'webconnect.toPage') {
        debug && console.debug('webconnect: received inbound message:', msg);
        window.postMessage(msg, '*'); // TODO Should '*' be something better?
    }
}

function showInfoBar() {
    // Use plain old DOM manipulations (rather than jQuery) because we want to keep this bit as
    // lightweight as possible.

    var containerHeight = '34px';

    var spacer = document.createElement('div');
    spacer.style.height = containerHeight;
    spacer.id = 'webconnect-spacer';
    document.body.insertBefore(spacer, document.body.firstChild);

    var container = document.createElement('div');
    container.id = 'webconnect-container';
    container.style.top = 0;
    container.style.left = 0;
    container.style.right = 0;
    container.style.height = containerHeight;
    container.style.position = 'fixed';
    container.style.zIndex = 1000000001;
    container.style.borderTop = '1px solid #dedede';
    container.style.borderBottom = '1px solid #8e8e8e';
    container.style.backgroundColor = '#ededed';
    document.body.appendChild(container);

    // We open the info-bar up in an <iframe> (rather than injecting directly into the web-page
    // DOM) to protect the calling web-page from tampering with its contents.
    // TODO: How to protect this from clickjacking?
    var iframe = document.createElement('iframe');
    iframe.id = 'webconnect-iframe';
    iframe.src = chrome.extension.getURL('infobar/prompt.html');
    iframe.scrolling = 'no';
    iframe.style.width = '100%';
    iframe.style.height = containerHeight;
    iframe.style.border = 0;
    container.appendChild(iframe);
}

window.addEventListener('message', onMessageFromPage);
debug && console.debug('webconnect: injected');
