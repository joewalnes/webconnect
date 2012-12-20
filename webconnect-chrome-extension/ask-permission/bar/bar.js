/**
 * Content of allow/deny bar.
 *
 * See README in this directory to understand the flow.
 *
 * -Joe Walnes
 */

// When the page loads, the text and buttons are hidden.

// Before we can do anything, we need to figure out which site we are.
// The safest way to do this is to send a message to the background page
// who can tell us information about the sender.
chrome.extension.sendMessage({type:'webconnect.ask-permission.get-site'}, function(response) {

    // Ok, we know which site we're on now. Specifically we care about the
    // pattern (host, port, path) etc that the background chose for us.
    var pattern = response.pattern;

    // Display the pattern to the user.
    document.getElementById('pattern').innerText = pattern;

    // Hook up allow/deny buttons to backend.
    document.getElementById('allow').onclick = function() {
        chrome.extension.sendMessage({type:'webconnect.ask-permission.allow', pattern:pattern});
    };
    document.getElementById('deny').onclick = function() {
        chrome.extension.sendMessage({type:'webconnect.ask-permission.deny', pattern:pattern});
    };
    document.getElementById('close').onclick = function() {
        chrome.extension.sendMessage({type:'webconnect.ask-permission.deny', pattern:pattern});
    };

    // Ok, we're ready to show the text and buttons to the user now.
    document.getElementById('content').style.display = 'block';
});

