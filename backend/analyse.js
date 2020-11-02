async function analyseVillageProfile () { //get all villages -> link, name, coordinates
    const pageString = await getTextAndCheckLogin(PROFILE_PATHNAME, "", 300);
    serverSettings = parseServerSettings(pageString);
    let villagesLinks  = regexSearchMultiple(REGEX_VILLAGE_LINK, pageString);
    return parseVillages(pageString, villagesLinks);
}

function analyseVillagesAfterLogin(sendResponse){
    analyseVillageProfile()
        .then(result => {
            villages = result;
            sendMessageToGUI(UPDATE_ALL_GUI_BOT_DATA_ACTION, {villages, isBotOn: isBotOn});
            isTabActive(sendResponse);
            return analyseBuildingsInAllVillages();
        }).then(result => {
    }).catch(err=> {
        console.log("err updating villages", err);
    });
}

async function analyseBuildingsInAllVillages(){
    for (let village of villages){
        await getDorf1AndAnalyse(village);
        await getDorf2AndAnalyse(village);
    }
}

async function analyseAndSwitchTo(building, village) {
    if(building.isResourceBuilding()){
        return await getDorf1AndAnalyse(village);
    }
    return await getDorf2AndAnalyse(village)
}

async function analyseVillagesTest() {
    let village = villages[0];
    await getDorf1AndAnalyse(village);
    await getDorf2AndAnalyse(village);
}

function analysePageStringDorf12 (pageString, village,  isRes) {
    if(isRes){
        analyseAndUpdateDorf1Buildings(pageString, village);
    }else{
        analyseAndUpdateDorf2Buildings(pageString, village);
    }
}

function parseTribe (pageString) {
    if(newBotOpen.updateTribe){
        tribe = parseInt(regexSearchOne(REGEX_TRIBE, pageString, "g"));
        newBotOpen.updateTribe = false;
    }
}

async function getDorf1AndAnalyse(village) {
    let pageString = await getTextAndCheckLogin(DORF1_PATHNAME, NEW_DID_PARAM + village.did, 3000);
    analyseAndUpdateDorf1Buildings(pageString, village);
}

async function getDorf2AndAnalyse(village) {
    let pageString = await getTextAndCheckLogin(DORF2_PATHNAME, NEW_DID_PARAM + village.did, 3000);
    analyseAndUpdateDorf2Buildings(pageString, village);
}

function analyseAndUpdateDorf1Buildings (pageString, village){
    parseTribe(pageString);
    let resourceBuildings = parseResourceLvls(pageString);
    village.updateBuildingInfo(resourceBuildings);
    analyseCurrResBuildings(village, pageString);
}

function analyseAndUpdateDorf2Buildings (pageString, village) {
    let townBuildings = parseBuildingLvls(pageString);
    village.updateBuildingInfo(townBuildings);
    analyseCurrResBuildings(village, pageString);
}

function analyseCurrResBuildings (village, pageString) {
    village.resources = parseResources(pageString);
    village.currentlyBuilding = parseCurrentlyBuilding(pageString, village);
    village.timers.updateTimers(village.currentlyBuilding);

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


function convertFromPageStringToHtml(pageString){
    let parser = new DOMParser();
    return  parser.parseFromString(pageString, 'text/html');

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

async function analyseIsUserLoggedIn1(pathname) {
  // const pageString = await getTextFromPage(pathname, "", 200);
   // const doc = convertFromPageStringToHtml(pageString);

}
