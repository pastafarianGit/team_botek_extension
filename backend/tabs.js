let enabledTabs = {};

const isTabActive = (sendResponse) =>{
    chrome.tabs.query(
        {currentWindow: true, active : true}, (result) => {
            if (result[0] !== undefined && enabledTabs[result[0].id] !== undefined) {
                console.log("enabledTabs[result[0].id]", enabledTabs[result[0].id]);
                sendResponse({isActive: enabledTabs[result[0].id], villages : villagesController.villages});
            } else {
                chrome.storage.sync.get(['allActiveTabs'], function (result) {
                    console.log("is server storage", result.allActiveTabs);
                    sendResponse({isActive: result.allActiveTabs, villages : villagesController.villages});
                })
            }

        })
}

function toggleTab(isTabEnabled) {
    runOnActiveId((tab) => {
        enabledTabs[tab.id] = isTabEnabled;
        chrome.tabs.reload(tab.id);
    })
}

function runOnActiveId(runFun) {
    chrome.tabs.query(
        {currentWindow: true, active : true}, (result) =>{
            if(result[0] !== undefined){
                runFun(result[0])
            }
        }
    )
}
