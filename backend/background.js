console.log("background botek ext")

chrome.browserAction.onClicked.addListener(tab =>{
    console.log("background button clicked1", tab);
    //travianServer = tab.url;
    //chrome.tabs.update(tab.id, {url:"http://localhost:4200/"});
});

chrome.runtime.onMessage.addListener(  // from inside content extension
    function(request, sender, sendResponse) {
        if(baseServerUrl === ""){
            sendResponse(false);
            return false;
        }

        switch (request.action) {
            case IS_TAB_ACTIVE_ACTION:
                if(newBotOpen.updateProfile){
                    updateBotStatus(BOT_IS_ANALYSING_VILLAGES);
                    analyseVillagesAfterLogin(sendResponse);
                    newBotOpen.updateProfile = false;
                }else{
                    isTabActive(sendResponse);
                }
                break;
            case GET_IFRAME_URL_ACTION:
                sendResponse(urlForFrontEnd);
                sendMessageToGUI(UPDATE_ALL_GUI_BOT_DATA_ACTION, {villages, isBotOn: isBotOn});
                break;
            case CHANGE_VILLAGE_ACTION:
                sendResponse(true);
                sendMessageToGUI(CHANGE_VILLAGE_ACTION, request.data);
                break;
            case ADD_BUILD_TASK_ACTION:
                addNewBuildTask(request.data);
                sendMessageToGUI(UPDATE_VILLAGES_ACTION, villages);
                sendResponse(true);
                break;
            case ADD_TRAIN_TASK_ACTION:
                console.log("train task", request.data);
                addNewTrainTask(request.data);
                sendResponse(true);
                break;
        }
        return true;
    });

chrome.runtime.onMessageExternal.addListener(   // from botkeGui
(request, sender, sendResponse) => {
        //console.log("onMessageExternal", request);
        switch (request.action) {
            case UPDATE_BUILD_TASK_ACTION:
                let village = VillagesHelper.findVillage(villages, request.data.village.did);
                village.buildTasks = BuildTaskHelper.convertToBuildTaskObject(request.data.village.buildTasks);
                sendMessageToBotTab(UPDATE_VILLAGES_ACTION, villages);
                sendResponse(true);
                break;
            case "getUpdateOnVillage":
                sendResponse(villages);
                break;

            case IS_ACTIVE_BOT_ACTION:
                console.log("toggle bot", request.data);
                isBotOn = request.data.isRunning;
                updateWorkingBotStatus();
                sendResponse(true);
                break;
        }
        return true;
});

chrome.runtime.onConnectExternal.addListener((port) => { // connection with GUI
    //console.log("gui onConnectExternal");
    guiPortConnection = port;
    port.onMessage.addListener((msg) => {
        // console.log("gui on msg");
        // See other examples for sample onMessage handlers.
    });
});

chrome.webRequest.onBeforeSendHeaders.addListener(
    (info) =>{
        console.log("info1: ", info);
        let url = new URL(info.url);
        //console.log("inside send requests", url);
        // console.log("url origin", url);

        if(info.initiator !== undefined && info.initiator.includes(EXTENSION_ID) && !SERVER_URL.includes(url.origin)){
            console.log("modify header");
            modifyHeaders(url.pathname, info.requestHeaders);
            modifyHeaderOrigin(info.url, info.requestHeaders);
        }else{
            console.log("modify others", url);
            modifyHeaders(url.pathname, info.requestHeaders);
            modifyHeaderOrigin(info.url, info.requestHeaders);
        }

        for (let header of info.requestHeaders){
            if(header.name === 'Authorization'){
                if(header.value === 'Bearer false'){
                    console.log("info2", info)
                    // header.value = 'Bearer dcc0c7df8590973688944f0ee9e26d38';
                }
            }
        }
        return {requestHeaders: info.requestHeaders};

    },
    {
        urls:ACCESSIBLE_URLS
    },
    [ 'blocking', 'requestHeaders', 'extraHeaders']
)

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        //console.log("details", details);
        if(details.method === "POST" && details.url === baseServerUrl + LOGIN_PATHNAME){
            const formData = details.requestBody.formData;
            if(formData !== undefined){
                let newUser = {name: formData.name[0], password: formData.password[0], s1: formData.s1[0], w: formData.w[0], serverUrl : baseServerUrl};
                chrome.storage.sync.get(['users'], (result) => {
                    console.log("result on before request", result);
                    let users = addUser(result, newUser);
                    chrome.storage.sync.set({users: users}, () => {
                        console.log("saved user to exetension");
                    });
                });

            }
        }
    },
    {urls: ACCESSIBLE_URLS},
    ["blocking", "requestBody"]);

