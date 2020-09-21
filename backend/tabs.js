let enabledTabs = {};

const isTabActive = (sendResponse) =>{
    console.log("callback1", sendResponse);
    chrome.tabs.query(
        {currentWindow: true, active : true}, (result) => {
            if (result[0] !== undefined && enabledTabs[result[0].id] !== undefined) {
                sendResponse(enabledTabs[result[0].id]);
            } else {
                chrome.storage.sync.get(['allActiveTabs'], function (result) {
                    console.log("is server storage", result.allActiveTabs);
                    sendResponse(result.allActiveTabs);
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
