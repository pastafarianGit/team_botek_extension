let enabledTabs = {};


function onTabCloseListener(){
    chrome.tabs.onRemoved.addListener(function(tabid, removed) {
        if(botTabId === tabid){
            initGlobalVariables();
        }
    })
}


function isTabActive (sendResponse){
    chrome.tabs.query(
        {currentWindow: true, active : true}, (result) => {
            console.log("all tabs active ", villages);
            // let serializedVillages = serializeVillages(villages);
            if (result[0] !== undefined && enabledTabs[result[0].id] !== undefined) {
                sendResponse({isActive: enabledTabs[result[0].id], villages : villages, hero: hero});
            } else {

                chrome.storage.sync.get(['allActiveTabs'], function (result) {
                    sendResponse({isActive: result.allActiveTabs, villages : villages, hero: hero});
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

function closeBotIfAlreadyOpened(tabId) {
    if(tabId){
        chrome.tabs.remove(tabId, () => {});
    }
}