function addUser(result, newUser) {
    let users = [];
    let addedNewOne = false;
    if(result.users === undefined){ // fist time
        console.log("returning new users");
        return [newUser];
    }

    for(let user of result.users){
        if(user.serverUrl === newUser.serverUrl){
            users.push(newUser)  // add new one
            addedNewOne = true;
        }else{
            users.push(user);   // re add previous ones
        }
    }
    if(!addedNewOne){
        users.push(newUser);
    }
    return users;
}


function addHeader (newHeader, headers) {
    //console.log("new header", newHeader);
    for (let index in headers){
        if (newHeader.name === headers[index].name){
            headers[index] = newHeader;
            return;
        }
    }
    headers.push(newHeader);
}

function modifyHeaders (pathname, reqHeaders) {
    let constHeaders = REQUESTS_INFO[pathname];
    if(constHeaders === undefined){
        constHeaders = REQUESTS_INFO['others'];
    }
    if(constHeaders){
        constHeaders.headers.forEach(header => {
            addHeader(header, reqHeaders);
        });
    }
}

function modifyHeaderOrigin (url, requestHeaders) {
    if(referer !== undefined){
        addHeader({name: 'referer', value: referer}, requestHeaders);
    }else{
        addHeader({name: 'sec-fetch-site', value: 'none'}, requestHeaders)
    }
    if(url.includes('login')){
        addHeader({name: 'origin', value: baseServerUrl}, requestHeaders)
    }
    referer = url;
}

chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
       modifyCookie(details);
        return {
            responseHeaders:  removeSecurityHeaders(details)
        };
    },
    {
        urls: ACCESSIBLE_URLS
    },
    ["blocking", "responseHeaders", "extraHeaders"]
);

function modifyCookie(details) {
    details.responseHeaders.forEach((header) => {
        if (header.name.toLowerCase() === "set-cookie") {
            header.value = header.value + ";Secure;SameSite=None;";
        }
    });
}

function removeSecurityHeaders(details) {
    return details.responseHeaders.filter((header) => {
        return (
            !HEADERS_TO_STRIP.includes(header.name.toLowerCase())
        );
    })
}

// cookie change

chrome.cookies.onChanged.addListener( (object) => {
    if (object.cookie.domain.indexOf("travian.") !== -1 || object.cookie.domain.indexOf("kingdoms.") !== -1) {
        if (object.removed === false && object.cookie.sameSite !== "no_restriction" && object.cookie.secure !== true) {
            let cookie = object.cookie;
            let d = cookie.domain.indexOf('.') === 0 ? cookie.domain.replace('.', '') : cookie.domain;
            let newCookie = {
                url: "https://" + d,
                name: cookie.name,
                value: cookie.value,
                secure: true,
                sameSite: "no_restriction",
                expirationDate: cookie.expirationDate,
                storeId: cookie.storeId,

            }
            chrome.cookies.set(newCookie);
        }
    }
});

chrome.cookies.getAll({}, function (callback) {
    callback.forEach(function (cookie) {
        if (cookie.domain.indexOf("travian.") !== -1 || cookie.domain.indexOf("kingdoms.") !== -1) {
            let d = cookie.domain.indexOf('.') === 0 ? cookie.domain.replace('.', '') : cookie.domain;
            let newCookie = {
                url: "https://" + d,
                name: cookie.name,
                value: cookie.value,
                secure: true,
                sameSite: "no_restriction",
                expirationDate: cookie.expirationDate,
                storeId: cookie.storeId,

            }
            chrome.cookies.set(newCookie);
        }
    })
});
