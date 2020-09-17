console.log("hey its popup.js");
$(function() {
    $('#toggle-event').change(function() {
        $('#console-event').html('Toggle: ' + $(this).prop('checked'));
        saveActiveTabsState($(this).prop('checked'));
    })
})


chrome.storage.sync.get(['allActiveTabs'], function(result) {
    let log = document.getElementById("toggle-event");
    if (result.allActiveTabs === undefined){
        // set default
        result.allActiveTabs = true;
    }
    log.toggleAttribute("checked", result.allActiveTabs);
});

function saveActiveTabsState(state) {
    chrome.storage.sync.set({allActiveTabs: state}, function() {
        /*let log = document.getElementById("console-event");
    log.innerText = "value is1 "+state; //+ result.key;
    */
    });
}

document.getElementById("enable-tab").onclick = () => {
    let bgPage = chrome.extension.getBackgroundPage();
    bgPage.toggleTab(true);
}

document.getElementById("disable-tab").onclick = () => {
    let bgPage = chrome.extension.getBackgroundPage();
    bgPage.toggleTab(false);
}
