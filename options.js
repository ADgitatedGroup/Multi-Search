var keywordMap = []; //empty array. will be used as a JSON array

var list = document.getElementById("categories"); //get the HTML datalist from the page
var textBox = document.getElementById("category"); //get the HTML input for the category string from the page
var sitesList = document.getElementById("sitesList"); //get List element containing sites

var maxSites = 15;
var siteCount = 0;

// Saves options to chrome.storage
function saveOptions() {
	chrome.storage.sync.set({
		keywordMap: keywordMap //save keywordMap to settings
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById("status");
		status.textContent = "Options saved.";
		setTimeout(function() {
			status.textContent = "";
		}, 1000);
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
	chrome.storage.sync.get({
		keywordMap: keywordMap //pull keywordMap from saved data
	}, function(items) {
		keywordMap = items.keywordMap; //set array
		//create HTML elements for the dropdown from the array data
		for (var i = 0; i < keywordMap.length; ++i) { //for each saved keyword,
			var newCat = document.createElement("option"); //create option element
			newCat.id = "opt" + i.toString(); //change its id so can be referenced elsewhere
			newCat.text = keywordMap[i].text; //set its text to that of the saved keyword
			list.appendChild(newCat); //add it to the datalist
		}
	});
}

//remove spaces from a string ("category" names / search keywords)
function removeSpaces(text) {
    return text.replace(/\s/g,""); //regex replaces all whitespace with empty string ("")
}

//save data to the array
//saves category name / search keyword (text), html id of dropdown option for ease of use (id), and search sites list (iterated through sitesList)
function saveCat() {
	var input = textBox.value; //pull string from category text box
	input = removeSpaces(input); //remove spaces from category list so can be used as keyword
	if (input.length > 0) { //if inputting text or selected from dropdown, 
		var sitesArray = []; //empty array for to-be-saved sites
		var nodesArray = sitesList.childNodes; //get the html nodes of the site inputs
		
		for (var i = 0; i < nodesArray.length; ++i) { //for each input box, 
			var val = nodesArray[i].lastChild.value; //text of input
			if (val !== "") { //if input isn't blank (only last input could be blank) ...
				sitesArray[i] = nodesArray[i].lastChild.value; //save input text to holding array
			}
		}
		
		//check if editing keyword, rather than adding a new one
		for (var i = 0; i < keywordMap.length; ++i) { //for each saved keyword
			if (keywordMap[i].text === input) { //if input string matches a saved
				keywordMap[i].sites = sitesArray; //overwrite saved sites only (no need to re-write name or id)
				saveOptions(); //go ahead and permanantly save options at this time
				return; //exit function; no more work needed
			}
		}
		
		//creating a new keyword
		var newCat = document.createElement("option"); //create an HTML option element so input can be added to dropdown
		newCat.id = "opt" + keywordMap.length.toString(); //form a string to use as html id of option element. prefixes array position with "opt"
		newCat.text = input; //string-removed category name gets saved as the new element's text
		
		keywordMap.push({"text" : newCat.text, "sites" : sitesArray}); //save this data to the array as new entry
		list.appendChild(newCat); //add the newly-created option element to the datalist so can be accessed again by dropdown
	}
	saveOptions(); //go ahead and permanantly save options at this time
}

//removes the category / search keyword from the dropdown and array
function removeCat() {
	var cat = textBox.value; //pull string from category text box
	for (var i = 0; i < keywordMap.length; ++i) { //loop through array
		if (cat === keywordMap[i].text) { //if input name matches a name of a saved category ...
			list.removeChild(document.getElementById(keywordMap[i].id)); //remove element from datalist using its id
			keywordMap.splice(i, 1); //splice the element out of the array
			textBox.value = ""; //blank out text box
			resetSitesList(); //call method to no longer show unneeded site inputs
			break; //match found, so can break loop
		}
	}
}

//searches array as user types or selects item from dropdown
function selectedCat() {
	var cat = textBox.value; //pull string from category text box
	//textArea.value = ""; //blank out text area while typing
	if (cat !== "") { //if there is input in text box ...
		//is removing all sites when cat input changes a desired behavior?
			//maybe somehow check when WAS found input and changed. only remove all inputs in that case?
		resetSitesList(); //reset list to one input when changing keyword
		for (var i = 0; i < keywordMap.length; ++i) { //iterate through saved array
			if (cat === keywordMap[i].text) { //if input matches name of the current element of the array
				//create input boxes for every previously-saved site
				for (var j = 0; j < keywordMap[i].sites.length; ++j) { //for each site in sites array
					if (j == 0) { //if we are on the first site, just change the value of already-present first input
						document.getElementById("site0").value = keywordMap[i].sites[0];
					} else { //if not on first site, need to create a new input and change its value to the saved one.
						addSiteInput().value = keywordMap[i].sites[j];
					}
				}
				if (siteCount < maxSites) { //if we are not yet at max sites allowed,
					addSiteInput(); //add empty input for further adding of sites.
				}
				break; //match found, so can break loop
			}
		}
	}
}

//check input change on site inputs
function checkInputValue() {
	if (this.value == "") { //if input is blank (deleted)
		if (this.id != "site0" && this != sitesList.lastChild.lastChild) { //don't remove first or last input box
			removeSiteInput(this); //call method to remove input
		}
	} else {
		//if inputting in last child of list, add a new blank input below it.
		// !!! html page needs to be formatted such that there is nothing other than a li as last child. this includes newline characters !!!
		if (this === sitesList.lastChild.lastChild && siteCount < maxSites) {
			addSiteInput(); //call method to add a new input
		}
	}
}

//add a new input box to the list
function addSiteInput() {
	var item = document.createElement("LI"); //create a holding list item
	var input = document.createElement("input"); //create the input box
	++siteCount; //increment site input count for newly added input
	document.getElementById("siteCount").textContent = siteCount; //DEBUG OUTPUT showing current count of inputs per keyword
	input.type = "text"; //set type of new input to text (even though this is default)
	input.autocomplete = "off"; //autocomplete property: not allow
	input.placeholder="Site URL with '%s' where the search term belongs"; //default text for input set to instructions
	input.addEventListener("input", checkInputValue); //add a listener to new input so that input can be checked
	item.appendChild(input); //add this new input to the list item
	sitesList.appendChild(item); //add the list item to the HTML list
	return input; //return the input so that it can be interacted with by other functions (namely, to set its value when loading a previously saved keyword)
}

//sets the site list to show only one empty input.
function resetSitesList() {
	//while has children, remove the first child. this removes all site inputs
	while (sitesList.firstChild) {
		sitesList.removeChild(sitesList.firstChild);
	}
	addSiteInput().id = "site0"; //add a new site input and set id of this first input for id checks in other functions
	siteCount = 1; //hard reset site input count to 1 since just added a single input 
	document.getElementById("siteCount").textContent = siteCount; //DEBUG OUTPUT showing current count of inputs per keyword
}

//removes the input box
function removeSiteInput(node) {
	sitesList.removeChild(node.parentNode); //remove the list item (as a child of sitesList list element), which also removes its input
	--siteCount; //decrement site input count appropriately
	document.getElementById("siteCount").textContent = siteCount; //DEBUG OUTPUT showing current count of inputs per keyword
}

//DEBUG METHOD prints array to console for easy inpsection
function logCats() {
	console.log(keywordMap);
}

//DEBUG METHOD makes keywordMap blank again
function clearAll() {
	keywordMap = [];
	saveOptions();
	chrome.storage.sync.clear(function () {
		console.log("ok");
	});
}

//event listeners for button clicks, page loaded, and input change in text area
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('category').addEventListener('input', selectedCat);
document.getElementById('removeCat').addEventListener('click', removeCat);
document.getElementById('saveSites').addEventListener('click', saveCat);
document.getElementById('logCats').addEventListener('click', logCats);
document.getElementById('clear').addEventListener('click', clearAll);
