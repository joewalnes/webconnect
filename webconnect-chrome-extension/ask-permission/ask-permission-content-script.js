/**
 * Content-script injected into all web-pages that listens for 'webconnect.requestPermission'
 * event and shows the 'Allow [website] to access serial port?' dialog.
 *
 * The actual popup content is opened in an <iframe> injected into the target web-page.
 * We use an <iframe> (as opposed to directly injecting into the page's contents) as this
 * will isolate CSS/JavaScript and prevent the container page from tampering with
 * the content.
 *
 * This looks very similar to a Chrome info-bar to give users a warm fuzzy feeling.
 *
 * See README in this directory to understand the flow.
 *
 * -Joe Walnes
 */

// In the future, we can use the official Chrome Infobar API.
// But not now, as it's still experimental and it would prevent WebConnect from being
// published to the Chrome Store.
// https://developer.chrome.com/extensions/experimental.infobars.html

// TODO: How can this be protected from clickjacking attacks?

// TODO: Handle multiple tabs on same domain requesting permission.

// TODO: Animate.

var shown = false,
    spacer = null,
    container = null;

function showInfoBar() {
    if (shown) {
        return;
    }
    shown = true;

    // Use plain old DOM manipulations (rather than jQuery) because we want to keep this bit as
    // lightweight as possible.

    var containerHeight = '34px';

    spacer = document.createElement('div');
    spacer.style.height = containerHeight;
    spacer.id = 'webconnect-spacer';
    document.body.insertBefore(spacer, document.body.firstChild);

    container = document.createElement('div');
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

    var iframe = document.createElement('iframe');
    iframe.id = 'webconnect-iframe';
    iframe.src = chrome.extension.getURL('ask-permission/bar/bar.html');
    iframe.scrolling = 'no';
    iframe.style.width = '100%';
    iframe.style.height = containerHeight;
    iframe.style.border = 0;
    container.appendChild(iframe);
}

function hideInfoBar() {
    if (!shown) {
       return;
    }
    shown = false;

    container.parentNode.removeChild(container);
    spacer.parentNode.removeChild(spacer);

    container = null;
    spacer = null;
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'webconnect.ask-permission.request') {
        showInfoBar();
    }
    if (request.type == 'webconnect.ask-permission.hide') {
        hideInfoBar();
    }
});
