
'use strict';

var bookmarkData;
var badgeType;

// Initialize when the service worker starts or install
chrome.runtime.onInstalled.addListener(function () {
	refreshTree();
	updateBadgeTextType();
});

// register refreshTree listeners
chrome.bookmarks.onCreated.addListener(refreshTree);
chrome.bookmarks.onRemoved.addListener(refreshTree);
chrome.bookmarks.onChanged.addListener(refreshTree);
//chrome.bookmarks.onMoved.addListener(refreshTree);
//chrome.bookmarks.onChildrenReordered.addListener(refreshTree);
chrome.bookmarks.onImportEnded.addListener(refreshTree);
refreshTree();

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status === 'complete' || changeInfo.url) {
		updateBadgeText(tabId, changeInfo, tab);
	}
});

chrome.storage.onChanged.addListener(updateBadgeTextType);
updateBadgeTextType();

chrome.tabs.onActivated.addListener(function (activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function (tab) {
		if (chrome.runtime.lastError) return;
		updateBadgeText(undefined, undefined, tab);
	});
});

function refreshTree() {
	chrome.bookmarks.search({}, function (results) {
		//handleRuntimeError();
		bookmarkData = results;

		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			if (tabs && tabs[0]) {
				updateBadgeText(undefined, undefined, tabs[0]);
			}
		});
	});
}

function updateBadgeText(tabId, changeInfo, tab) {

	//console.log("updateBadgeText");

	if (!bookmarkData) {
		refreshTree();
		return;
	}

	var results = bookmarkData;

	// Safety check for tab.url
	if (!tab || !tab.url) return;

	// how many pages are bookmarked with the current domain?
	if (badgeType == "domain") {

		var reg = /:\/\/[^/]*/;
		var match = reg.exec(tab.url);
		var url = match ? match[0] : null;

		if (!url) {
			setBadgeText("");
			return;
		}

		var count = 0;

		for (var i = 0; i < results.length; i++) {
			if (results[i].url == undefined) continue;
			if (results[i].url.includes(url)) count++;
		}

		setBadgeText(count);

		// how many pages are bookmarked entirely?
	} else if (badgeType == "total") {

		var count = 0;

		for (var i = 0; i < results.length; i++) {
			if (results[i].url == undefined) continue;
			count++;
		}

		setBadgeText(count);

		// how many pages are bookmarked today?
	} else if (badgeType == "today") {

		var startTime = new Date().setHours(0, 0, 0, 0);
		var endTime = new Date().setHours(24, 0, 0, 0);

		var count = 0;

		for (var i = 0; i < results.length; i++) {
			if (results[i].url == undefined) continue;
			if (results[i].dateAdded < startTime) continue;
			if (results[i].dateAdded > endTime) continue;
			count++;
		}

		setBadgeText(count);

		// none
	} else {
		setBadgeText("");
	}


}

function updateBadgeTextType() {

	//console.log("updateBadgeTextType");

	chrome.storage.sync.get({
		badge: "domain",
	}, function (items) {
		badgeType = items.badge;
	});

	chrome.tabs.query({
		active: true,
		currentWindow: true,
	}, function (tabs) {
		if (tabs && tabs[0]) {
			updateBadgeText(undefined, undefined, tabs[0]);
		}
	});

}

function setBadgeText(count) {
	if (count > 999) {
		count = parseInt(count / 1000) + "k";
	}
	if (count > 999999) {
		count = parseInt(count / 1000000) + "m";
	}
	chrome.action.setBadgeText({ text: count.toString() });
}
