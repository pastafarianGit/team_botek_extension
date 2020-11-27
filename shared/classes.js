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

class TrainTaskHelper {

    static getTimeInMiliSec(trainTask){
        let split = trainTask.timeText.split(" ");
        let time = parseInt(split[0]);
        const unit = split[1];
        if(unit === HOUR){
            time *= 60;
        }
        return time * 60 * 1000;
    }

    static initTimers(trainTask){
        trainTask.timer = TrainTaskHelper.getTimeInMiliSec(trainTask);
        trainTask.timerUpdate = Date.now() + trainTask.timer;
    }

    static isTaskOverdo(task) {
        return (task.timerUpdate < Date.now());
    }

    static resetTask(task){
        task.timerUpdate = Date.now() + task.timer;
        for(const unit of task.units){
            unit.todo = unit.value;
        }
    }

    static isThereUnitToTrain(task){
        for(let unit of task.units){
            if(unit.todo > 0){
                return true
            }
        }
        return  false;
    }

    static subtractDoneUnits(task){ // TODO subtract number and not all
        for(const unit of task.units){
            unit.todo = 0;
        }
    }

    static isTaskAvailable(task, village) {
        if(!TrainTaskHelper.isThereUnitToTrain(task)){
            return Promise.reject(ERROR_NO_UNITS_TO_TRAIN);
        }
        return TASK_OK;
    }


    static isTimerAfterAwhile(task) {
        const halfWayPoint  = task.timerUpdate - (task.timer / 2);
        return (Date.now() > halfWayPoint);
    }

    static deserializationToTrainTaskObject(trainTasks) {
        console.log("qwe trainTasks", trainTasks);
        let convertTrainTasks = [];
        for(const _task of trainTasks){
            Object.setPrototypeOf( _task.building, Building.prototype)
            let task = Object.setPrototypeOf(_task, TrainTask.prototype);
            convertTrainTasks.push(task);

            /*let building = Object.assign(new Building(), task.building);
            console.log("building", building);
            let task = Object.assign(new TrainTask(), task);
            console.log("task", task);*/
        }
        return convertTrainTasks;
    }
}


class Building {

    name;
    constructor(locationId, type, lvl) {
        this.locationId = locationId;
        //this.type = parseInt(type);
        this.setType(type);
        this.setLvl(lvl);
        this.setName();
    }

    setType(type){
        if(Array.isArray(type)){
            this.type = type;
        }else{
            this.type = parseInt(type);
        }
    }

    setLvl(lvl){
        if (isNaN(lvl)){
            this.lvl = 0;
        }else{
            this.lvl = lvl;
        }
    }

    setName(){
        if(Array.isArray(this.type)){
            this.name = this.getNamesFromTypes(this.type);
        }else if(this.type !== 0){
            this.name = buildingsData[this.type].name;
        }else{
            this.name = "Empty";
        }
    }

    getNamesFromTypes(types){
        let name = "";
        for(let type of types){
           name += TYPES_NAMES[type] + ", "
        }
        name = name.slice(0, -2);
        return name;
    }

