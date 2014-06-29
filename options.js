var categories = []; //empty array. will be used as a JSON array

var list = document.getElementById("categories"); //get the HTML datalist from the page
var textBox = document.getElementById("category"); //get the HTML input for the category string from the page
var textArea = document.getElementById("sites"); //get the HTML input for the sites list from the page

// Saves options to chrome.storage
function save_options() {
	chrome.storage.sync.set({
		categoryList: categories
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 1000);
	});
}

//remove spaces from a string ("category" names / search keywords)
function removeSpaces(text) {
    return text.replace(/\s/g,''); //regex replaces all whitespace with empty string ('')
}

//save data to the array
//saves category name / search keyword (text), html id of dropdown option for ease of use (id), and search sites list (sites)
function save_cat() {
	var input = textBox.value; //pull string from category text box
	var sitesString = textArea.value; //pull string from sites text area
	input = removeSpaces(input); //remove spaces from category list so can be used as keyword
	if (input.length > 0) {
		var newCat = document.createElement("option"); //create an HTML option element so input can be added to dropdown
		newCat.id = "opt" + categories.length.toString(); //form a string to use as html id of option element. prefixes array position with "opt"
		newCat.text = input; //string-removed category name gets saved as the new element's text
		categories.push({"id" : newCat.id, "text" : newCat.text, "sites" : sitesString}); //save this data to the array
		list.appendChild(newCat); //add the newly-created option element to the datalist so can be accessed again by dropdown
	}	
}

//removes the category / search keyword from the dropdown and array
function remove_cat() {
	var cat = textBox.value; //pull string from category text box
	for (var i = 0; i < categories.length; ++i) { //loop through array
		if (cat === categories[i].text) { //if input name matches a name of a saved category ...
			list.removeChild(document.getElementById(categories[i].id)); //remove element from datalist using its id
			categories.splice(i, 1); //splice the element out of the array
			textBox.value = ""; //blank out text box
			textArea.value = ""; //blank out text area
			break; //match found, so can break loop
		}
	}
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	chrome.storage.sync.get({
		categoryList: categories //pull categoryList from saved data
	}, function(items) {
		categories = items.categoryList; //set array
		//create HTML elements for the dropdown from the array data
		for (var i = 0; i < categories.length; ++i) {
			var newCat = document.createElement("option");
			newCat.id = "opt" + i.toString();
			newCat.text = categories[i].text;
			list.appendChild(newCat);
		}
	});
}

//searches array as user types or selects item from dropdown
function selected_cat() {
	var cat = textBox.value; //pull string from category text box
	textArea.value = ""; //blank out text area while typing
	if (cat !== "") { //if there is input in text box ...
		for (var i = 0; i < categories.length; ++i) { //iterate through array
			if (cat === categories[i].text) { //if input matches name of the current element of the array
				textArea.value = categories[i].sites; //set the text area text to the array element's
				break; //match found, so can break loop
			}
		}
	}
}

function log_cats() {
	console.log(categories);
}

function clearAll() {
	categories = [];
}

//event listeners for button clicks, page loaded, and input change in text area
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('category').addEventListener('input', selected_cat);
document.getElementById('removeCat').addEventListener('click', remove_cat);
document.getElementById('saveSites').addEventListener('click', save_cat);
document.getElementById('saveOptions').addEventListener('click', save_options);
document.getElementById('logCats').addEventListener('click', log_cats);
document.getElementById('clear').addEventListener('click', clearAll);
