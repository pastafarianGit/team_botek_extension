
const analyseVillageProfile = async () => { //get all villages -> link, name, coordinates
    let villages = [];
    let profileCall = await callFetch(PROFILE_URL);
    let htmlString = await profileCall.text();
    let villagesLinks  = regexTextMultiple(REGEX_VILLAGE_LINK, htmlString);

    let results = xPathSearch(XPATH_PROFILE_VILLAGES, htmlString);
    let villageHtml = results.iterateNext();
    while (villageHtml) {
        const villageLink = villagesLinks.shift();
        const village = analyseBasicVillageData(villageHtml, new Village(villageLink));
        villages.push(village);
        villageHtml = results.iterateNext();
    }
    return villages;
}

async function analyseVillages() {
    let village = villagesController.villages[0];
    await analyseDorf2Buildings(village);
    await analyseDorf1Buildings(village);
    console.log("village at start ", village);
}

async function analyseDorf2Buildings(village){
    let pageText = await getTextFromPage(DORF2_URL, NEW_DID_PARAM + village.did);
    village.parseBuildingLvls(pageText);
    village.parseResources(pageText);
}

async function analyseDorf1Buildings(village) {
    let pageText = await getTextFromPage(DORF1_URL, NEW_DID_PARAM + village.did);
    village.parseResourceLvls(pageText);
    village.parseResources(pageText);
}

const analyseBasicVillageData = (villageHtml, village) => {
    let children = villageHtml.childNodes;
    (children).forEach((item) => {
        if(item.className === "name"){
            village.setNameAndCapital(item.childNodes);
        }else if(item.className === "coords"){
            village.setCoordinates(item);
        }
    })
    return village;
}
