console.log("background botek ext")

chrome.browserAction.onClicked.addListener(tab =>{
    console.log("background button clicked1", tab);
    //travianServer = tab.url;
    //chrome.tabs.update(tab.id, {url:"http://localhost:4200/"});
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("from a content script:" + sender.tab.url);
        console.log("request:", request);
        if (request.greeting) {
            sendResponse({url: travianServer});
        }else if(request.isActiveTab){
            isTabActive(sendResponse)
        }
        return true;
    });

chrome.runtime.onMessageExternal.addListener(
function(request, sender, sendResponse) {
        console.log("onMessageExternal");
        let testBuild = {
            "type":BUILD_TYPE,
            "value":{
                id:13,
            },
            "response":sendResponse
        };
        queue.push(testBuild);



        // al pustit queue, al vrnt promise???? TODO
        //let myPromise = build(10);


        //console.log("type:", typeof(myPromise));
        //sendResponse(myPromise);
        return true;
});

chrome.webRequest.onBeforeSendHeaders.addListener(
    (info) =>{
        //console.log("info: ", info);
        let url = new URL(info.url);
        if(info.initiator !== undefined && info.initiator.includes(EXTENSION_ID)){
            console.log("jup", url);
            modifyHeaders(url.pathname, info.requestHeaders);
            modifyHeaderOrigin(info.url, info.requestHeaders);
            //modifyHeaderReferer(info.)
        }
        return {requestHeaders: info.requestHeaders};

    },
    {
        urls:["<all_urls>"]
    },
    [ 'blocking', 'requestHeaders', 'extraHeaders']
)

const addHeader = (newHeader, headers) => {
    //console.log("new header", newHeader);
    for (let index in headers){
        if (newHeader.name === headers[index].name){
            headers[index] = newHeader;
            return;
        }
    }
    headers.push(newHeader);
}

const modifyHeaders = (pathname, reqHeaders) => {
    let constHeaders = REQUESTS_INFO[pathname];
    if(constHeaders){
        constHeaders.headers.forEach(header => {
            addHeader(header, reqHeaders);
        });
    }
}

const modifyHeaderOrigin = (url, requestHeaders) => {
    if(referer !== undefined){
        addHeader({name: 'referer', value: referer}, requestHeaders);
    }else{
        addHeader({name: 'sec-fetch-site', value: 'none'}, requestHeaders)
    }
    referer = url;
    console.log("modify header origin", requestHeaders);
}


chrome.tabs.getCurrent((result1)=>{
    console.log("current time", result1);
})
