//http://search.yahoo.com/search?p=%s

var keywordMap = []; //empty array. will be used as a JSON array

//load the saved map of keywords to a arrays of sites
function loadKeywordMap() {
	chrome.storage.sync.get({
		keywordMap : keywordMap
	}, loadCallback);
}

//callback after loading keyword map (sets it to the empty array defined at top)
function loadCallback(items) {
	keywordMap =  items.keywordMap; //set array
}

//check array if the keyword typed is in the array (i.e. was previously saved)
function queryArray(keyword) {
	for (var i = 0; i < keywordMap.length; ++i) { //loop through array
		//console.log(keywordMap[i]);
		if (keyword === keywordMap[i].text) { //if keyword found in array,
			if (keywordMap[i].sites) { //if a sites array was found (not null)
				return keywordMap[i].sites; //return the sites array
			}
		}
	}
	return []; //if not found (or null), return an empty array
}

//listener handler for omnibox keyword entered
function handleInput(text, disposition) { //disposition is the preferred place to open the tab (new tab, same tab)
	//split the text after the extension keyword at the first space. if there is no space, all text goes into "terms"
	var search = text.substr(0, text.indexOf(' '));
	var terms = text.substr(text.indexOf(' ') + 1);
	if (search) { //if seasrch term not empty (a space was entered after extension keyword)
		var sitesArray = queryArray(search); //call method to search array for user-defined (second) keyword
		if (sitesArray.length > 0) { //if there were sites found in the array (greater than 0 sites found)
			for (var i = 0; i < sitesArray.length; ++i) { //iterate through that array
				var url1 = sitesArray[i].substr(0, sitesArray[i].indexOf("%s")); //split the string at the %s. if no %s was found, whole string wil lgo to url2
				var url2 = sitesArray[i].substr(sitesArray[i].indexOf("%s") + 2); //any data after %s would be put into url2 to be appended after search terms added
				if (url1) { //if %s was found (url is not empty)
					if (i == 0 && disposition == "currentTab") { //for first site, if disposition is requesting same tab
						chrome.tabs.update({url: url1 + encodeURIComponent(terms) + url2}); //open url in current tab with URI-ready search terms inserted into string
					} else {
						chrome.tabs.create({url: url1 + encodeURIComponent(terms) + url2, active : false}); //otherwise, open URL in new tab with URI-ready search terms inserted into string
					}
					return; //accomplished open tabs, so exit method
				}
			}
		}
	}
	//if no sites found (keyword not saved in array or no sites saved under keyword),
	//we will default to a google search of input string.
	if (disposition == "currentTab") { //if disposition is requesting same tab
		chrome.tabs.update({url: "https://www.google.com/search?q=" + encodeURIComponent(terms)}); //open url in current tab with URI-ready search terms
	} else { //otherwise
		chrome.tabs.create({url: "https://www.google.com/search?q=" + encodeURIComponent(terms)}); //open url in new tab with URI-ready search terms
	}
}

//when then extension's browser button has been clicked, open the options page
function openOptions() {
	chrome.tabs.create({url: "options.html"}); //open the options page in a new tab
}

document.addEventListener('DOMContentLoaded', loadKeywordMap); //when script is finished loading, call method to load saved array
chrome.omnibox.onInputEntered.addListener(handleInput); //when extension keyword entered into omnibox, call method to handle string
chrome.browserAction.onClicked.addListener(openOptions); //when browser button clicked, call the method to open the options page.
chrome.storage.onChanged.addListener(function(changes, namespace) { //when the saved data has changed, reload it in this script by calling the load method
	for (key in changes) {
		if (key === "keywordMap") {
			loadKeywordMap();
			break;
		}
	}
});
