async function analyseVillageProfile () { //get all villages -> link, name, coordinates
    const pageString = await getTextAndCheckLogin(PROFILE_PATHNAME, "", 300);
    serverSettings = parseServerSettings(pageString);
    let villagesLinks  = regexSearchMultiple(REGEX_VILLAGE_LINK, pageString);
    return parseVillages(pageString, villagesLinks);
}

function analyseVillagesOnStart(sendResponse){
    updateBotStatusGUI(BOT_IS_ANALYSING_VILLAGES);
    analyseVillageProfile()
        .then(result => {
            villages = result;
            sendMessageToGUI(UPDATE_ALL_GUI_BOT_DATA_ACTION, {villages, isBotOn: isBotOn});
            if(sendResponse){
                isTabActive(sendResponse);
            }
            return analyseBuildingsInAllVillages();
        }).then(result => {
        updateWorkingBotStatus();
    }).catch(err=> {
        console.log("err updating villages", err);
    });
    newBotOpen.updateProfile = false;
}



async function analyseVillagesTest() {
    let village = villages[0];
    await analyseDorf1(village);
    await analyseDorf2(village);
}

function analysePageStringDorf12 (pageString, village,  isRes) {
    if(isRes){
        parseAndUpdateDorf1(pageString, village);
    }else{
        parseAndUpdateDorf2(pageString, village);
    }
}

function parseTribe (pageString) {
    if(newBotOpen.updateTribe){
        tribe = parseInt(regexSearchOne(REGEX_TRIBE, pageString, "g"));
        newBotOpen.updateTribe = false;
    }
}

async function analyseDorf1(village) {
    sendMessageToBotTab(CHANGE_VILLAGE_ACTION, village);
    let pageString = await getTextAndCheckLogin(DORF1_PATHNAME, NEW_DID_PARAM + village.did, 3000);
    parseAndUpdateDorf1(pageString, village);
}

async function analyseDorf2(village) {
    sendMessageToBotTab(CHANGE_VILLAGE_ACTION, village);
    let pageString = await getTextAndCheckLogin(DORF2_PATHNAME, NEW_DID_PARAM + village.did, 3000);
    parseAndUpdateDorf2(pageString, village);
}

function parseAndUpdateDorf1 (pageString, village){
    parseTribe(pageString);
    let resourceBuildings = parseResourceLvls(pageString);
    village.updateBuildingInfo(resourceBuildings);
    analyseBackgroundContent(village, pageString);
}

function parseAndUpdateDorf2 (pageString, village) {
    let townBuildings = parseBuildingLvls(pageString);
    village.updateBuildingInfo(townBuildings);
    analyseBackgroundContent(village, pageString);
}



function analyseBackgroundContent (village, pageString) {
    village.resources = parseResources(pageString);
    village.currentlyBuilding = parseCurrentlyBuilding(pageString, village);
    village.timers.updateTimers(village.currentlyBuilding);
    BuildTaskHelper.addLvlForCurrentlyBuilding(village);
    checkForNewVillage(pageString);
}

function checkForNewVillage(pageString){
    const sideBar = getSidebarVillageBox(pageString);
    let ul = sideBar.getElementsByTagName('ul')[0];
    if(ul.childElementCount !== villages.length){
        console.log("number of villages", ul.childElementCount);
        queue.push(new AnalyseTask());
    }
}

async function fetchAndCheckIfLoggedIn(pathname){
    let document = await getHtmlDocFromPage(pathname, {});

}

async function analyseIsUserLoggedIn(pathname) {
    let document = await getHtmlDocFromPage(pathname, {});
    let inputElements = document.getElementsByTagName("input");

    // console.log("input elements", inputElements);
    for(let element of inputElements){
        if(element.getAttribute('name') === 'login'){
            return  element.getAttribute('value');
        }
    }

    return Promise.reject("already logged in");
}

function isOnLogInPage(pageString){

    const doc = convertFromPageStringToHtml(pageString);
    let inputElements = doc.getElementsByTagName("input");
    for(let element of inputElements){
        if(element.getAttribute('name') === 'login'){
            return  element.getAttribute('value');
        }
    }
    return false;
}

function convertFromPageStringToHtml(pageString){
    let parser = new DOMParser();
    const doc = parser.parseFromString(pageString, 'text/html');
    return doc.body;
}

async function analyseIsUserLoggedIn1(pathname) {
  // const pageString = await getTextFromPage(pathname, "", 200);
   // const doc = convertFromPageStringToHtml(pageString);

}

async function analyseBuildingsInAllVillages(){
    for (let village of villages){
        await analyseDorf1(village);
        await analyseDorf2(village);
    }
}

async function analyseAndSwitchTo(building, village) {
    if(building.isResourceBuilding()){
        return await analyseDorf1(village);
    }
    return await analyseDorf2(village)
}

