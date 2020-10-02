
const analyseVillageProfile = async () => { //get all villages -> link, name, coordinates
    let profileCall = await callFetch(PROFILE_URL);
    let pageString = await profileCall.text();
    serverSettings = parseServerSettings(pageString);
    console.log("server settings", serverSettings);
    let villagesLinks  = regexSearchMultiple(REGEX_VILLAGE_LINK, pageString);
    return parseVillages(pageString, villagesLinks);
}

const analyseVillages = async () => {
    let village = villagesController.villages[0];
    await analyseDorf2Buildings(village);
    await analyseDorf1Buildings(village);
    console.log("village at start ", village);
}

const analyseDorf2Buildings = async (village) => {
    let pageString = await getTextFromPage(DORF2_URL, NEW_DID_PARAM + village.did);
    let townBuildings = parseBuildingLvls(pageString);
    village.updateBuildingInfo(townBuildings);
    village.resources = parseResources(pageString);

}

const analyseDorf1Buildings = async (village) => {
    let pageString = await getTextFromPage(DORF1_URL, NEW_DID_PARAM + village.did);
    let resourceBuildings = parseResourceLvls(pageString);
    village.updateBuildingInfo(resourceBuildings);
    village.resources = parseResources(pageString);
    parseCurrentlyBuilding(pageString);
}


const parseCurrentlyBuilding = (pageString) => {
    const timers = parseCurrentlyBuildingHtml(pageString);
    const buildings = parseCurrentlyBuildingJS(pageString);
    console.log("timers", timers);
    console.log("buildings", buildings);
}


const parseCurrentlyBuildingHtml = (pageString) => {
    let values = [];
    let results = xPathSearch(XPATH_CURRENTLY_BUILDING, pageString);
    let ul = results.iterateNext();
    let children = ul.getElementsByClassName("timer");

    for (let child of children){
        values.push(child.getAttribute("value"));
        console.log("buildDuration child", child.getAttribute("value"));
    }
    return values;
}

const parseCurrentlyBuildingJS = (pageString) => {
    let currentlyText = regexSearchOne(REGEX_CURRENTLY_BUILDING, pageString, "gs");
    console.log("current building Text", currentlyText);
    return JSON.parse(currentlyText);
}

