console.log("background botek ext")

chrome.browserAction.onClicked.addListener(tab =>{
    console.log("background button clicked1", tab);
    //travianServer = tab.url;
    //chrome.tabs.update(tab.id, {url:"http://localhost:4200/"});
});

function addBuildTask(data) {
    for(let village of villages){
        if(village.did === data.villageDid){
            let building = new Building(data.locationId, data.type, data.lvl);
            let newBuildTask = new BuildTask(building, data.villageDid, getUuidv4(), (village.buildTasks[0].length > 0));
            BuildTaskHelper.addTask(newBuildTask, village.buildTasks);
            village.timers.updateTimerOnNewTask(village.currentlyBuilding, newBuildTask);
        }
    }
    sendMessageToGUI(UPDATE_VILLAGES_ACTION, villages);
}

function getUuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

chrome.runtime.onMessage.addListener(  // from inside content extension
    function(request, sender, sendResponse) {
        if(baseServerUrl === ""){
            sendResponse(false);
            return false;
        }

        switch (request.action) {
            case IS_TAB_ACTIVE_ACTION:
                if(newBotOpen.updateProfile){
                    analyseVillagesAfterLogin(sendResponse);
                    newBotOpen.updateProfile = false;
                }else{
                    isTabActive(sendResponse);
                }
                break;
            case GET_IFRAME_URL_ACTION:
                sendResponse(urlForFrontEnd);
                sendMessageToGUI(UPDATE_ALL_GUI_BOT_DATA_ACTION, {villages, isBotActive});
                break;
            case CHANGE_VILLAGE_ACTION:
                //const villageDid = regexSearchOne(REGEX_VILLAGE_LINK_TEXT, request.data, "g");
                sendResponse(true);
                sendMessageToGUI(CHANGE_VILLAGE_ACTION, request.data);
                break;
            case ADD_BUILD_TASK_ACTION:
                addBuildTask(request.data);
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
                // console.log("village builds tasks.", village.buildTasks);
                // console.log("build tasks: ", request.data);
                // console.log("build tasks village: ", village);
                break;
            case "getUpdateOnVillage":
                sendResponse(villages);
                break;

            case TOGGLE_BOT_ACTIVE:
                console.log("toggle bot", request.data);
                isBotActive = request.data.isRunning;
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
        // console.log("info: ", info);
        let url = new URL(info.url);
        if(info.initiator !== undefined && info.initiator.includes(EXTENSION_ID)){
            // console.log("jup", url);
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

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
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
    {urls: ["<all_urls>"]},
    ["blocking", "requestBody"])

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
    // console.log("modify header origin", requestHeaders);
}

/*
chrome.tabs.getCurrent((result1)=>{
    console.log("current time", result1);
})*/
