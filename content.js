console.log("hey botek extension")


chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(request, sender, sendResponse) {
    console.log("msg recived", request.txt)
}