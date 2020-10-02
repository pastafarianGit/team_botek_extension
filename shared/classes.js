let Village = class {
    did;
    x;
    y;
    isCapital;
    name;
    //buildTasks = []; // TODO change to map da lahko normalno deletas
    nextCheckTime;
    resources;
    buildingsInfo = new Map();

    constructor(did) {
        this.did  = did;
    }

    addParams(x, y, isCapital, name) {
        this.x  = x;
        this.y  = y;
        this.isCapital  = isCapital;
        this.name  = name;
        this.nextCheckTime = Date.now() + 1000;
        this.buildingsInfo = new Map();
        this.buildTasks = new Map();
    }

    isNextCheckTime() {
        console.log("time diff: " ,  this.nextCheckTime - Date.now());
        return (this.nextCheckTime < Date.now());
    }

    isNextBuildTask() {
        return (this.buildTasks.size > 0);
    }

    updateBuildingInfo(updatedBuildings){
        this.buildingsInfo = new Map([...this.buildingsInfo, ...updatedBuildings]);
    }

    getNextTask(){
        for (const [key, task] of this.buildTasks.entries()) {
            const building = this.buildingsInfo.get(task.locationId);
            console.log("building lvl", building);
            console.log("task lvl", task);
            if((building.lvl) < task.lvl){
                let cost = buildingsData[building.gid].cost[building.lvl + 1];
                if(this.isEnoughResources(cost)){
                    return task;
                }
            }else{
                this.buildTasks.delete(key);
                console.log("deleted task ",  this.buildTasks);

                // remove task from array
            }
        }
        return null;
    }

    setCoordinates(coordinates){
        const {x,y} = coordinates;
        this.x = x;
        this.y = y;
    }



    getMainBuildingSpeed(){
        const lvl = this.getMainBuildingLvl();
        return buildingsData[MAIN_BUILDING_ID].reduceTime[lvl];
    }

    setNextCheckTime(time){
        let reduceTime = this.getMainBuildingSpeed();
        let serverSpeed = this.getMainBuildingSpeed();
    }

    /*getMainBuildingLvl(){
        const mainBuilding = this.getMainBuilding();
        return mainBuilding.lvl;
    }*/

    getMainBuildingLvl(){
        let lvl = 0;
        this.buildingsInfo.forEach((value, key) => {
            if(value.gid === MAIN_BUILDING_ID){
                lvl = value.lvl;
            }
        })
        return lvl;
    }

    isEnoughResources(cost){
        const wood = this.resources.storage.l1 >= cost.wood;
        const clay = this.resources.storage.l2 >= cost.clay;
        const iron = this.resources.storage.l3 >= cost.iron;
        const crop = this.resources.storage.l4 >= cost.crop;
        return (wood && clay && iron && crop);
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

let ServerSettings = class {

    constructor(speed, version, worldId) {
        this.speed = speed;
        this.version = version;
        this.worldId = worldId;
    }
}
