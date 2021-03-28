function regexSearchOne(regex, text, flags) {
    let re = new RegExp(regex,flags);
    let result = re.exec(text);
    if(result !== null && result.length > 1){
        return  result[1];
    }
    return null;
}

function parseBuildingInfoOnResource(divResource) {
    let locationId, gid;
    let lvl;
    for(let divClass of divResource.classList){
        if(divClass.startsWith(BUILDING_LOCATION_ID)){
            locationId = parseInt(divClass.substring(BUILDING_LOCATION_ID.length));
        }
        if(divClass.startsWith(BUILDING_GID)){
            gid = parseInt(divClass.substring(BUILDING_GID.length));
        }
    }
    if(divResource.getElementsByTagName('div')[0] !== null){
        lvl = parseInt(divResource.getElementsByTagName('div')[0].innerText);
    }else{
        lvl = parseInt(divResource.getElementsByTagName('span')[0].innerText);
    }

    return BuildingHelper.createBuilding(locationId, gid, lvl);
}



function regexSearchMultiple(regex, text) {
    let results = [];
    let re = new RegExp(regex,"g");
    let matches = re[Symbol.matchAll](text);
    for (const match of matches) {
        //console.log("multiple matches", match);
        if(match !== null && match.length > 1){
            results.push(match[1]);
        }
    }
    return results;
}

function xPathSearch(xPath, htmlString) {
    let doc = toHtmlElement(htmlString);
    return doc.evaluate(xPath, doc.body, null, XPathResult.ANY_TYPE, null);
}

async function getTextFromPage(pathname, params, time) {
    let pageCall = await callFetchWithBaseUrl(pathname + params, {}, time);
    return  await pageCall.text();
}

function parseHiddenInputValuesOnTrain(pageString) {
    const doc = toHtmlElement(pageString);
    const buildActionDiv = doc.getElementsByClassName("buildActionOverview")[0];
    let hiddenInput = {};
    if(buildActionDiv === undefined){
        return hiddenInput;
    }

    for(const child of buildActionDiv.children){
        //console.log("child on train", {child});
        if(child.tagName === 'INPUT'){
            hiddenInput[child.name] = child.value;
            //console.log("input1 ", child.name);
           // console.log("input2 ", child.value);
        }
    }
    return hiddenInput;
}

function parseResources (pageString) {
    let resourceText = regexSearchOne(REGEX_RESOURCES_VAR, pageString, "gs");
    resourceText = makeValidJsonResource(resourceText);
    return JSON.parse(resourceText);
}

function parseResourceLvls (pageString) {
    let parser =  new DOMParser();
    let doc = parser.parseFromString(pageString, 'text/html');
    let resourceElements = getResourceElements(doc);
    //let map = new Map();
    let resources = [];
    for (let element of resourceElements){
        resources.push(element.building);
    }
    return  resources;
}

function parseGetNewBuildingButton(pageString, type) {
    let htmlElement = toHtmlElement(pageString);
    const contractBuilding = htmlElement.getElementById(CONTRACT_BUILDING + type.toString());
    const contractLink = contractBuilding.getElementsByClassName('contractLink')[0];
    return contractLink.getElementsByTagName('button')[0];
}


function getResourceElements(doc) {
    let elements = [];
    const resContainer = doc.getElementById("resourceFieldContainer");
    for (let child of resContainer.childNodes){
        if(child.tagName === 'A' && !child.classList.contains("villageCenter")){
            let building = parseBuildingInfoOnResource(child);
            elements.push({divContainer: child, building: building});
        }
    }
    return elements;
}

function getBuildingsElements(doc) {
    let elements = [];
    const resContainer = doc.getElementById("village_map");
    for (let child of resContainer.childNodes) {
        if(child.classList !== undefined){
            if (child.tagName === 'DIV') {
                const classList = child.classList.toString();
                const locationId = parseInt(regexSearchOne(REGEX_DORF2_BUILDING_LOCATION, classList, "g"));
                const gid = parseInt(regexSearchOne(REGEX_DORF2_BUILDING_TYPE, classList, "g"));
                let lvl = 0;
                if( (locationId > 18 && locationId < 40)
                    || (locationId === 40 && classList.includes("bottom"))
                ){
                    const labelLayer = child.getElementsByClassName("labelLayer")[0];
                    if(labelLayer){
                        lvl = parseInt(labelLayer.innerText);
                    }
                    let building = BuildingHelper.createBuilding(locationId, gid, lvl);
                    if(building !== null){
                        elements.push({divContainer: child, building: building});
                    }
                }
            }
        }
    }
    return elements;
}