    isResourceBuilding() {
        return (this.locationId <= RES_MAX_LOCATION || this.locationId === ALL_RES_LOCATION_ID);
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

    static getNextTaskGroup(village, timerType){
        const tasks = village.buildTasks;
        if(timerType === BOTH_BUILD_ID){
            return tasks[0];
        }

        let currentGroup = [];
        for(let task of tasks[0]){
            if(task.timerType === timerType){
                currentGroup.push(task);
            }
        }
        const expandedCurrentGroup = BuildTaskHelper.expandAllResTasks(currentGroup, village);
        return expandedCurrentGroup;
    }

    static getNextTask(village, timerType){
        const currentGroup = this.getNextTaskGroup(village, timerType);
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

    static deleteAllResourceTaskIfDone(expandedTasks, task, village){
        if(BuildTaskHelper.isExpandedTaskDone(expandedTasks)){
            BuildTaskHelper.deleteTask(task.uuid, village.buildTasks);
        }
    }

    static expandAllResTasks(tasks, village){
        let combinedTasks = [];
        for(let task of tasks){
            if(Array.isArray(task.building.type)){
                let expandedTasks = BuildTaskHelper.expandAllResourcesTask(task, village.buildingsInfo);
                BuildTaskHelper.deleteAllResourceTaskIfDone(expandedTasks, task, village);
                combinedTasks = [...combinedTasks, ...expandedTasks];
            }else{
                combinedTasks.push(task);
            }
        }
        return combinedTasks;
    }

    static deleteTaskIfDone(task, village){
        if(Array.isArray(task.building.type)){
            let expandedTasks = BuildTaskHelper.expandAllResourcesTask(task, village.buildingsInfo);
            if(!BuildTaskHelper.isExpandedTaskDone(expandedTasks)){
                return;
            }
        }
        BuildTaskHelper.deleteTask(task.uuid, village.buildTasks);
    }

    static isExpandedTaskDone(expandedTasks) {
        return (expandedTasks.length === 0);
    }

    static newExpandTask(task, building){
        const newBuilding = new Building(building.locationId, building.type, task.building.lvl);
        let createdTask = new BuildTask(newBuilding, task.did, task.uuid, true);
        createdTask.sortLvl = building.lvl;
        return createdTask;
    }

    static expandAllResourcesTask(task, buildingsInfo){
        let newTasks = [];
        const taskBuilding = task.building;

        for(const [key, building] of buildingsInfo.entries()){
            if(taskBuilding.type.includes(building.type)){
                if(taskBuilding.lvl > building.lvl){
                    const createdTask = BuildTaskHelper.newExpandTask(task, building);
                    newTasks.push(createdTask);
                }
            }
        }
        newTasks.sort((a, b) => (a.sortLvl > b.sortLvl) ? 1: -1);
        console.log("expanded tasks", newTasks);
        return newTasks;
    }

    static deserializationToBuildTaskObject(data){
        let buildTasks = [];
        for(let task of data){
            if(Array.isArray(task)){
                buildTasks.push(this.deserializationToBuildTaskObject(task));
            }else{
                buildTasks.push(new BuildTask(new Building(task.building.locationId, task.building.type, task.building.lvl), task.did, task.uuid, task.isChecked));
            }
        }
        return buildTasks;
    }

    static calcWhenFirstTaskIsAvailable(village, timerType) {
        const availableTasks  = this.getNextTaskGroup(village, timerType);
        let times = [];
        for(let task of availableTasks){
            let taskTime = village.calcTimeTillTaskCanBeBuilt(task);
            times.push(taskTime);
        }
        let minTime = Math.min(... times);
        if(minTime > 60){  //
            minTime = minTime/2;
        }else if(minTime > 15){ //cap at 15min maybe you get res from market or farming
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

    static addLvlForCurrentlyBuilding(village) {
        for(const current of village.currentlyBuilding){
               let building = village.buildingsInfo.get(current.building.locationId);
               if(building){
                   building.lvl = current.building.lvl;
               }
        }
    }

    static isTaskAvailable(task, village) {
        if(BuildTaskHelper.isTaskUnderLvl(task, village)){
            return Promise.reject(ERROR_TASK_LOWER_LVL_THAN_BUILDING);
        }
        else if (BuildTaskHelper.isTaskDifferentType(task, village)){
            return Promise.reject(ERROR_TASK_DIFF_TYPE_THAN_BUILDING);
        }
        else if(isNotEnoughWarehouseLvl(task, village)){
            return Promise.reject(ERROR_WAREHOUSE_TOO_LOW);
        }
        else if(!village.isEnoughRes(task)){
            return Promise.reject(ERROR_NOT_ENOUGH_RES);
        }
        return TASK_OK;
    }
}
class AnalyseTask {
    constructor() {
    }
}

class BuildTask {
    timeToBuild;
    timerType;
    uuid;
    isChecked;
    sortLvl;

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

    addNames() {
        const unitsData = this.getTribeUnitData();
        for(let unit of this.units){
            const index = this.getUnitId(unit);
            unit.typeNum = index;
            unit.name = unitsData[index].name;
        }
    }

    getUnitId(unit){
        return parseInt(unit.type.substring(1));
    }

    getTribeUnitData(){
        switch(tribe){
            case (TRIBE_ROMANS):
                return romanTroops;
            case (TRIBE_GAULS):
                return gaulTroops;
            case (TRIBE_TEUTONS):
                return teutonTroops;
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
