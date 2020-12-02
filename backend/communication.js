
chrome.runtime.onMessage.addListener(  // from inside content extension
    function(request, sender, sendResponse) {
        //console.log("on content communication", request);

        if(baseServerUrl === ""){
            sendResponse(false);
            return false;
        }
        //console.log("sender ", sender);
        switch (request.action) {
            case IS_TAB_ACTIVE_ACTION:
                if(newBotOpen.updateProfile){
                    analyseVillagesOnStart(sendResponse);
                    //isTabActive(sendResponse);
                    handleNoBearerKey();
                }else{
                    isTabActive(sendResponse);
                }
                break;
            case GET_IFRAME_URL_ACTION:
                sendResponse(urlForFrontEnd);
                sendMessageToGUI(UPDATE_ALL_GUI_BOT_DATA_ACTION, {villages, isBotOn: isBotOn, tribe: tribe});
                break;
            case CHANGE_VILLAGE_ACTION:
                sendResponse(true);
                sendMessageToGUI(CHANGE_VILLAGE_ACTION, request.data);
                break;
            case ADD_BUILD_TASK_ACTION:
                console.log("build task", request.data);
                addNewBuildTask(request.data);
                sendMessageToGUI(UPDATE_VILLAGES_ACTION, villages);
                sendResponse(true);
                break;
            case ADD_TRAIN_TASK_ACTION:
                console.log("train task", request.data);
                addNewTrainTask(request.data);
                sendMessageToGUI(UPDATE_VILLAGES_ACTION, villages);
                sendResponse(true);
                break;
            case BEARER_KEY_ACTION:
                // console.log("bearer", request.data);
                if(request.data){
                    // console.log("changed bearer", request.data);
                    bearerKey = request.data;
                    closeBackgroundWindow();
                }
                break;
        }
        return true;
    });

chrome.runtime.onMessageExternal.addListener(   // from botkeGui
    (request, sender, sendResponse) => {
        console.log("on botkeGui communication", request);

        switch (request.action) {
            case UPDATE_BUILD_TASK_ACTION:
                let village = VillagesHelper.findVillage(villages, request.data.village.did);
                village.buildTasks = request.data.village.buildTasks;
                village.trainTasks = request.data.village.trainTasks;
                //village.trainTasks = TrainHelper.deserializationToTrainTaskObject(request.data.village.trainTasks);
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
        console.log("gui on msg", msg);
        return false;
    });
    return false;
});

function updateBotStatusGUI(data) {
    sendMessageToGUI(UPDATE_BOT_STATUS_ACTION, data);
}

function updateWorkingBotStatus() {
    if(isBotOn){
        toggleSleep();
        if(botSleep.isSleeping){
            updateBotStatusGUI(BOT_IS_SLEEPING_STATUS);
        }else{
            updateBotStatusGUI(BOT_IS_WORKING_STATUS);
        }
    }else{
        updateBotStatusGUI(BOT_IS_ON_PAUSE_STATUS);
    }
}

function sendMessageToGUI(action, data) {
    if(guiPortConnection !== null){
        console.log("on GUI msg send", action);
        try {
            guiPortConnection.postMessage({action: action, data:data}, (response)=>{
                console.log("on GUI response", response);
            });
        }catch (e) {
            console.error("error sending msg to GUI", action, data, guiPortConnection);
        }
    }
}

function sendMessageToBotTab(action, data){
    try {
        chrome.tabs.sendMessage(botTabId, {action: action, data: data}, function(response) {});
    }catch (e) {
        console.log("ERROR send msg to BOT TAB", e);
    }
}



function openBotTab(tabId){
    chrome.tabs.update(tabId, {url: SERVER_URL});
}


chrome.browserAction.onClicked.addListener(tab =>{
    console.log("background button clicked1", tab);

});
