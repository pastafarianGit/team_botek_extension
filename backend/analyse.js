
async function analyseVillageProfile () { //get all villages -> link, name, coordinates
    let profileCall = await callFetch(PROFILE_URL);
    let pageString = await profileCall.text();
    serverSettings = parseServerSettings(pageString);
    console.log("server settings", serverSettings);
    let villagesLinks  = regexSearchMultiple(REGEX_VILLAGE_LINK, pageString);
    return parseVillages(pageString, villagesLinks);
}

async function analyseAndSwitchTo(building, village) {
    if(building.isResourceBuilding()){
        await getDorf1AndAnalyseBuildings(village);
    }
    await getDorf2AndAnalyseBuildings(village)
}

async function analyseVillages() {
    let village = villagesHelper.villages[0];
    await getDorf1AndAnalyseBuildings(village);
    await getDorf2AndAnalyseBuildings(village);
    console.log("village at start ", village);
}

async function analysePageStringDorf12 (pageString, village,  isRes) {
    if(isRes){
        analyseDorf1Buildings(pageString, village);
    }else{
        analyseDorf2Buildings(pageString, village);
    }
}

function parseTribe (pageString) {
    if(tribe === -1){
        tribe = parseInt(regexSearchOne(REGEX_TRIBE, pageString, "g"));
    }
}

async function getDorf1AndAnalyseBuildings(village) {
    let pageString = await getTextFromPage(DORF1_URL, NEW_DID_PARAM + village.did);
    analyseDorf1Buildings(pageString, village);
}

async function getDorf2AndAnalyseBuildings(village) {
    let pageString = await getTextFromPage(DORF2_URL, NEW_DID_PARAM + village.did);
    analyseDorf2Buildings(pageString, village);
}

function analyseDorf1Buildings (pageString, village){
    parseTribe(pageString);
    let resourceBuildings = parseResourceLvls(pageString);
    village.updateBuildingInfo(resourceBuildings);
    analyseCurrResBuildings(village, pageString);
    village.timers.updateTimers(village.currBuilding.tasks);
}

function analyseDorf2Buildings (pageString, village) {
    let townBuildings = parseBuildingLvls(pageString);
    village.updateBuildingInfo(townBuildings);
    analyseCurrResBuildings(village, pageString);
    village.timers.updateTimers(village.currBuilding.tasks);
}

function analyseCurrResBuildings (village, pageString) {
    village.resources = parseResources(pageString);
    village.currBuilding = parseCurrentlyBuilding(pageString, village);
}

