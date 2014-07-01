//http://search.yahoo.com/search?p=%s

var keywordMap = []; //empty array. will be used as a JSON array

function loadKeywordMap() {
	chrome.storage.sync.get({
		keywordMap : keywordMap
	}, loadCallback);
}

function loadCallback(items) {
	keywordMap =  items.keywordMap; //set array
	//console.log(keywordMap);
}

function queryArray(keyword) {
	//console.log(keywordMap);
	for (var i = 0; i < keywordMap.length; ++i) {
		//console.log(keywordMap[i].text);
		if (keyword === keywordMap[i].text) {
			return keywordMap[i].sites;
		}
	}
	return [];
}

function handleInput(text, disposition) {
	//console.log(disposition);
	var search = text.substr(0, text.indexOf(' '));
	var terms = text.substr(text.indexOf(' ') + 1);
	var sitesArray = queryArray(search);
	if (sitesArray.length > 0) {
		for (var i = 0; i < sitesArray.length; ++i) {
			var url1 = sitesArray[i].substr(0, sitesArray[i].indexOf("%s"));
			var url2 = sitesArray[i].substr(sitesArray[i].indexOf("%s") + 2);
			if (url1.length > 0) {
				var offset = 0;
				if (i == 0 && disposition == "currentTab") {
					chrome.tabs.update({url: url1 + encodeURIComponent(terms) + url2});
				} else {
					//window.open(url1 + terms + url2, "_blank");
					chrome.tabs.create({url: url1 + encodeURIComponent(terms) + url2, active : false});
				}
			}
		}
	} else {
		if (disposition == "currentTab") {
			chrome.tabs.update({url: "https://www.google.com/search?q=" + encodeURIComponent(terms)});
		} else {
			chrome.tabs.create({url: "https://www.google.com/search?q=" + encodeURIComponent(terms)});
		}
	}
}

document.addEventListener('DOMContentLoaded', loadKeywordMap);
chrome.omnibox.onInputEntered.addListener(handleInput);
chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		if (key === "keywordMap") {
			loadKeywordMap();
			break;
		}
	}
});

//open options page
//chrome.browserAction.onClicked.addListener();
