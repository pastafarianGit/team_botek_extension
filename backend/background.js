console.log("background botek ext")

chrome.browserAction.onClicked.addListener(tab =>{
    console.log("background button clicked1", tab);
    //travianServer = tab.url;
    //chrome.tabs.update(tab.id, {url:"http://localhost:4200/"});
});

function addBuildTask(data, sendResponse) {
    console.log("build task  data", data);
    for(let village of villagesController.villages){
        if(village.did === data.villageDid){
            village.buildTasks.set(getUuidv4(), data); // TODO generate random key
            village.nextCheckTime = calcNextCheckTime(30);
        }
        console.log("village is ", village);
    }
}

function getUuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("from a content script:" + sender.tab.url);
        console.log("request:", request);
        console.log("villages2:", this.villagesController);
        switch (request.action) {
            case "isTabActive":
                isTabActive(sendResponse);
                break;
            case "build":
                addBuildTask(request.data, sendResponse);
                break;
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

/*
chrome.tabs.getCurrent((result1)=>{
    console.log("current time", result1);
})*/
