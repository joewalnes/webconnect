/**
 * Store WebConnect Chrome extension sessings
 * in chrome.storage.local.
 *
 * -Joe Walnes
 */

var WhitelistMode = {
    ALL: 'all',
    NONE: 'none',
    ASK: 'ask'
};

var webConnectSettings = (function() {

    var storage = chrome.storage.local;
    var modeChangeListeners = [];
    var whitelistedSitesChangeListeners = [];

    function addModeChangeListener(listener) {
        modeChangeListeners.push(listener);
    }

    function addWhitelistedSitesChangeListener(listener) {
        whitelistedSitesChangeListeners.push(listener);
    }

    function getMode(callback) {
        // TODO: verify
        storage.get(['whitelistMode'], function(data) {
             var mode = data.whitelistMode;
             callback(mode || WhitelistMode.ASK);
        });
    }

    function setMode(mode) {
        storage.set({whitelistMode:mode});
    }

    function getWhitelistedSites(callback) {
        storage.get(['whitelistedSites'], function(data) {
            callback(data.whitelistedSites || []);
        });
    }

    function addWhitelistedSite(site) {
         addWhitelistedSites([site]);
    }

    function addWhitelistedSites(sites) {
        getWhitelistedSites(function(existing) {
             sites.forEach(function(site) { existing.push(sites) });
             sites.sort();
             storage.set({whitelistedSites: existing});
        });
    }

    function deleteWhitelistedSite(site) {
        getWhitelistedSites(function(existing) {
             var index = existing.indexOf(site);
             if (index > -1) {
                 existing.splice(index, 1);
             }
             storage.set({whitelistedSites: existing});
        });
    }

    function deleteAllWhitelistedSites() {
        storage.set({whitelistedSites: []});
    }

    chrome.storage.onChanged.addListener(function(changes, area) {
        if (area == 'local') {
            if ('whitelistMode' in changes) {
                modeChangeListeners.forEach(function(listener) {
                    // TODO: Verify
                    listener(changes['whitelistMode'].newValue || WhitelistMode.ASK);
                }); 
            } 
            if ('whitelistedSites' in changes) {
                whitelistedSitesChangeListeners.forEach(function(listener) {
                    // TODO: Verify
                    listener(changes['whitelistedSites'].newValue || []);
                }); 
            } 
        }
    });

    return {
         getMode: getMode,
         setMode: setMode,
         getWhitelistedSites: getWhitelistedSites,
         addWhitelistedSite: addWhitelistedSite,
         addWhitelistedSites: addWhitelistedSites,
         deleteWhitelistedSite: deleteWhitelistedSite,
         deleteAllWhitelistedSites: deleteAllWhitelistedSites,
         addModeChangeListener: addModeChangeListener,
         addWhitelistedSitesChangeListener: addWhitelistedSitesChangeListener
    };

})();
