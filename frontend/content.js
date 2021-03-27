let villages = null;
let hero = null;
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
    debugger;
    if(isBotPage()){
        console.log("bot page");
        handleBotPageOpened();

    }else{
        console.log("travian page");

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
    console.log("is bot page ", hostname);
    return (hostname.includes('teambot') || hostname.includes('localhost') || hostname.includes('157.90.232.124'));
}

function handleBotPageOpened(){

    sendMessageToExtension(GET_IFRAME_URL_ACTION, {}, (url) => {
        console.log("set new frontend url ", url);
        window.document.getElementById('iframe-container').setAttribute('src', url);
    });
}

function handleTravianPageOpened(){
    checkPageVariables();

    sendMessageToExtension(IS_TAB_ACTIVE_ACTION, {},(data) => {
        if(data.isActive){
            if(data.villages.length !== 0){
                console.log("response is tab active ", data.villages);
                updateContentVariables(data);
                if(activeVillage){
                    showBuildUI();
                    showTrainUI();
                    showFarmUI();
                    showHeroUI();
                    highlightTasks();
                }
                setActiveVillage();

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

function setActiveVillage() {
    //if(activeVillage !== null){
    console.log("response active village ", activeVillage);
    if(activeVillage === null){
        sendMessageToExtension(CHANGE_VILLAGE_ACTION, null,
            (r)=>{console.log("change village NULL response", r);});
        //}
    }else{
        sendMessageToExtension(CHANGE_VILLAGE_ACTION, activeVillage.did,
            (r)=>{console.log("change village response", r);});
        //}
    }

}

function checkPageVariables(){
    let s = document.createElement('script');
    if(chrome.extension){
        s.src = chrome.extension.getURL('js/script.js');
        (document.head||document.documentElement).appendChild(s);
        s.onload = function() {
            s.remove();
        };
    }

    document.addEventListener(BEARER_KEY_ACTION, (e) => {
        console.log("bearer key", e.detail);
        if(e.detail !== 'false'){
            sendMessageToExtension(BEARER_KEY_ACTION, e.detail, ()=> {});
        }
    });
}

function updateContentVariables(data) {
    console.log("new data", data);
    villages = data.villages;
    activeVillage = findActiveVillage();
    pathname = window.location.pathname;
    hero = data.hero;
}

function toggleElements(visibility){
    let sideBarContent = document.getElementById('sidebarBeforeContent');
    // let sidebarBoxActiveVillage = document.getElementById('sidebarBoxActiveVillage');
    let logo = document.getElementById('logo');
    setElementVisibility(sideBarContent, visibility);
    //setElementVisibility(sidebarBoxActiveVillage, visibility);
    setElementVisibility(logo, visibility);
}

function setElementVisibility(element, visibility){
    if(element !== null){
        element.style.visibility = visibility;
    }
}

function addBorderToBotActiveVillage(did) {

   const sidebarBoxVillageList = document.getElementById("sidebarBoxVillagelist");
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