function parseBuildingLvls (pageString) {
    let parser =  new DOMParser();
    let doc = parser.parseFromString(pageString, 'text/html');
    let buildings = [];
    let elements  = getBuildingsElements(doc);
    for(let element of elements){
        buildings.push(element.building);
    }
    return buildings;
}

function parseVillages (htmlString, villagesLinks) {
    let villages = [];
    let results = xPathSearch(XPATH_PROFILE_VILLAGES, htmlString);
    let villageHtml = results.iterateNext();
    while (villageHtml) {
        const villageLink = villagesLinks.shift();
        const village = parseBasicVillageData(villageHtml, VillageHelper.createVillage(villageLink));
        villages.push(village);
        villageHtml = results.iterateNext();
    }
    return villages;
}

function parseNameAndCapital (children) {
    let name = '';
    let isCapital = false;
    (children).forEach((child) => {
        if(child.tagName === 'A'){
            name = child.textContent;
        }else if(child.tagName === 'SPAN' && child.className === 'mainVillage'){
            isCapital = true;
        }
    });
    return {name: name, isCapital: isCapital};
}

function parseCoordinates (coordinateChild) {
    const text = coordinateChild.innerText;
    let coordinateXY  = regexSearchMultiple(REGEX_COORDINATE_XY, text);
    return {x:coordinateXY[0], y:coordinateXY[1]};
}

function parseServerSettings (pageString) {
    let settingsText = regexSearchOne(REGEX_SERVER_SETTINGS, pageString, "gs");
    const speed = regexSearchOne(REGEX_SERVER_SPEED, settingsText, "g");
    const version = regexSearchOne(REGEX_SERVER_VERSION, settingsText, "g");
    const worldId = regexSearchOne(REGEX_SERVER_WORLD_ID, settingsText, "g");
    return new ServerSettings(speed, version, worldId);
}

function parseBasicVillageData (villageHtml, village) {
    let children = villageHtml.childNodes;
    (children).forEach((item) => {
        if(item.className === "name"){
            const {name, isCapital} = parseNameAndCapital(item.childNodes);
            village.name = name;
            village.isCapital = isCapital;
        }else if(item.className === "coords"){
            VillageHelper.setCoordinates(parseCoordinates(item), village);
        }
    })
    return village;
}



function parseCurrentlyBuilding (pageString, village) {
    let currentlyBuildingData = [];
    const timers = parseCurrentlyBuildingHtml(pageString);
    const buildings = parseCurrentlyBuildingJS(pageString);

    for(let i = 0; i < timers.length; i++){
        let buildTask = BuildHelper.createTask(buildings[i], village.did, null, false);
        BuildHelper.setNewTimeToBuild(buildTask, timers[i]);
        currentlyBuildingData.push(buildTask);
    }
    return currentlyBuildingData;
}

function parseCurrentlyBuildingHtml (pageString) {
    let values = [];
    let results = xPathSearch(XPATH_CURRENTLY_BUILDING, pageString);

    let ul = results.iterateNext();
    if(ul !== null){
        let children = ul.getElementsByClassName("timer");
        for (let child of children){
            values.push(parseInt(child.getAttribute("value")));
        }
    }
    return values;
}

function parseCurrentlyBuildingJS (pageString) {
    let buildings = [];
    let currentlyText = regexSearchOne(REGEX_CURRENTLY_BUILDING, pageString, "gs");
    const buildingsJson = JSON.parse(currentlyText);
    if(buildingsJson !== null){
        for(let building of buildingsJson){
            let newBuilding = BuildingHelper.createBuilding(parseInt(building.aid), building.gid, parseInt(building.stufe));
            if(newBuilding !== null){
                buildings.push(newBuilding);
            }
        }
    }
    return buildings;
}

function getSidebarVillageBox(pageString) {
    let doc = toHtmlElement(pageString);
    return doc.getElementById('sidebarBoxVillagelist');
}

function getProductionTableBodyContainerF() {
    let production = document.getElementById('production');
    return  production.getElementsByTagName('tbody')[0];
}
