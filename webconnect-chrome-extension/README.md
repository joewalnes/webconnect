WebConnect Chrome Extension
===========================

This Chrome extension allows the native serial port hardware to be accessed from a standard
web-page.

The pieces:

*   NPAPI plugin: the native C++ browser plugin bundled with this extension
    that allows JavaScript calls to the underlying hardware. For security, this
    plugin cannot be called directly from a web-page - it can only be called from
    inside the extension.

*   Background page: the main extension. This receives requests (indirectly, see below)
    from web-pages (possibly many) and coordinates access to the native plugin. It also
    ensures that web-pages cannot access the native plugin unless the user has explicitly
    allowed it.

*   Content-script: a lightweight snippet injected into all web-pages that allows the
    messages to be passed (via window.postMessage) back and forth between the web-page
    and the background-page. Also injects the 'Allow [website] to access the serial
    port' infobar into the current page, when needed.

*   API: The ../webconnect.js script that users need to include in their page that
    wraps the extension messaging protocol in the final API.

*   Infobar: If extension wants to ask user for permission to access the port, it
    injects an <iframe> into the target web-page which includes a bar asking
    user to allow/deny.

*   Options Page: Where user can change the settings.
