let villages = null;
let activeVillage = null;
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
    let hostname = window.location.hostname;
    if(hostname.includes('teambot') || hostname.includes('localhost') || hostname.includes('168.119.157.162')){
        handleBotekPageOpened();
    }else{
        if(window.location.pathname === LOGIN_PATHNAME){
           return;
        }
        handleTravianPageOpened();
    }
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
            villages = data.villages;
            activeVillage = findActiveVillage();
            if(activeVillage !== null){
                sendMessageToExtension(CHANGE_VILLAGE_ACTION, activeVillage.did,
                    (r)=>{console.log("change village response", r);});
                showBuildUI();
            }
        }else{
            toggleElements("visible");
        }
    });
}

function setElementVisibility(element, visibility){
    if(element !== null){
        element.style.visibility = visibility;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("on msg request qweqwe", request);
    sendResponse("qwe recived on FE 1 qqwe");
    console.log("11111111111111111111");
    return true;
});

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
}
/*
function showUi(){
    let villageProduction = document.getElementsByClassName("villageList production")
    let custom = document.createElement('div');
    custom.innerHTML = '<button type="button">Click Me!</button>'

    for (elt of villageProduction){
        elt.style['background-color'] = '#ff00FF'
        elt.appendChild(custom)
    }
}*/

function toggleElements(visibility){
    let sideBarContent = document.getElementById('sidebarBeforeContent');
    let sidebarBoxActiveVillage = document.getElementById('sidebarBoxActiveVillage');
    setElementVisibility(sideBarContent, visibility);
    setElementVisibility(sidebarBoxActiveVillage, visibility);
}
/*
function unHideElements(){
    let sideBarContent = document.getElementById('sidebarBeforeContent');
    let sidebarBoxActiveVillage = document.getElementById('sidebarBoxActiveVillage');
    setElementVisibility(sideBarContent, "visible");
    setElementVisibility(sidebarBoxActiveVillage, "visible");
}*/
