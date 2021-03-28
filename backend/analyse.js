async function analyseVillageProfile () { //get all villages -> link, name, coordinates
    const pageString = await getText(PROFILE_PATHNAME, "", 300);
    serverSettings = parseServerSettings(pageString);
    let villagesLinks  = regexSearchMultiple(REGEX_VILLAGE_LINK, pageString);
    return parseVillages(pageString, villagesLinks);
}

function analyseVillagesOnStart(sendResponse){
    console.log("analyse villages on start");
    updateBotStatusGUI(BOT_IS_ANALYSING_VILLAGES);
    botStatus.updateProfile = false;
    analyseVillageProfile()
        .then(result => {
            villages = result;
            loadUserData();
            sendMessageToGUI(UPDATE_ALL_GUI_BOT_DATA_ACTION, {villages, isBotOn: botStatus.isBotOn, tribe: tribe});
            return analyseBuildingsInAllVillages();
        }).then(result => {
        if(sendResponse){
            isTabActive(sendResponse);
        }
        updateWorkingBotStatus();
    }).catch(err=> {
        console.log("err updating villages", err);
    });

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
    if(botStatus.updateTribe){
        tribe = parseInt(regexSearchOne(REGEX_TRIBE, pageString, "g"));
        botStatus.updateTribe = false;
    }
}

async function analyseDorf1(village) {
    sendMessageToBotTab(CHANGE_VILLAGE_ACTION, village);
    let pageString = await getText(DORF1_PATHNAME, NEW_DID_PARAM + village.did, 2000);
    parseAndUpdateDorf1(pageString, village);
}

async function analyseDorf2(village) {
    sendMessageToBotTab(CHANGE_VILLAGE_ACTION, village);
    let pageString = await getText(DORF2_PATHNAME, NEW_DID_PARAM + village.did, 2000);
    parseAndUpdateDorf2(pageString, village);
}

function parseAndUpdateDorf1 (pageString, village){
    parseTribe(pageString);
    let resourceBuildings = parseResourceLvls(pageString);
    BuildingHelper.updateBuildingInfo(resourceBuildings, village);
    analyseBackgroundContent(village, pageString);
}

function parseAndUpdateDorf2 (pageString, village) {
    let townBuildings = parseBuildingLvls(pageString);
    BuildingHelper.updateBuildingInfo(townBuildings, village);
    analyseBackgroundContent(village, pageString);
}

function analyseBackgroundContent (village, pageString) {
    village.resources = parseResources(pageString);
    village.currentlyBuilding = parseCurrentlyBuilding(pageString, village);
    TimersHelper.updateTimers(village.currentlyBuilding, village.timers);
    BuildHelper.addLvlForCurrentlyBuilding(village);
    checkForNewVillage1(pageString);
}

function checkForNewVillage1(pageString){
    const sideBar = getSidebarVillageBox(pageString);
    let ul = sideBar.getElementsByTagName('ul')[0];
    if(ul.childElementCount !== villages.length){
        console.log("number of villages", ul.childElementCount);
        queue.push(AnalyseHelper.createTask());
    }
}

function analyseTrainBuilding(pageString){
    // pridobi z, a, s, s1
    const hiddenInputValuesOnTrain = parseHiddenInputValuesOnTrain(pageString);
    return hiddenInputValuesOnTrain;
    //return {z: 1, a: 2, s: 3, s1: 4};
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
    if(BuildingHelper.isResource(building)){
        return await analyseDorf1(village);
    }
    return await analyseDorf2(village)
}

