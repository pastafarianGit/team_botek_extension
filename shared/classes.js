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
        this.currentlyBuilding = [];
        this.isCapital = false;
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


class Building {

    name;
    constructor(locationId, type, lvl) {
        this.locationId = locationId;
        this.type = parseInt(type);
        this.setLvl(lvl);
        this.setName();
    }

    setLvl(lvl){
        if (isNaN(lvl)){
            this.lvl = 0;
        }else{
            this.lvl = lvl;
        }
    }

    setName(){
        if(this.type !== 0){
            this.name = buildingsData[this.type].name;
        }else{
            this.name = "Empty";
        }
    }

    isResourceBuilding() {
        return (this.locationId <= RES_MAX_LOCATION);
    }

    getLocationTypeURL(){
        if(this.locationId <= RES_MAX_LOCATION){
            return DORF1_PATHNAME;
        }
        return DORF2_PATHNAME;
    }
}

class BuildTaskHelper {

    static addTask(task, tasks){
        for (let i=tasks.length - 1; i >= 0 ;i--){
            if(Array.isArray(tasks[i])){
                tasks[i].push(task);
                return true;
            }
        }
        return false;
    }

    static deleteTask(uuid, tasks){
        for(let i = 0; i < tasks.length; i++) {
            for (let j = 0; j < tasks[i].length; j++){
                if(tasks[i][j].uuid === uuid){
                    tasks[i].splice(j, 1);      //remove task
                    BuildTaskHelper.fixArrayAfterTaskDelete(tasks, i);
                    return true;
                }
            }
        }
        return false;
    }

    static fixArrayAfterTaskDelete(tasks, i){
        if(tasks[i].length === 0 && tasks.length > 1){ // remove empty array if there is more than one internal array
            tasks.splice(i, 1);
        }else if(tasks[i].length > 0){
            tasks[i][0].isChecked = false; // remove check for first in line
        }
    }

    static isTaskUnderLvl(task, village){
        const building = village.buildingsInfo.get(task.building.locationId);

        if(task.building.lvl > building.lvl){
            return false;
        }
        return true;
    }

    static isTaskDifferentType(task, village){
        const building = village.buildingsInfo.get(task.building.locationId);
        if(building.type === 0){ //building on empty space
            return false;
        }

        if(building.type !== task.building.type){ // wrong task type for building spot
            BuildTaskHelper.deleteTask(task.uuid, village.buildTasks);
            return true;
        }

        return false;
    }

    static getNextTaskGroup(tasks, timerType){
        if(timerType === BOTH_BUILD_ID){
            return tasks[0];
        }

        let currentGroupTasks = [];
        for(let task of tasks[0]){
            if(task.timerType === timerType){
                currentGroupTasks.push(task);
            }
        }
        return currentGroupTasks;
    }

    static getNextTask(village, timerType){
        const currentGroup = this.getNextTaskGroup(village.buildTasks, timerType);
        for (const task of currentGroup) {
            if(village.isEnoughRes(task)){
                return task;
            }
        }
        if(currentGroup.length > 0){
            return currentGroup[0];
        }
        return null;
    }

    static convertToBuildTaskObject(data){
        let buildTasks = [];
        for(let task of data){
            if(Array.isArray(task)){
                buildTasks.push(this.convertToBuildTaskObject(task));
            }else{
                buildTasks.push(new BuildTask(new Building(task.building.locationId, task.building.type, task.building.lvl), task.did, task.uuid, task.isChecked));
            }
        }
        return buildTasks;
    }

    static calcWhenFirstTaskIsAvailable(village, timerType) {
        const availableTasks  = this.getNextTaskGroup(village.buildTasks, timerType);
        let times = [];
        for(let task of availableTasks){
            let taskTime = village.calcTimeTillTaskCanBeBuilt(task);
            times.push(taskTime);
        }
        let minTime = Math.min(... times);
        if(minTime > 15){  // cap at 15min maybe you get res from market or farming
            minTime = 15;
        }
        return minTime;
    }

    static isTaskOnLocation(locationId, tasks){
        for (let groupOfTask of tasks){
            for(let task of groupOfTask){
                if(task.building.locationId === locationId){
                    return true;
                }
            }
        }
        return false;
    }
}

class BuildTask {
    timeToBuild;
    timerType;
    uuid;
    isChecked;

    constructor(building, did, uuid, isChecked) {
        this.building = building;
        this.did = did;
        this.uuid = uuid;
        this.setTimerType();
        this.isChecked = isChecked;
    }

    setNewTimeToBuild(secToBuild){
        this.timeToBuild = Date.now() + secToBuild * 1000;
    }

    setTimerType(){
        if(tribe === TRIBE_ROMANS){
            if(this.building.isResourceBuilding()){
                this.timerType = ROMANS_DORF1_ID;
            }else{
                this.timerType = ROMANS_DORF2_ID;
            }
        }else{
            this.timerType = BOTH_BUILD_ID;
        }
    }
}


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
                        BuildTaskHelper.deleteTask(task.uuid, buildTasks);
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
        if(building.isResourceBuilding()){
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
            if(task.building.isResourceBuilding() === isRes){
                return true; // building already in progress
            }
        }
        return false;
    }

    /*static getFinishBuildingTime(isRes, tasks){
        if(isRes){
            for (let task of tasks){
                if(task.building.isResourceBuilding() === isRes){
                    return task.timeToBuild;
                }
            }
        }
        return -1;
    }*/
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
                if (buildTask.building.isResourceBuilding()) {
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
