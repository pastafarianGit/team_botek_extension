let villages = null;
let activeVillage = null;
let pathname = null;
console.log("hey botek extension", window.location);
init();

function init() {
    if(window.location.pathname !== KARTE_PATHNAME){  // bugs map if hiding it there
        document.getElementsByTagName("html")[0].style.display = "none";
    }
    window.onload = function () {
        toggleElements("hidden");
        onPageLoad();
        document.getElementsByTagName("html")[0].style.display = "block"; //to show it all back again
    }
}

function onPageLoad(){
    if(isBotPage()){
        handleBotekPageOpened();

    }else{
        if(isLoginPage()){
            return;
        }
        handleTravianPageOpened();
    }
}

function isLoginPage() {
    return (window.location.pathname === LOGIN_PATHNAME);
}

function isBotPage() {
    const hostname = window.location.hostname;
    return (hostname.includes('teambot') || hostname.includes('localhost') || hostname.includes('168.119.157.162'));
}

function handleBotekPageOpened(){

    sendMessageToExtension(GET_IFRAME_URL_ACTION, {}, (url) => {
        window.document.getElementById('iframe-container').setAttribute('src', url);
    });
}

function handleTravianPageOpened(){
    checkPageVariables();

    sendMessageToExtension(IS_TAB_ACTIVE_ACTION, {},(data) => {
        if(data.isActive){
            if(data.villages.length !== 0){
                console.log("response is tab active ", data.villages);
                updateContentVariables(data.villages);
                showBuildUI();
                showTrainUI();
                showFarmUI();
                highlightTasks();
                if(activeVillage !== null){
                    console.log("response active village ", activeVillage);
                    sendMessageToExtension(CHANGE_VILLAGE_ACTION, activeVillage.did,
                        (r)=>{console.log("change village response", r);});

                }
            }else{
                console.log("else data villages length", data.villages.length);
            }
        }
        else{
            console.log("IS TAB ACTIVE false", data);
            toggleElements("visible");
        }
    });
}

function checkPageVariables(){
    let s = document.createElement('script');
    s.src = chrome.extension.getURL('js/script.js');
    (document.head||document.documentElement).appendChild(s);
    s.onload = function() {
        s.remove();
    };

    document.addEventListener(BEARER_KEY_ACTION, (e) => {
        console.log("bearer key", e.detail);
        if(e.detail !== 'false'){
            sendMessageToExtension(BEARER_KEY_ACTION, e.detail, ()=> {});
        }
    });
}

function updateContentVariables(newVillages) {
    villages = newVillages;
    activeVillage = findActiveVillage();
    pathname = window.location.pathname;
}

function toggleElements(visibility){
    let sideBarContent = document.getElementById('sidebarBeforeContent');
    let sidebarBoxActiveVillage = document.getElementById('sidebarBoxActiveVillage');
    let logo = document.getElementById('logo');
    setElementVisibility(sideBarContent, visibility);
    setElementVisibility(sidebarBoxActiveVillage, visibility);
    setElementVisibility(logo, visibility);
}

function setElementVisibility(element, visibility){
    if(element !== null){
        element.style.visibility = visibility;
    }
}

function addBorderToBotActiveVillage(did) {

   const sidebarBoxVillageList =  document.getElementById("sidebarBoxVillagelist");
   const allLinks = sidebarBoxVillageList.getElementsByTagName('a');
   for(let a of allLinks){
       if(a.href.includes(did)){
           a.style.borderBottom = '3px solid #ff4081';
           a.style.borderRight = '3px solid #ff4081';
       }else{
           a.style.borderBottom = '';
           a.style.borderRight = '';
       }

   }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(isBotPage()){
        return false;
    }

    switch (request.action) {
        case UPDATE_VILLAGES_ACTION:
            updateContentVariables(request.data);
            highlightTasks();
            break;
        case CHANGE_VILLAGE_ACTION:
            addBorderToBotActiveVillage(request.data.did);
            break;
    }
    sendResponse("true");
    return false;
});
