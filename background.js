console.log("background botek ext")
let travianServer = "";
queue.push(1);

chrome.browserAction.onClicked.addListener(buttonClicked);

let referer;
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
        if (request.greeting === "hello")
            sendResponse({url: travianServer});
    });

chrome.runtime.onMessageExternal.addListener(
function(request, sender, sendResponse) {
        console.log("onMessageExternal");
        queue.push(4);
        if(referer !== undefined){

        }
        let myPromise = buildCropTest();


        //console.log("type:", typeof(myPromise));
        sendResponse(myPromise);
        return true;
});

async function buildCropTest(){
    let myPromise0 = await fetch("https://tx3.travian.com/dorf2.php");
    await new Promise((resolve, reject) => setTimeout(resolve, 10000));
    console.log("dorf2.php", myPromise0);

    let myPromise = await fetch("https://tx3.travian.com/dorf1.php", {headers:{request:"true"}});
    console.log("dorf1.php", myPromise);
    await new Promise((resolve, reject) => setTimeout(resolve, 3000));
    let c = await fetch("https://tx3.travian.com/build.php?id=11")
        .then(response => response.text())
        .then(body => {
            const c = /c=(.*)\'/g.exec(body)[1];
            const a = /\a=(.*)\&/g.exec(body)[1];

            console.log("body", body);
            console.log("a", a);
            console.log("c", c);
            return c;
        });


    console.log("select building.php", c);
    await new Promise((resolve, reject) => setTimeout(resolve, 3000));
    let myHeaders = new Headers();
    //console.log("my headers", myHeaders);
    //console.log("my headers type", typeof myHeaders);
    myHeaders.append("referer", "https://tx3.travian.com/build.php?id=11");

    const otherParam =  {
        headers:myHeaders,
        method: "GET"
    };

    let build = await fetch("https://tx3.travian.com/dorf1.php?a=11&c="+c, otherParam);
    console.log("build", build);


}

function modifyHeaderOrigin(requestHeaders) {
    console.log("modify header origin", requestHeaders);
    //if(requestHeaders.)
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    (info) =>{
        //console.log("info: ", info);
        let url = new URL(info.url);
        if(info.initiator !== undefined && info.initiator.includes(EXTENSION_ID)){
            console.log("jup", url);
            modifyHeaders(url.pathname, info.requestHeaders);
            modifyHeaderOrigin(info.requestHeaders);
        }
        return {requestHeaders: info.requestHeaders};

    },
    {
        urls:["<all_urls>"]
    },
    [ 'blocking', 'requestHeaders', 'extraHeaders']
)


function addHeader(newHeader, headers) {
    for (let index in headers){
        if (newHeader.name === headers[index].name){

            headers[index] = newHeader;
            return;
        }
    }
    headers.push(newHeader);
}

function modifyHeaders(pathname, reqHeaders) {
    let constHeaders = REQUESTS_INFO[pathname];
    if(constHeaders){
        constHeaders.headers.forEach(header => {
            addHeader(header, reqHeaders);
        });
    }
}


function readStream(body) {
    const reader = body.getReader()
    return new ReadableStream({
        start(controller) {
            return pump();
            function pump() {
                return reader.read().then(({ done, value }) => {
                    // When no more data needs to be consumed, close the stream
                    if (done) {
                        controller.close();
                        return;
                    }
                    // Enqueue the next data chunk into our target stream
                    controller.enqueue(value);
                    return pump();
                });
            }
        }
    })
}
