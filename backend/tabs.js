let enabledTabs = {};

function isTabActive (sendResponse){
    chrome.tabs.query(
        {currentWindow: true, active : true}, (result) => {
            if (result[0] !== undefined && enabledTabs[result[0].id] !== undefined) {
                console.log("enabledTabs[result[0].id]", enabledTabs[result[0].id]);
                sendResponse({isActive: enabledTabs[result[0].id], villages : villages});
            } else {
                console.log("villages in allActiveTabs", villages);
                chrome.storage.sync.get(['allActiveTabs'], function (result) {
                    sendResponse({isActive: result.allActiveTabs, villages : villages});
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
