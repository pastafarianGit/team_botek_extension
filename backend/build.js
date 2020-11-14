function buildAndHandleErrors(task){
    let village = VillagesHelper.findVillage(villages, task.villageDid);
    updateBotStatus(BOT_IS_BUILDING_STATUS);
    build(task, village)
        .then(result => {
            console.log("update_villages_action", villages);
            sendMessageToGUI(UPDATE_VILLAGES_ACTION, villages);
            updateWorkingBotStatus();

        }).catch(err => {
            handleBuildErrors(err, task, village);
            sendMessageToGUI(UPDATE_VILLAGES_ACTION, villages);
            updateBotStatus(err);
    });
}

function handleBuildErrors(err, task, village){
    console.log("error", err);
    switch (err) {
        case ERROR_NOT_ENOUGH_RES:
            let minTime = BuildTaskHelper.calcWhenFirstTaskIsAvailable(village, task.timerType);
            village.timers.addTimeFromNowMins(task.timerType, minTime);
            console.log("add time from now when next task available", minTime);
            break;
        case ERROR_TASK_LOWER_LVL_THAN_BUILDING:
            BuildTaskHelper.deleteTask(task.uuid, village.buildTasks);
            break;
        case ERROR_TASK_DIFF_TYPE_THAN_BUILDING:
            BuildTaskHelper.deleteTask(task.uuid, village.buildTasks);
            break;
        case ERROR_NO_PREREQUISITE:
            BuildTaskHelper.deleteTask(task.uuid, village.buildTasks);
            break;
        case ERROR_WAREHOUSE_TOO_LOW:
            BuildTaskHelper.deleteTask(task.uuid, village.buildTasks);
            break;
        default:
            console.error("unhandled error: ", err);
            break;
    }
}

async function build (task, village) {
    // let village = VillagesHelper.findVillage(villages, task.villageDid);
    await analyseAndSwitchTo(task.building, village);

    let taskStatus = isTaskAvailable(task, village);
    if(taskStatus !== TASK_OK){
        return taskStatus;
    }
    console.log("task status", taskStatus);


    if (CurrentlyBuildingHelper.isBuildSlotFree(task.building, village.currentlyBuilding)) {
        return tryBuildingAndAnalyse(task, village);
    }
    return Promise.reject(ERROR_ALREADY_BUILDING);
}

async function tryBuildingAndAnalyse(task, village) {
    const pageString = await simulateClickBuildingAndPressUpgrade(task.building, village);
    analysePageStringDorf12(pageString, village, task.building.isResourceBuilding());
    village.timers.updateTimers(village.currentlyBuilding);
    CurrentlyBuildingHelper.updateIfTaskDone(village);
}

function isTaskAvailable(task, village) {
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

function isNotEnoughWarehouseLvl (task, village) {
    const cost = getBuildingCost(task, village);
    return !isTaskCostSmallerThanWarehouse(cost, village.resources.maxStorage);
}

function isTaskCostSmallerThanWarehouse(cost, warehouse) {
    const c1 = cost.wood < warehouse.l1;
    const c2 = cost.clay < warehouse.l2;
    const c3 = cost.iron < warehouse.l3;
    const c4 = cost.crop < warehouse.l4;

    return (c1 && c2 && c3 && c4);
}

function addNewBuildTask(data) {
    for(let village of villages){
        if(village.did === data.villageDid){
            let building = new Building(data.locationId, data.type, data.lvl);
            let newBuildTask = new BuildTask(building, data.villageDid, getUuidv4(), (village.buildTasks[0].length > 0));
            BuildTaskHelper.addTask(newBuildTask, village.buildTasks);
            village.timers.updateTimerOnNewTask(village.currentlyBuilding, newBuildTask);
        }
    }
}

function calcTimeToBuild (village, building, serverSpeed) {
    let timeToBuild = buildingsData[building.type].cost[building.lvl + 1].timeToBuild;  // + 1 to get for next lvl
    let decreaseMB = village.getMainBuildingSpeed();
    return  timeToBuild * decreaseMB / serverSpeed;
}

async function  retrieveC (pageText){
    // let body = await buildingCall.text();
    let cArray = /;c=(.*?)\';/g.exec(pageText);
    if(cArray !== null && cArray.length > 1){
        return  cArray[1];
    }
    throw new Error(ERROR_BUILDING_C);
}

async function simulateClickBuildingAndPressUpgrade (taskBuilding, village) {
    const liveBuilding = village.buildingsInfo.get(taskBuilding.locationId);

    let buildingPhpPageString = await getTextAndCheckLogin(BUILD_PATH + taskBuilding.locationId, "", 3000);

    if(liveBuilding.lvl === 0 && !taskBuilding.isResourceBuilding()){ // create new building
        return await createNewBuilding(taskBuilding, buildingPhpPageString);
    }else{
        return await upgradeBuilding(taskBuilding, buildingPhpPageString);
    }
}

async function upgradeBuilding(taskBuilding, pageString) {
    let c = await retrieveC(pageString);
    return await getTextAndCheckLogin(taskBuilding.getLocationTypeURL(), "?a="+taskBuilding.locationId+"&c="+c, 3000)
}



async function createNewBuilding(taskBuilding, pageString) {
    const storedBuilding = buildingsData[taskBuilding.type];
    let changeTab = await getTextAndCheckLogin(BUILD_PATH + taskBuilding.locationId  , CATEGORY_PARAM + storedBuilding.category, 3000);


    let button = parseGetNewBuildingButton(changeTab, taskBuilding.type);
    console.log("button is", button);
    if(button === undefined){
        return Promise.reject(ERROR_NO_PREREQUISITE);
    }
    let cssClass = button.getAttribute('class');
    if(cssClass.includes('new')){
        let onClick = button.getAttribute('onclick')
        const buildPath = regexSearchOne(REGEX_BUILD_PATH_ON_NEW_BUILDING, onClick, 'g');
        console.log("buildPath", buildPath);
        return await getTextAndCheckLogin(buildPath, "", 3000);
    }else if(cssClass.includes('builder')){
        console.log("can only build with GOLD builder");
    }
    return Promise.reject("can't build new building type: " + taskBuilding.type);
}


function addBuildingTasks(village) {
    if(village.buildTasks.length > 0){
        if(tribe === TRIBE_ROMANS){
            addBuildTaskToQueue(village, ROMANS_DORF1_ID);
            addBuildTaskToQueue(village, ROMANS_DORF2_ID);
        }else{
            addBuildTaskToQueue(village, BOTH_BUILD_ID);
        }
    }
}

function addBuildTaskToQueue (village, timerType) {
    console.log("next check time is: ", village.timers.nextCheckTime(timerType), "type: ", timerType);
    if(village.timers.isNextCheckTime(timerType)){
        const buildTask = BuildTaskHelper.getNextTask(village, timerType);
        addToQueueAndUpdateTimer(buildTask, village, timerType);
    }
}
