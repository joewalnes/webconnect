This directory contains the mechanism to ask users for permission to use the serial
port.

The interaction is a bit tricky, in order to navigate the various priviliges different
parts of Chrome extensions have, while preventing the un-trusted web-page from tampering.

Parts involved:

*   content-script: Injected into un-trusted web-pages, injects an <iframe> to display
    the user interface.
*   bar: The user interface injected into the <iframe>. Asks user to allow/deny.
*   background: Has full privileges and coordinates between the bar, content-script
    and rest of the extension.

Usage:

*   To trigger the bar to ask permission, send a {type:'webconnect.ask-permission.request'}
    message to a Chrome tab.
*   When the user answers, a message of {type:'webconnect.ask-permssion.allow',pattern:...}
    or {type:'webconnect.ask-permission.deny',pattern:...} will be sent to the extension,
    where pattern is the URL pattern the user has answered.

How it works:

*   ask-permission-content-script is injected into web-pages: it listens for the
    'webconnect.ask-permission.request' message from the main extension.
*   When this message is received the content-script will modify the
    the web-page to add the bar. It injects an <iframe> which loads
    bar/bar.html. 
*   The bar content sends a 'webconnect.ask-permission.get-site' request
    to ask-permission-background.js, which tells it which site it is being
    displayed for (based on the sending tab) and the URL pattern associated
    with that site.
*   The bar asks user 'http://foo wants to access port. Allow/Deny?'.
*   When user responds, bar sends 'webconnect.ask-permission.allow' or
    'webconnect.ask-permission.deny' to ask-permission-background.js.
*   ask-permission-background.js now knows the user's preference
    and sends 'webconnect.ask-permission.hide' back to the original
    ask-permission-content-script.js.
*   ask-permission-content-script.js receives this message and destroys
    the <iframe> injected into the page. Everything looks like it did
    when it started.
    
