
chrome.runtime.onMessage.addListener(  // from inside content extension
    function(request, sender, sendResponse) {
        if(urls.baseServerUrl === ""){
            sendResponse(false);
            return false;
        }
        //console.log("sender ", sender);
        switch (request.action) {
            case IS_TAB_ACTIVE_ACTION:
                if(botStatus.updateProfile){
                    analyseVillagesOnStart(sendResponse);
                    handleNoBearerKey();
                }else{
                    isTabActive(sendResponse);
                }
                break;
            case GET_IFRAME_URL_ACTION:
                console.log("urlForFrontEnd: ", urls.urlForFrontEnd)
                sendResponse(urls.urlForFrontEnd);
                sendMessageToGUI(UPDATE_ALL_GUI_BOT_DATA_ACTION, {villages, isBotOn: botStatus.isBotOn, tribe: tribe});
                break;
            case CHANGE_VILLAGE_ACTION:
                sendResponse(true);
                checkForNewVillage2(request.data);
                if(request.data){
                    console.log("change village", request.data);
                    sendMessageToGUI(CHANGE_VILLAGE_ACTION, request.data);
                }
                break;
            case ADD_TASK_ACTION:
                addTask(request.data);
                sendMessageToGUI(UPDATE_VILLAGES_ACTION, villages);
                sendResponse(true);
                break;
            case BEARER_KEY_ACTION:
                if(request.data){
                    bearerKey = request.data;
                    closeBackgroundWindow();
                }
                break;
            case UPDATE_HERO_ACTION:
                console.log("hero update", request.data);
                hero.option = request.data.option;
                break;
        }
        return true;
    });

function checkForNewVillage2(did) {
        if(!did) {
            if(!botStatus.updateProfile){
                botStatus.updateProfile = true;
                queue.push(AnalyseHelper.createTask());
            }
        }
}

function addTask(taskData){
    switch(taskData.taskType){
        case BUILD_TYPE:
            addNewBuildTask(taskData);
            break;
        case TRAIN_TYPE:
            addNewTrainTask(taskData);
            break;
        case FARM_TYPE:
            addNewFarmTask(taskData);
            break;
    }
    saveUserData();
}

chrome.runtime.onMessageExternal.addListener(   // from botkeGui
    (request, sender, sendResponse) => {
        console.log("on botkeGui communication", request);

        switch (request.action) {
            case UPDATE_TASKS_ACTION:
                let village = VillageHelper.findVillage(villages, request.data.village.did);
                village.tasks = request.data.village.tasks;
                /*village.tasks.trainTasks = request.data.village.tasks.trainTasks;
                village.tasks.farmTasks = request.data.village.tasks.farmTasks;*/
                //village.trainTasks = TrainHelper.deserializationToTrainTaskObject(request.data.village.trainTasks);
                sendMessageToBotTab(UPDATE_VILLAGES_ACTION, villages);
                sendResponse(true);
                break;
            case "getUpdateOnVillage":
                sendResponse(villages);
                break;

            case IS_ACTIVE_BOT_ACTION:
                console.log("toggle bot", request.data);
                botStatus.isBotOn = request.data.isRunning;
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
    if(botStatus.isBotOn){
        toggleSleep();
        if(botStatus.isSleeping){
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
            console.log("error sending msg to GUI", e);
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
