let villages = null;
let activeVillage = null;
let pathname = null;
console.log("hey botek extension", window.location);
init();

function init() {
    document.getElementsByTagName("html")[0].style.display = "none";
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
        console.log('on handle botke page opened', url);
        window.document.getElementById('iframe-container').setAttribute('src', url);
    });
}

function handleTravianPageOpened(){

    sendMessageToExtension(IS_TAB_ACTIVE_ACTION, {},(data) => {
        if(data.isActive && data.villages.length !== 0){
            updateGlobalVariables(data.villages);
            /*villages = data.villages;
            activeVillage = findActiveVillage();
            pathname = window.location.pathname;*/
            if(activeVillage !== null){
                sendMessageToExtension(CHANGE_VILLAGE_ACTION, activeVillage.did,
                    (r)=>{console.log("change village response", r);});
                showBuildUI();
                showTrainUI();
                highlightTasks();
            }
        }else{
            toggleElements("visible");
        }
    });
}

function updateGlobalVariables(newVillages) {
    villages = newVillages;
    activeVillage = findActiveVillage();
    pathname = window.location.pathname;
}

/*
function setOnVillageChangeListener() {
    const sideBox = document.getElementById('sidebarBoxVillagelist');
    const ul = sideBox.getElementsByTagName('ul')[0];
    console.log("sidebox", sideBox);
    console.log("ul", ul);

    ul.addEventListener('click', (event) => {
        for(let element of event.path){
            if(element.nodeName === 'A'){
                element.getAttribute('href');
                sendMessageToExtension(CHANGE_VILLAGE_ACTION, element.getAttribute('href'),
                    (response) => {
                    }
                );

            }
        }

    })
}*/

function toggleElements(visibility){
    let sideBarContent = document.getElementById('sidebarBeforeContent');
    let sidebarBoxActiveVillage = document.getElementById('sidebarBoxActiveVillage');
    setElementVisibility(sideBarContent, visibility);
    setElementVisibility(sidebarBoxActiveVillage, visibility);
}

function setElementVisibility(element, visibility){
    if(element !== null){
        element.style.visibility = visibility;
    }
}


function addBorderToBotActiveVillage(did) {

   const sidebarBoxVillageList =  document.getElementById("sidebarBoxVillagelist");
   const allLinks = sidebarBoxVillageList.getElementsByTagName('a');
   console.log("all links", allLinks);
   for(let a of allLinks){
       if(a.href.includes(did)){
           a.style.borderBottom = '3px solid #ff4081';
           a.style.borderRight = '3px solid #ff4081';
       }else{
           a.style.borderBottom = '';
           a.style.borderRight = '';
       }

   }
   //border-right: 3px solid #ff4081;
    //border-bottom: 3px solid #ff4081;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("on msg request qweqwe", request);
    if(isBotPage()){
        return false;
    }

    switch (request.action) {
        case UPDATE_VILLAGES_ACTION:
            updateGlobalVariables(request.data);
            highlightTasks();
            break;
        case CHANGE_VILLAGE_ACTION:
            console.log("change border");
            addBorderToBotActiveVillage(request.data.did);
            // call obroba
            break;
    }
    return false;
});
/*
function unHideElements(){
    let sideBarContent = document.getElementById('sidebarBeforeContent');
    let sidebarBoxActiveVillage = document.getElementById('sidebarBoxActiveVillage');
    setElementVisibility(sideBarContent, "visible");
    setElementVisibility(sidebarBoxActiveVillage, "visible");
}*/
