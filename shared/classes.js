let Village = class {
    did;
    x;
    y;
    isCapital;
    name;
    buildTasks = [];
    nextCheckTime;
    resources;
    resourcesLvls;
    buildingLvls;
    constructor(did) {
        this.did  = did;
    }

    addParams(x, y, isCapital, name) {
        this.x  = x;
        this.y  = y;
        this.isCapital  = isCapital;
        this.name  = name;
        this.nextCheckTime = Date.now() + 10000;
    }

    isNextCheckTime() {
        return (this.nextCheckTime < Date.now());
    }

    isNextBuildTask() {
        return (this.buildTasks.length > 0);
    }

    getNextTask(){
        for (let task of this.buildTasks){
            const building = this.resourcesLvls.get(task.locationId);

            console.log(" task.lvl", task.lvl);
            console.log(" task.lvl type", typeof task.lvl);

            if(building.lvl < task.lvl){
                let cost = buildings[building.gid].cost[building.lvl + 1];
                console.log("cost", cost);
                if(this.isEnoughResources(cost)){
                    return task;
                }
            }else{
                // remove task from array
            }
        }
        return null;
    }

    setNameAndCapital(children){
        let name = '';
        let isCapital = false;
        (children).forEach((child) => {
            if(child.tagName === 'A'){
                name = child.textContent;
            }else if(child.tagName === 'SPAN' && child.className === 'mainVillage'){
                isCapital = true;
            }
        });
        this.name = name;
        this.isCapital = isCapital;
    }

    setCoordinates(coordinateChild){
        const text = coordinateChild.innerText;
        let coordinateXY  = regexTextMultiple(REGEX_COORDINATE_XY, text);
        this.x = coordinateXY[0];
        this.y = coordinateXY[1];
    }

    getMainBuildingLvl(){
        //const building = this.resourcesLvls.get();
    }

    isEnoughResources(cost){
        const wood = this.resources.storage.l1 >= cost.wood;
        const clay = this.resources.storage.l2 >= cost.clay;
        const iron = this.resources.storage.l3 >= cost.iron;
        const crop = this.resources.storage.l4 >= cost.crop;
        return (wood && clay && iron && crop);
    }


    parseResources(pageText) {
        let resourceText = regexTextSingle(REGEX_RESOURCES_VAR, pageText, "gs");
        resourceText = makeValidJsonResource(resourceText);
        this.resources = JSON.parse(resourceText);
    }

    parseResourceLvls(pageText){
        let parser =  new DOMParser();
        let doc = parser.parseFromString(pageText, 'text/html');
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
                map.set(locationID, {lvl:parseInt(lvl), gid: gid});
                //fields.push({lvl:lvl, locationID: locationID, gid: gid});
            }
        }
        this.resourcesLvls = map;
    }

    parseBuildingLvls(pageText){
        let parser =  new DOMParser();
        let doc = parser.parseFromString(pageText, 'text/html');
        const resContainer = doc.getElementById("village_map");
        let map = new Map();

        for (let child of resContainer.childNodes) {
            if(child.classList !== undefined){
                if (child.tagName === 'DIV') {
                    const classList = child.classList.toString();
                    const locationID = parseInt(regexTextSingle(REGEX_DORF2_BUILDING_LOCATION, classList, "g"));
                    const type = parseInt(regexTextSingle(REGEX_DORF2_BUILDING_TYPE, classList, "g"));
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
        this.buildingLvls = map;
    }
};





let VillagesController = class {

    constructor(villages) {
        this.villages = villages;
    }

    findVillage(linkId){
        for(let i = 0; i < this.villages.length; i++){
            const village = this.villages[i];
            if(village.did === linkId){
                return village;
            }
        }
        return null;
    }

}
