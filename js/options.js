
'use strict';

$(document).ready(function () {

	restoreOptions();
	
	// Initialize theme on page load
	initializeTheme();

	$('#save').on('click', function () {
		saveOptions();
	});

	$('#reset').on('click', function () {
		$('#badge-display-mode').val(DEFAULT_BADGE_DISPLAY_MODE);
		$('#warning-count').val(DEFAULT_WARNING_COUNT);
		$('#theme-selector').val(DEFAULT_THEME);
		$('#real-time-apply-switch').find('.switch').addClass('switch-on').removeClass('switch-off');
		$('#open-in-new-tab-switch').find('.switch').addClass('switch-on').removeClass('switch-off');
		
		// Apply default theme immediately
		applyTheme(DEFAULT_THEME);
		
		alertify.success(str_alertify_success_scope_reset_options, 2000);
	});

	$('#warning-count').on('change', function () {
		var value = $(this).val();
		if (value < 100) value = 100;
		value = parseInt(value / 100);
		value *= 100;
		$(this).val(value);
	});

	$('#real-time-apply-switch').find('.switch').on('click', function () {
		$(this).toggleClass('switch-on switch-off');
	});

	$('#open-in-new-tab-switch').find('.switch').on('click', function () {
		$(this).toggleClass('switch-on switch-off');
	});
	
	// Theme selector change handler
	$('#theme-selector').on('change', function () {
		var selectedTheme = $(this).val();
		applyTheme(selectedTheme);
	});
});

function initializeTheme() {
	StorageManager.get({
		theme: DEFAULT_THEME
	}, function (items) {
		applyTheme(items.theme);
	});
}

function applyTheme(theme) {
	// Apply theme to the HTML element
	document.documentElement.setAttribute('data-theme', theme);
}

function saveOptions() {

	var badgeDisplayMode = $('#badge-display-mode').val();
	var warningCount = $('#warning-count').val();
	var selectedTheme = $('#theme-selector').val();
	
	var isRealTimeApplied;
	if ($('#real-time-apply-switch').find('.switch').hasClass('switch-on')) {
		isRealTimeApplied = true;
	} else {
		isRealTimeApplied = false;
	}

	var isOpenInNewTab;
	if ($('#open-in-new-tab-switch').find('.switch').hasClass('switch-on')) {
		isOpenInNewTab = true;
	} else {
		isOpenInNewTab = false;
	}

	StorageManager.set({
		// default values
		badge: badgeDisplayMode,
		warning: warningCount,
		apply: isRealTimeApplied,
		openInNewTab: isOpenInNewTab,
		theme: selectedTheme
	}, function () {
		alertify.success(str_alertify_success_saved, 2000);
	});
}

function restoreOptions() {

	StorageManager.get({
		// default values
		badge: DEFAULT_BADGE_DISPLAY_MODE,
		warning: DEFAULT_WARNING_COUNT,
		apply: true,
		openInNewTab: true,
		theme: DEFAULT_THEME
	}, function (items) {
		$('#badge-display-mode').val(items.badge);
		$('#warning-count').val(items.warning);
		$('#theme-selector').val(items.theme);
		
		if (items.apply) {
			$('#real-time-apply-switch').find('.switch').addClass('switch-on').removeClass('switch-off');
		} else {
			$('#real-time-apply-switch').find('.switch').removeClass('switch-on').addClass('switch-off');
		}

		if (items.openInNewTab) {
			$('#open-in-new-tab-switch').find('.switch').addClass('switch-on').removeClass('switch-off');
		} else {
			$('#open-in-new-tab-switch').find('.switch').removeClass('switch-on').addClass('switch-off');
		}
	});
}

