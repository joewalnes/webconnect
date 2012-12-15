/**
 * Options page UI.
 *
 * -Joe Walnes
 */

function wireUpNavigationLinks() {
    // Courtesy of Chrome-Bootstrap example
    // http://roykolak.github.com/chrome-bootstrap/
    // https://github.com/roykolak/chrome-bootstrap
    $('.menu a').click(function(ev) {
	ev.preventDefault();
	var selected = 'selected';

	$('.mainview > *').removeClass(selected);
	$('.menu li').removeClass(selected);
	setTimeout(function() {
	    $('.mainview > *:not(.selected)').css('display', 'none');
	}, 100);

	$(ev.currentTarget).parent().addClass(selected);
	var currentView = $($(ev.currentTarget).attr('href'));
	currentView.css('display', 'block');
	setTimeout(function() {
	    currentView.addClass(selected);
	}, 0);

	setTimeout(function() {
	    $('body')[0].scrollTop = 0;
	}, 200);
    });
    $('.mainview > *:not(.selected)').css('display', 'none');
}

function bindSettingsToUi() {

    $('input[name=whitelist-mode]').change(function() {
	webConnectSettings.setMode($('input[name=whitelist-mode]:checked').val());
    });

    function renderMode(mode) {
	$('input[name=whitelist-mode]').each(function(i, el) {
            var checked = $(el).attr('value') == mode;
            $(el).attr('checked', checked);
	});
        $('.allowed-sites').toggle(mode == WhitelistMode.ASK);
    }

    $('#delete-all-whitelisted-sites').click(function() {
        webConnectSettings.deleteAllWhitelistedSites();
    });

    function renderWhitelistedSites(sites) {
        $('.whitelist-site').not('.template').remove();
	if (sites.length == 0) {
	    $('.allowed-sites-none').show(); 
	    $('#delete-all-whitelisted-sites, .whitelist-sites').hide();
	} else { 
	    $('.allowed-sites-none').hide(); 
	    $('#delete-all-whitelisted-sites, .whitelist-sites').show();
	    sites.forEach(function(site) {
		var el = $('.whitelist-site.template').clone().removeClass('template').appendTo('.whitelist-sites');
		el.find('.label').text(site);
		el.find('.delete').click(function() {
                    webConnectSettings.deleteWhitelistedSite(site);
                });
	    });
	}
    }

    webConnectSettings.getMode(renderMode);
    webConnectSettings.addModeChangeListener(renderMode);
    webConnectSettings.getWhitelistedSites(renderWhitelistedSites);
    webConnectSettings.addWhitelistedSitesChangeListener(renderWhitelistedSites);
    $('.allowed-sites').hide();

}

$(wireUpNavigationLinks);
$(bindSettingsToUi);
