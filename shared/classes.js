let Village = class {
    did;
    x;
    y;
    isCapital;
    name;
    resources;
    buildingsInfo;
    currentlyBuilding;
    timers;
    buildTasks;
    trainTasks;

    constructor(did) {
        this.did  = did;
        this.timers = new Timers();
        this.buildingsInfo = new Map();
        this.buildTasks = [[]];
        this.trainTasks = [];
        this.currentlyBuilding = [];
        this.isCapital = false;
        this.isInQueue = false
    }

    addParams(x, y, isCapital, name) {
        this.x  = x;
        this.y  = y;
        this.isCapital  = isCapital;
        this.name  = name;
    }

    updateBuildingInfo(updatedBuildings){
        this.buildingsInfo = new Map([...this.buildingsInfo, ...updatedBuildings]);
    }

    isEnoughRes(task){
        // let building = this.buildingsInfo.get(task.building.locationId);
        /*if(building.type === 0){
            building = new Building(task.building.locationId, task.building.type, 0);
        }*/
        // let cost = buildingsData[task.building.type].cost[building.lvl + 1];
        const cost = getBuildingCost(task, this);
        return this.checkCostVsStorage(cost);
    }

    calcTimeTillTaskCanBeBuilt(task){
        const building = this.buildingsInfo.get(task.building.locationId);
        let cost = buildingsData[task.building.type].cost[building.lvl + 1];

        const woodTime = this.calculateResourcesTime(cost.wood, this.resources.storage.l1, this.resources.production.l1);
        const clayTime = this.calculateResourcesTime(cost.clay, this.resources.storage.l2, this.resources.production.l2);
        const ironTime = this.calculateResourcesTime(cost.iron, this.resources.storage.l3, this.resources.production.l3);
        const cropTime = this.calculateResourcesTime(cost.crop, this.resources.storage.l4, this.resources.production.l3);
        let times = [woodTime, clayTime, ironTime, cropTime];
        return Math.max(...times) * 60; // change to mins
    }

    calculateResourcesTime(cost, resourcesStorage, production){
        return (cost - resourcesStorage) / production
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

    getMainBuildingLvl(){
        let lvl = 0;
        this.buildingsInfo.forEach((value, key) => {
            if(value.gid === MAIN_BUILDING_ID){
                lvl = value.lvl;
            }
        })
        return lvl;
    }

    checkCostVsStorage(cost){
        const wood = this.resources.storage.l1 >= cost.wood;
        const clay = this.resources.storage.l2 >= cost.clay;
        const iron = this.resources.storage.l3 >= cost.iron;
        const crop = this.resources.storage.l4 >= cost.crop;
        return (wood && clay && iron && crop);
    }
};

class VillagesHelper {

    static findVillage(villages, linkId){
        for(let i = 0; i < villages.length; i++){
            const village = villages[i];
            if(village.did === linkId){
                return village;
            }
        }
        return null;
    }

}

class ServerSettings {

    constructor(speed, version, worldId) {
        this.speed = speed;
        this.version = version;
        this.worldId = worldId;
    }

}

class BuildingHelper {

    static createBuilding(locationId, type, lvl) {
        let building = {};
        building.locationId = locationId;
        building.type = BuildingHelper.getType(type);
        building.lvl = BuildingHelper.getLvl(lvl, building);
        building.name = BuildingHelper.getName(type);
        return building;
    }

    static getType(type){
        if(Array.isArray(type)){
            return type;
        }else{
            return parseInt(type);
        }
    }

    static getLvl(lvl){
        if (isNaN(lvl)){
            return 0;
        }else{
           return lvl;
        }
    }

    static getName(type){
        if(Array.isArray(type)){
            return BuildingHelper.getNamesFromTypes(type);
        }else if(type !== 0){
            return  buildingsData[type].name;
        }else{
            return "Empty";
        }
    }

    static getNamesFromTypes(types){
        let name = "";
        for(let type of types){
           name += TYPES_NAMES[type] + ", "
        }
        name = name.slice(0, -2);
        return name;
    }

    static isResource(building) {
        return (building.locationId <= RES_MAX_LOCATION || building.locationId === ALL_RES_LOCATION_ID);
    }

    static getLocationTypeURL(building){
        if(building.locationId <= RES_MAX_LOCATION){
            return DORF1_PATHNAME;
        }
        return DORF2_PATHNAME;
    }
}


class AnalyseHelper {
    static createTask(){
        return {taskType: ANALYSE_TYPE};
    }
    constructor() {
    }
}

/*
class TrainTask {
  building;
   did;
   timeText;
   timer;
   uuid;
   timerUpdate;
   units = [];
   constructor(trainData, village){
       this.building = village.buildingsInfo.get(trainData.locationId)
       delete trainData.locationId;

       for (const property in trainData) {
           if(trainData.hasOwnProperty(property)){
               this[property] = trainData[property];
           }
       }
       this.timer = TrainTaskHelper.getTimeInMiliSec(trainData);
       this.uuid = getUuidv4();
       this.timerUpdate = Date.now();
       this.addNames();
   }
}*/

class CurrentlyBuildingHelper {

    static updateIfTaskDone(village){
        for (let currBuilding of village.currentlyBuilding){
            CurrentlyBuildingHelper.currentlyBuildingTaskComplete(village.buildTasks, currBuilding.building);
        }
    }

    static currentlyBuildingTaskComplete(buildTasks, currentTask) {
        for(let taskGroup of buildTasks){
            for(let task of taskGroup){
                if (task.building.locationId === currentTask.locationId) {
                    if (task.building.lvl <= currentTask.lvl) {
                        BuildHelper.deleteTask(task.uuid, buildTasks);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static isBuildSlotFree(building, tasks){
        if(tasks.length === 0) {
            return true;
        }

        if(tribe === TRIBE_ROMANS){
            return this.canRomansBuild(building, tasks);
        }
        return false;
    }

    static canRomansBuild(building, tasks){
        if(BuildingHelper.isResource(building)){
            return !this.isResourceCurrentlyBuilding(tasks);
        }
        return !this.isTownCurrentlyBuilding(tasks);
    }

    static isResourceCurrentlyBuilding(tasks){
        return this.checkBuildingStatus(true, tasks);
    }

    static isTownCurrentlyBuilding(tasks){
        return this.checkBuildingStatus(false, tasks);
    }

    static checkBuildingStatus(isRes, tasks){
        for(let task of tasks){
            if(BuildingHelper.isResource(task.building) === isRes){
                return true; // building already in progress
            }
        }
        return false;
    }
}

class Timers {

    constructor() {
        const date = Date.now();
        this.buildingTimer = date;
        this.romansDorf1Timer = date;
        this.romansDorf2Timer = date;
        this.armyTimer = date;
    }

    isNextCheckTime(type) {
        switch (type) {
            case ROMANS_DORF1_ID:
                return (this.romansDorf1Timer < Date.now());
            case ROMANS_DORF2_ID:
                return (this.romansDorf2Timer < Date.now());
            case BOTH_BUILD_ID:
                return (this.buildingTimer < Date.now());
            default:
                return false;
        }

    }

    nextCheckTime(type){
        let timer = null;
        switch (type) {
            case ROMANS_DORF1_ID:
                timer = this.romansDorf1Timer;
                break
            case ROMANS_DORF2_ID:
                timer = this.romansDorf2Timer;
                break;
            case BOTH_BUILD_ID:
                timer = this.buildingTimer;
                break;
            default:
                return false;
        }
        let nextCheck = timer - Date.now();
        return  nextCheck / 1000 / 60;
    }

    addTimeFromNow(type, time){
        switch (type) {
            case ROMANS_DORF1_ID:
               this.romansDorf1Timer =  Date.now() + time;
               break;
            case ROMANS_DORF2_ID:
                this.romansDorf2Timer =  Date.now() + time;
                break;
            case BOTH_BUILD_ID:
                this.buildingTimer =  Date.now() + time;
                break;
        }
    }

    addTimeFromNowSec(type, sec){
        const newTime = Date.now() + sec * 1000;
        switch (type) {
            case ROMANS_DORF1_ID:
                this.romansDorf1Timer =  newTime;
                break;
            case ROMANS_DORF2_ID:
                this.romansDorf2Timer =  newTime;
                break;
            case BOTH_BUILD_ID:
                this.buildingTimer =  newTime;
                break;
        }
    }

    addTimeFromNowMins(type, mins){
        this.addTimeFromNow(type, mins * 60 * 1000);
    }

    updateTimers(currentlyBuilding) {
        console.log("currBuildings", currentlyBuilding);
        if (tribe === TRIBE_ROMANS) {
            for (let buildTask of currentlyBuilding) {
                if (BuildingHelper.isResource(buildTask.building)) {
                    this.romansDorf1Timer = buildTask.timeToBuild;
                } else {
                    this.romansDorf2Timer = buildTask.timeToBuild;
                }
            }
        } else {
            for (let buildTask of currentlyBuilding) {
                this.buildingTimer = buildTask.timeToBuild;
            }
        }
    }

    updateTimerOnNewTask(currentlyBuilding, newTask){
        let isBuildSlotFree = CurrentlyBuildingHelper.isBuildSlotFree(newTask.building, currentlyBuilding);
        if(isBuildSlotFree){
            this.add5Sec(newTask.timerType);
        }
    }

    add15Mins(type){
        this.addTimeFromNow(type, 900000);
    }

    add1Min(type){
        this.addTimeFromNow(type, 60000);
    }

    add5Sec(type){
        this.addTimeFromNow(type, 5000);
    }

    add5Min(type){
        this.addTimeFromNow(type, 60000*5);
    }
}
