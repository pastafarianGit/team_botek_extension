class BuildHelper {

    static createTask(building, did, uuid, isChecked){
        let task = {taskType: BUILD_TYPE};
        task.building = building;
        task.did = did;
        task.uuid = uuid;
        task.timerType = BuildHelper.getTimerType(task);
        task.isChecked = isChecked;
        return task;
    }

    static addTask(task, tasks){
        for (let i=tasks.length - 1; i >= 0 ;i--){
            if(Array.isArray(tasks[i])){
                tasks[i].push(task);
                return true;
            }
        }
        return false;
    }

    static getTimerType(task){
        if(tribe === TRIBE_ROMANS){
            if(BuildingHelper.isResource(task.building)){
                return  ROMANS_DORF1_ID;
            }else{
                return  ROMANS_DORF2_ID;
            }
        }else{
            return BOTH_BUILD_ID;
        }
    }

    static deleteTask(uuid, tasks){
        for(let i = 0; i < tasks.length; i++) {
            for (let j = 0; j < tasks[i].length; j++){
                if(tasks[i][j].uuid === uuid){
                    tasks[i].splice(j, 1);      //remove task
                    BuildHelper.fixArrayAfterTaskDelete(tasks, i);
                    sendMessageToGUI(UPDATE_VILLAGES_ACTION, villages);
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
            BuildHelper.deleteTask(task.uuid, village.buildTasks);
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
        const expandedCurrentGroup = BuildHelper.expandAllResTasks(currentGroup, village);
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
        if(BuildHelper.isExpandedTaskDone(expandedTasks)){
            BuildHelper.deleteTask(task.uuid, village.buildTasks);
        }
    }

    static expandAllResTasks(tasks, village){
        let combinedTasks = [];
        for(let task of tasks){
            if(Array.isArray(task.building.type)){
                let expandedTasks = BuildHelper.expandAllResourcesTask(task, village.buildingsInfo);
                BuildHelper.deleteAllResourceTaskIfDone(expandedTasks, task, village);
                combinedTasks = [...combinedTasks, ...expandedTasks];
            }else{
                combinedTasks.push(task);
            }
        }
        return combinedTasks;
    }

    static deleteTaskIfDone(task, village){
        if(Array.isArray(task.building.type)){
            let expandedTasks = BuildHelper.expandAllResourcesTask(task, village.buildingsInfo);
            if(!BuildHelper.isExpandedTaskDone(expandedTasks)){
                return;
            }
        }
        BuildHelper.deleteTask(task.uuid, village.buildTasks);
    }

    static isExpandedTaskDone(expandedTasks) {
        return (expandedTasks.length === 0);
    }

    static newExpandTask(task, building){
        const newBuilding = BuildingHelper.createBuilding(building.locationId, building.type, task.building.lvl);
        let createdTask = BuildHelper.createTask(newBuilding, task.did, task.uuid, true);

        createdTask.sortLvl = building.lvl;
        return createdTask;
    }

    static expandAllResourcesTask(task, buildingsInfo){
        let newTasks = [];
        const taskBuilding = task.building;

        for(const [key, building] of buildingsInfo.entries()){
            if(taskBuilding.type.includes(building.type)){
                if(taskBuilding.lvl > building.lvl){
                    const createdTask = BuildHelper.newExpandTask(task, building);
                    newTasks.push(createdTask);
                }
            }
        }
        newTasks.sort((a, b) => (a.sortLvl > b.sortLvl) ? 1: -1);
        console.log("expanded tasks", newTasks);
        return newTasks;
    }
/*
    static deserializationToBuildTaskObject(data){
        let buildTasks = [];
        for(let task of data){
            if(Array.isArray(task)){
                buildTasks.push(this.deserializationToBuildTaskObject(task));
            }else{
                let createdTask = BuildHelper.createTask(new Building(task.building.locationId, task.building.type, task.building.lvl), task.did, task.uuid, task.isChecked);
                buildTasks.push(createdTask);
            }
        }
        return buildTasks;
    }*/

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
        if(BuildHelper.isTaskUnderLvl(task, village)){
            return Promise.reject(ERROR_TASK_LOWER_LVL_THAN_BUILDING);
        }
        else if (BuildHelper.isTaskDifferentType(task, village)){
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

    static setNewTimeToBuild(task, secToBuild){
        task.timeToBuild = Date.now() + secToBuild * 1000;
    }

}

/*class BuildTask {
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
}*/

