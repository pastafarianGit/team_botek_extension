class VillageHelper {

    static createVillage(did) {
       return  {
            did: did,
            timers: TimersHelper.createTimers(),
            buildingsInfo: [],
            tasks : {
                buildTasks: [[]],
                trainTasks: [],
                farmTasks: [],
            },

            currentlyBuilding: [],
            isCapital: false,
            isInQueue: false
        }
    }

    static isEnoughRes(task, village){
        const cost = BuildingHelper.getBuildingCost(task, village);
        return VillageHelper.checkCostVsStorage(cost, village);
    }

    static calcTimeTillTaskCanBeBuilt(task, village){

        const building = BuildingHelper.getBuildingOnLocation(task.building.locationId, village);
        let cost = buildingsData[task.building.type].cost[building.lvl + 1];

        const woodTime = VillageHelper.calculateResourcesTime(cost.wood, village.resources.storage.l1, village.resources.production.l1);
        const clayTime = VillageHelper.calculateResourcesTime(cost.clay, village.resources.storage.l2, village.resources.production.l2);
        const ironTime = VillageHelper.calculateResourcesTime(cost.iron, village.resources.storage.l3, village.resources.production.l3);
        const cropTime = VillageHelper.calculateResourcesTime(cost.crop, village.resources.storage.l4, village.resources.production.l3);
        let times = [woodTime, clayTime, ironTime, cropTime];
        return Math.max(...times) * 60; // change to mins
    }

    static calculateResourcesTime(cost, resourcesStorage, production){
        return (cost - resourcesStorage) / production
    }

    static setCoordinates(coordinates, village){
        const {x,y} = coordinates;
        village.x = x;
        village.y = y;
    }

    static getMainBuildingSpeed(village){
        const lvl = VillageHelper.getMainBuildingLvl(village);
        return buildingsData[MAIN_BUILDING_ID].reduceTime[lvl];
    }

    static getMainBuildingLvl(village){
        let lvl = 0;
        for(let building of village.buildingsInfo){
            if(building.gid === MAIN_BUILDING_ID){
                lvl = building.lvl;
            }
        }
        return lvl;
    }

    static checkCostVsStorage(cost, village){
        const wood = village.resources.storage.l1 >= cost.wood;
        const clay = village.resources.storage.l2 >= cost.clay;
        const iron = village.resources.storage.l3 >= cost.iron;
        const crop = village.resources.storage.l4 >= cost.crop;
        return (wood && clay && iron && crop);
    }

    static findVillage(villages, did){
        for(let i = 0; i < villages.length; i++){
            const village = villages[i];
            if(village.did === did){
                return village;
            }
        }
        return null;
    }
}

class TaskHelper {
    static isTaskOverdo(task) {
        return (task.timerUpdate < Date.now());
    }

    static resetTimer(task){
        task.timerUpdate = Date.now() + task.timer;
    }

}

class FarmHelper {
    static createFarmTask(task){
        task.timer = TrainHelper.getTimeInMiliSec(task);
        task.uuid = getUuidv4();
        task.timerUpdate = Date.now();
        return task;
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

    static getBuildingCost(task, village) {
        const building = BuildingHelper.getBuildingOnLocation(task.building.locationId, village);
        return  buildingsData[task.building.type].cost[building.lvl + 1];
    }

    static getNamesFromTypes(types){
        let name = "";
        for(let type of types){
           name += TYPES_NAMES[type] + ", "
        }
        name = name.slice(0, -2);
        return name;
    }

    static getBuildingOnLocation(locationId, village){
        for (const building of village.buildingsInfo){
            if(building.locationId === locationId){
                return building;
            }
        }
        return null;
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

    static getMinBuildingLvl(buildings){
        console.log("buildings", buildings);
        return buildings.reduce((result, resource) => {
            if(result.lvl < resource.lvl){
                return result;
            }
            return resource;
        } );
    }

    static getResourceBuildings(village){

         return village.buildingsInfo
             .filter(building => {
                 return this.isResource(building)
             });
    }

    static updateBuildingInfo(updatedBuildings, village){

        for(const updateB of updatedBuildings){
            let building = this.getBuildingOnLocation(updateB.locationId, village);
            if(building){
                building = updateB;
            }else
                village.buildingsInfo.push(updateB);
        }
    }

    static getMinLvlForAllResources(village){
        let resources = BuildingHelper.getResourceBuildings(village);
        const minBuilding = BuildingHelper.getMinBuildingLvl(resources);
        return minBuilding.lvl;
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
            CurrentlyBuildingHelper.currentlyBuildingTaskComplete(village.tasks.buildTasks, currBuilding.building);
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

class TimersHelper {

    static createTimers() {
        const date = Date.now();
        return {
            buildingTimer : date,
            romansDorf1Timer : date,
            romansDorf2Timer : date
        }

        //this.armyTimer = date;
    }

    static isNextCheckTime(type, timers) {
        switch (type) {
            case ROMANS_DORF1_ID:
                return (timers.romansDorf1Timer < Date.now());
            case ROMANS_DORF2_ID:
                return (timers.romansDorf2Timer < Date.now());
            case BOTH_BUILD_ID:
                return (timers.buildingTimer < Date.now());
            default:
                return false;
        }

    }

    /*nextCheckTime(type){
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
*/
    static addTimeFromNow(type, time, timers){
        switch (type) {
            case ROMANS_DORF1_ID:
               timers.romansDorf1Timer =  Date.now() + time;
               break;
            case ROMANS_DORF2_ID:
                timers.romansDorf2Timer =  Date.now() + time;
                break;
            case BOTH_BUILD_ID:
                timers.buildingTimer =  Date.now() + time;
                break;
        }
    }

    /*addTimeFromNowSec(type, sec){
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
    }*/

    static addTimeFromNowMins(type, mins, timers){
        this.addTimeFromNow(type, mins * 60 * 1000, timers);
    }

    static updateTimers(currentlyBuilding, timers) {
        console.log("currBuildings", currentlyBuilding);
        if (tribe === TRIBE_ROMANS) {
            for (let buildTask of currentlyBuilding) {
                if (BuildingHelper.isResource(buildTask.building)) {
                    timers.romansDorf1Timer = buildTask.timeToBuild;
                } else {
                    timers.romansDorf2Timer = buildTask.timeToBuild;
                }
            }
        } else {
            for (let buildTask of currentlyBuilding) {
                timers.buildingTimer = buildTask.timeToBuild;
            }
        }
    }

    static updateTimerOnNewTask(currentlyBuilding, newTask, timers){
        let isBuildSlotFree = CurrentlyBuildingHelper.isBuildSlotFree(newTask.building, currentlyBuilding);
        if(isBuildSlotFree){
            this.add5Sec(newTask.timerType, timers);
        }
    }

    static add15Mins(type, timers){
        this.addTimeFromNow(type, 900000, timers);
    }

    static add5Sec(type, timers){
        this.addTimeFromNow(type, 5000, timers);
    }

    /*add5Min(type){
        this.addTimeFromNow(type, 60000*5);
    }*/
}
