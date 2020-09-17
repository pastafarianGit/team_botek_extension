let enabledTabs = {};

const isTabActive = (sendResponse) =>{
    console.log("callback1", sendResponse);
    //sendResponse({test:"qwe1"});  //DELA
    chrome.tabs.query(
        {currentWindow: true, active : true}, (result) => {
            const id = result[0].id;
            console.log("id", id);
            console.log("result", result);
            console.log("enabledTabs", enabledTabs[id]);
            if (enabledTabs[id] !== undefined) {
                sendResponse(enabledTabs[id]);
            } else {
                chrome.storage.sync.get(['allActiveTabs'], function (result) {
                    console.log("is server storage", result.allActiveTabs);
                    sendResponse(result.allActiveTabs);
                })
            }
        })
}




function toggleTab(isTabEnabled) {
    chrome.tabs.query(
        {currentWindow: true, active : true}, (result) =>{
            const id = result[0].id;
            enabledTabs[id] = isTabEnabled;
            chrome.tabs.reload(id);
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
