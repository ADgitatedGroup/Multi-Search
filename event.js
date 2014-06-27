chrome.omnibox.onInputEntered.addListener(function(text) {
	var search = text.substr(0, text.indexOf(' '));
	var terms = text.substr(text.indexOf(' ') + 1);
	window.open("https://www.google.com/search?q=" + terms, "_blank");
	console.log(search + " " + terms);
});

//open options page
//chrome.browserAction.onClicked.addListener();
