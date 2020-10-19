let Village = class {
    did;
    x;
    y;
    isCapital;
    name;
    // nextCheckTime;
    resources;
    buildingsInfo = new Map();
    currentlyBuilding;
    timers;


    constructor(did) {
        this.did  = did;
        this.timers = new Timers();
    }

    addParams(x, y, isCapital, name) {
        this.x  = x;
        this.y  = y;
        this.isCapital  = isCapital;
        this.name  = name;
        // this.nextCheckTime = Date.now() + 1000;
        this.buildingsInfo = new Map();
        this.buildTasks = [[]];
    }

    /*isNextCheckTime() {
        console.log("time diff: " ,  this.nextCheckTime - Date.now());
        return (this.nextCheckTime < Date.now());
    }*/


    updateBuildingInfo(updatedBuildings){
        this.buildingsInfo = new Map([...this.buildingsInfo, ...updatedBuildings]);
    }

    updateIfTaskDone(){
        console.log("update if done", this.currentlyBuilding);
        for (let currBuilding of this.currentlyBuilding){
            console.log("task ", currBuilding);
            BuildTaskHelper.currentlyBuildingTaskComplete(this.buildTasks, currBuilding.building);
        }
    }

    /*isEnoughResAndLvl(key, task){
        const building = this.buildingsInfo.get(task.building.locationId);
        if(building.lvl < task.building.lvl){
            console.log("check task cost ", building);

            let cost = buildingsData[building.type].cost[building.lvl + 1];
            if(this.checkCostVsStorage(cost)){
                return true;
            }
        }else{
            BuildTaskHelper.deleteTask(this.buildTasks, task.uuid); // remove task from array
        }
        return false;
    }*/

    removeTaskIfUnderLvl(building, task){
        if(building.lvl < task.building.lvl){
            return true;
        }
        BuildTaskHelper.deleteTask(this.buildTasks, task.uuid); // remove task from array
        return false;
    }

    isEnoughRes(task){
        console.log("is enough res" , task);
        const building = this.buildingsInfo.get(task.building.locationId);
        let cost = buildingsData[building.type].cost[building.lvl + 1];
        return this.checkCostVsStorage(cost);
    }

    calcTimeTillTaskCanBeBuilt(task){
        const building = this.buildingsInfo.get(task.building.locationId);
        let cost = buildingsData[building.type].cost[building.lvl + 1];
        const woodNeeded = cost.wood - this.resources.storage.l1;
        const clayNeeded= cost.clay - this.resources.storage.l2;
        const ironNeeded = cost.iron - this.resources.storage.l3;
        const cropNeeded = cost.crop - this.resources.storage.l4;

        const woodHoursNeeded = woodNeeded / this.resources.production.l1;
        // TODO calc time when we can build this.
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
        this.type = type;
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
        return DORF2_URL;
    }
}

class BuildTaskHelper {

    static addTask(task, tasks){
        // let lastArray = [];
        for (let i=tasks.length; i > 0 ;i--){
            if(Array.isArray(tasks[i])){
                tasks[i].push(task);
                return true;
            }
        }
        return false;
    }

    static deleteTask(uuid, tasks){
        for(let i = 0; i < tasks.length; i++) {
            if(Array.isArray(tasks[i])){
                if(this.deleteTask(tasks[i])){
                    return true;
                }
            }else{
                if(tasks[i].uuid === uuid){
                    tasks.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    static currentlyBuildingTaskComplete(buildTasks, currentTask) {
        for (let taskB of buildTasks) {
            if (Array.isArray(taskB)) {
                if (this.currentlyBuildingTaskComplete(taskB, currentTask)) {
                    return true;
                }
            } else {
                if (taskB.building.locationId === currentTask.locationId) {
                    if (taskB.building.lvl <= currentTask.lvl) {
                        BuildTaskHelper.deleteTask(taskB.uuid, buildTasks);
                        return true;
                    }
                    return false;
                }
            }
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
        console.log("current tasks for group", currentGroupTasks, timerType);
        return currentGroupTasks;
    }

    /*static getNextTaskWithType(village, timerType){
        console.log("available tasks", this.getNextTaskGroup(village.buildTasks));
        for (const task of this.getNextTaskGroup(village.buildTasks)) {
            if(task.building.isResourceBuilding() === isRes){
                if(village.isEnoughRes(task)){
                    return task;
                }
            }
        }
        return null;
    }*/

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
                buildTasks.push(new BuildTask(new Building(task.building.locationId, task.building.type, task.building.lvl), task.villageDid, task.uuid, task.isChecked));
            }
        }
        return buildTasks;
    }

    static calcWhenFirstTaskIsAvailable(village, timerType) {
        const availableTasks  = this.getNextTaskGroup(village.buildTasks, timerType);
        let minTime;
        for(let task of availableTasks){
            village.calcWhenCanBuildTask(task);
            const building = village.buildingsInfo.get(task.building.locationId);
            //if(task.building.locationId)
        }
    }
}

/*
*
*         const building = this.buildingsInfo.get(task.building.locationId);
        let cost = buildingsData[building.type].cost[building.lvl + 1];
* */
/*
class BuildHelper1 {

    constructor(tasks) {
        this.tasks = tasks;
    }

    deleteTask(uuid) {
        return this.deleteTaskIn(uuid, this.tasks);
    }

    deleteTaskIn(uuid, tasks){
        for(let i = 0; i < this.tasks.length; i++) {
            if(Array.isArray(tasks[i])){
                if(this.deleteTaskIn(tasks[i])){
                    return true;
                }
            }else{
                if(this.tasks[i].uuid === uuid){
                    this.tasks.splice(i, 1);
                    return true;
                }
            }
        }
        return false;

    }

    addTask(task){
        this.tasks.push(task);
    }

    isNextBuildTask() {
        return (this.tasks.length > 0);
    }

    getNextTaskGroup(){
        let currToDoTasks = [];
        if(this.tasks.length > 0){
            if(Array.isArray(this.tasks[0])){
                return this.tasks[0];
            }

            for (let task of this.tasks){
                if(Array.isArray(task)){
                    currToDoTasks.push(task);
                }else{
                    return currToDoTasks;
                }
            }
        }

    }

    getNextTaskWithType(village, isRes){
        console.log("available tasks", this.getNextTaskGroup());
        for (const task of this.getNextTaskGroup()) {
            if(task.building.isResourceBuilding() === isRes){
                if(village.isEnoughRes(task)){
                    return task;
                }
            }
        }
        return null;
    }

    getNextTask(village){
        for (const task of this.getNextTaskGroup()) {
            if(village.isEnoughRes(task)){
                return task;
            }
        }
        return null;
    }
}*/

class BuildTask {
    timeToBuild;
    timerType;
    uuid;
    isChecked;

    constructor(building, villageDid, uuid, isChecked) {
        this.building = building;
        this.villageDid = villageDid;
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

    static getFinishBuildingTime(isRes, tasks){
        if(isRes){
            for (let task of tasks){
                if(task.building.isResourceBuilding() === isRes){
                    return task.timeToBuild;
                }
            }
        }
        return -1;
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
