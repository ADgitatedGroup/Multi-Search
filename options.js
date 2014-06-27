var categories = new Array();

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
	testOut();
}

function removeSpaces(text) {
    return text.replace(/\s/g,'');
}

function save_cat() {
	var input = document.getElementById("addCat").value;
	input = removeSpaces(input);
	if (input.length > 0) {
		categories.push(input);
		//console.log(categories);
		var newCat = document.createElement("option");
		var positionID = categories.length - 1;
		newCat.id = "opt" + positionID.toString();
		newCat.text = input;
		var list = document.getElementById("categories");
		list.appendChild(newCat);
		document.getElementById("addCat").value = "";
	}	
}

function remove_cat() {
	var list = document.getElementById("categories");
	for (var index = 0; index <= categories.length; ++index) {
	//console.log(categories);
	//console.log(categories[index]);
	//console.log(document.getElementById("category").value);
		if (categories[index] === document.getElementById("category").value) {
			//can I use the same index without having to loop?
			categories.splice(index, 1);
			console.log(document.getElementById("opt" + index).value);
			list.removeChild(document.getElementById("opt" + index));
			document.getElementById("category").value = "";
			break;
		}
	}
	
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	chrome.storage.sync.get({
		categoryList: categories
	}, function(items) {
		document.getElementById('categories').value = items.categoryList;
	});
}

function testOut() {
	chrome.storage.sync.get({
		categoryList: categories
	}, function(items) {
		console.log(items.categoryList);
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.addEventListener('DOMContentLoaded', testOut);
document.getElementById('saveCat').addEventListener('click', save_cat);
document.getElementById('removeCat').addEventListener('click', remove_cat);
document.getElementById('saveOptions').addEventListener('click', save_options);
