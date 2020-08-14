console.log("background botek ext")
let travianServer = "";

chrome.browserAction.onClicked.addListener(buttonClicked);
//chrome.runtime.onMessageExternal.addListener(messageReceived);

function buttonClicked(tab) {
    console.log("background button clicked1", tab);
    travianServer = tab.url;
    chrome.tabs.update(tab.id, {url:"http://localhost:8080/"});

    //chrome.tabs.sendMessage(tab.id, msg);

}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("from a content script:" + sender.tab.url);
        if (request.greeting == "hello")
            sendResponse({url: travianServer});
    });

chrome.runtime.onMessageExternal.addListener(
function(request, sender, sendResponse) {
        console.log("onMessageExternal");
       let myHeaders = new Headers();
        myHeaders.append('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9');
        myHeaders.append('sec-fetch-dest', 'document');
        myHeaders.append('sec-fetch-mode', 'navigate');
        myHeaders.append('sec-fetch-user', '?1');
        myHeaders.append('upgrade-insecure-requests', '1');

        const otherParam =  {
            headers:myHeaders,
            method: "GET"
        };

        /*let myPromise = new Promise((resolve, reject) => {
            setTimeout(resolve, 1000);
        });*/
        let myPromise = fetch("https://tx3.travian.com/dorf1.php", otherParam);

        myPromise.then(data => {
                console.log("data: ", data);
                sendResponse(data);
            })


        console.log("type:", typeof(myPromise));
        console.log("promise:", myPromise);
        sendResponse(myPromise);
        return true;
});

chrome.webRequest.onBeforeSendHeaders.addListener(
    (info) =>{
        let url = info.url;
        if (info.type === "main_frame"){
            console.log("1before headers: ", info);
        }else{
            console.log("2before headers: ", info);

        }
        info.requestHeaders.forEach(header => {
            console.log("header", header);
        })

        info.requestHeaders.push({"name": "Sec-Fetch-Mode", "value": "navigate"});
        console.log("info2", info);
        return {requestHeaders: info.requestHeaders};

    },
    {
        urls:["<all_urls>"]
    },
    [ 'blocking', 'requestHeaders', 'extraHeaders']
)
