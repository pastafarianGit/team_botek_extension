console.log("background botek ext")

chrome.browserAction.onClicked.addListener(buttonClicked);
//chrome.runtime.onMessageExternal.addListener(messageReceived);

function buttonClicked(tab) {
    console.log("background button clicked1", tab)
    let msg = {
        txt: "trolled"
    }
    chrome.tabs.sendMessage(tab.id, msg);
}

chrome.runtime.onMessageExternal.addListener(
function(request, sender, sendResponse) {
        console.log("onMessageExternal");
        let myPromise = fetch("https://en.wikipedia.org/wiki/Cart");
        console.log("type:", typeof(myPromise));
        console.log("promise:", myPromise);
        sendResponse({"hello":1});

        return true;
});
