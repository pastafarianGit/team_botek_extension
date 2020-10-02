const parseResources = (pageString) => {
    let resourceText = regexSearchOne(REGEX_RESOURCES_VAR, pageString, "gs");
    resourceText = makeValidJsonResource(resourceText);
    return JSON.parse(resourceText);
}

const parseResourceLvls = (pageString) => {
    let parser =  new DOMParser();
    let doc = parser.parseFromString(pageString, 'text/html');
    const resContainer = doc.getElementById("resourceFieldContainer");
    let map = new Map();

    for (let child of resContainer.childNodes){
        if(child.tagName === 'DIV'){
            let locationID, lvl, gid;
            for(let divClass of child.classList){
                if(divClass.startsWith(BUILDING_LOCATION_ID)){
                    locationID = divClass.substring(BUILDING_LOCATION_ID.length);
                }
                if(divClass.startsWith(BUILDING_GID)){
                    gid = divClass.substring(BUILDING_GID.length);
                }
            }
            lvl = child.getElementsByTagName('div')[0].innerText;
            map.set(parseInt(locationID), {lvl:parseInt(lvl), gid: parseInt(gid)});
            //fields.push({lvl:lvl, locationID: locationID, gid: gid});
        }
    }
    return  map;
}

const parseBuildingLvls = (pageString) => {
    let parser =  new DOMParser();
    let doc = parser.parseFromString(pageString, 'text/html');
    const resContainer = doc.getElementById("village_map");
    let map = new Map();

    for (let child of resContainer.childNodes) {
        if(child.classList !== undefined){
            if (child.tagName === 'DIV') {
                const classList = child.classList.toString();
                const locationID = parseInt(regexSearchOne(REGEX_DORF2_BUILDING_LOCATION, classList, "g"));
                const type = parseInt(regexSearchOne(REGEX_DORF2_BUILDING_TYPE, classList, "g"));
                let lvl = 0;
                if( (locationID > 18 && locationID < 40)
                    || (locationID === 40 && classList.includes("bottom"))
                ){
                    const labelLayer = child.getElementsByClassName("labelLayer")[0];
                    if(labelLayer){
                        lvl = parseInt(labelLayer.innerText);
                    }
                    map.set(locationID, {lvl:lvl, gid: type});

                }
            }
        }
    }
    return map;
}

const parseVillages = (htmlString, villagesLinks) => {
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

const parseNameAndCapital = (children) => {
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

const parseCoordinates = (coordinateChild) => {
    const text = coordinateChild.innerText;
    let coordinateXY  = regexSearchMultiple(REGEX_COORDINATE_XY, text);
    return {x:coordinateXY[0], y:coordinateXY[1]};
}

const parseServerSettings = (pageString) => {
    let settingsText = regexSearchOne(REGEX_SERVER_SETTINGS, pageString, "gs");
    const speed = regexSearchOne(REGEX_SERVER_SPEED, settingsText, "g");
    const version = regexSearchOne(REGEX_SERVER_VERSION, settingsText, "g");
    const worldId = regexSearchOne(REGEX_SERVER_WORLD_ID, settingsText, "g");
    return new ServerSettings(speed, version, worldId);
}

const parseBasicVillageData = (villageHtml, village) => {
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
