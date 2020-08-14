console.log("hey botek extension", window.location.toString());
if(window.location.toString().includes("localhost")){
    chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
        console.log("my url: ", response.url);
        console.log(document.getElementById('myframe'))
        document.getElementById('myframe').src  = response.url;
        //document.get('iframe').src = response.url;
    });
}



chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(request, sender, sendResponse) {
    console.log("msg recived", request.txt)
}
