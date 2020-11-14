function parseResources (pageString) {
    let resourceText = regexSearchOne(REGEX_RESOURCES_VAR, pageString, "gs");
    resourceText = makeValidJsonResource(resourceText);
    return JSON.parse(resourceText);
}

function parseResourceLvls (pageString) {
    let parser =  new DOMParser();
    let doc = parser.parseFromString(pageString, 'text/html');
    let resourceElements = getResourceElements(doc);
    let map = new Map();

    for (let element of resourceElements){
            map.set(element.building.locationId,  element.building);
    }
    return  map;
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
        if(child.tagName === 'DIV'){
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
                    elements.push({divContainer: child, building: new Building(locationId, gid, lvl)});
                }
            }
        }
    }
    return elements;
}

function parseBuildingLvls (pageString) {
    let parser =  new DOMParser();
    let doc = parser.parseFromString(pageString, 'text/html');
    let map = new Map();
    let elements  = getBuildingsElements(doc);
    for(let element of elements){
        map.set(element.building.locationId, element.building);
    }
    return map;
}

function parseVillages (htmlString, villagesLinks) {
    let villages = [];
    let results = xPathSearch(XPATH_PROFILE_VILLAGES, htmlString);
    let villageHtml = results.iterateNext();
    while (villageHtml) {
        const villageLink = villagesLinks.shift();
        const village = parseBasicVillageData(villageHtml, new Village(villageLink));
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
            village.setCoordinates(parseCoordinates(item));
        }
    })
    return village;
}



function parseCurrentlyBuilding (pageString, village) {
    let currentlyBuildingData = [];
    const timers = parseCurrentlyBuildingHtml(pageString);
    const buildings = parseCurrentlyBuildingJS(pageString);

    for(let i = 0; i < timers.length; i++){
        let buildTask = new BuildTask(buildings[i], village.did, null, false);
        buildTask.setNewTimeToBuild(timers[i]);
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
            buildings.push(new Building(parseInt(building.aid), building.gid, parseInt(building.stufe)));
        }
    }
    return buildings;
}
