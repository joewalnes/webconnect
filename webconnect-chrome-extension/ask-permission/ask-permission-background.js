/**
 * Background script that support the 'ask permission' flow.
 *
 * See README in this directory to understand the flow.
 *
 * -Joe Walnes
 */

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

    // From bar.html. Find out the site (and URL pattern) associated with
    // the page hosting the bar.
    if (request.type == 'webconnect.ask-permission.get-site') {
        var site = sender.tab.url,
            pattern = site; // TODO
        sendResponse({site:site, pattern:pattern});
    }

    if (request.type == 'webconnect.ask-permission.allow') {
        console.log('ALLOWED', request.pattern); // TODO
        sendResponse();
        chrome.tabs.sendMessage(sender.tab.id, {type:'webconnect.ask-permission.hide'});
    }

    if (request.type == 'webconnect.ask-permission.deny') {
        console.log('DENIED', request.pattern); // TODO
        sendResponse();
        chrome.tabs.sendMessage(sender.tab.id, {type:'webconnect.ask-permission.hide'});
    }
});
