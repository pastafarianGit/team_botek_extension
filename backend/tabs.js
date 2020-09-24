let enabledTabs = {};

const isTabActive = (sendResponse) =>{
    chrome.tabs.query(
        {currentWindow: true, active : true}, (result) => {
            if (result[0] !== undefined && enabledTabs[result[0].id] !== undefined) {
                console.log("enabledTabs[result[0].id]", enabledTabs[result[0].id]);
                sendResponse({isActive: enabledTabs[result[0].id], villages : villages.allVillages});
            } else {
                chrome.storage.sync.get(['allActiveTabs'], function (result) {
                    console.log("is server storage", result.allActiveTabs);
                    sendResponse({isActive: result.allActiveTabs, villages : villages.allVillages});
                })
            }

        })
}

function toggleTab(isTabEnabled) {
    runOnActiveId((tab) => {
        enabledTabs[tab.id] = isTabEnabled;
        chrome.tabs.reload(tab.id);
    })
    /*chrome.tabs.query(
        {currentWindow: true, active : true}, (result) =>{
            const id = result[0].id;
            enabledTabs[id] = isTabEnabled;
            chrome.tabs.reload(id);
        }
    )*/
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
/*            const id = result.id;
            if (enabledTabs[id]){
                 console.log("is server tab enabledTabs[id]", enabledTabs[id]);
                callback(enabledTabs[id]);
             }else{
                 chrome.storage.sync.get(['allActiveTabs'], function(result) {
                     console.log("is server storage", result.allActiveTabs);
                     callback1({test:true});
                 })
             }*/
