
async function build (task) {
    let village = VillagesHelper.findVillage(villages, task.villageDid);
    await analyseAndSwitchTo(task.building, village);

    let isUnavailable = isTaskUnavailable(task, village);
    if(isUnavailable){
        return isUnavailable;
    }

    if (CurrentlyBuildingHelper.isBuildSlotFree(task.building, village.currentlyBuilding)) {
        return tryBuildingAndAnalyse(task, village);
    }
    return Promise.reject(ERR_ALREADY_BUILDING);
}

async function tryBuildingAndAnalyse(task, village) {
    const pageString = await simulateClickBuildingAndPressUpgrade(task.building, village);
    analysePageStringDorf12(pageString, village, task.building.isResourceBuilding());
    village.timers.updateTimers(village.currentlyBuilding);
    CurrentlyBuildingHelper.updateIfTaskDone(village);
}

function isTaskUnavailable(task, village) {
    if(BuildTaskHelper.isTaskUnderLvl(task, village)
       || BuildTaskHelper.isTaskDifferentType(task, village)){
        BuildTaskHelper.deleteTask(task.uuid, village.buildTasks); // remove task from array
        return BUILDING_DIFF_TASK_LVL_OR_LVL_TOO_LOW;
    }

    if(village.isEnoughRes(task)){
        return false;
    }

    let minTime = BuildTaskHelper.calcWhenFirstTaskIsAvailable(village, task.timerType);
    console.log("add time from now when next task available", minTime);
    village.timers.addTimeFromNowMins(task.timerType, minTime);
    return  NOT_ENOUGH_RES;

}
/*
function isEnoughLvlAndResources(village, task) {
    if(BuildTaskHelper.isTaskUnderLvlThenRemove(task, village)) {
        return false;
    }

    if(village.isEnoughRes(task)){
        return true;
    }else{
        let minTime = BuildTaskHelper.calcWhenFirstTaskIsAvailable(village, task.timerType);
        console.log("add time from now when next task available", minTime);
        village.timers.addTimeFromNowMins(task.timerType, minTime);
    }
    return false;
}*/



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

    if(liveBuilding.lvl === 0){ // create new building
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
        // can't build this yet lacks prereq
        console.log("can't do it lacks preq")

        return Promise.reject(ERROR_NO_PREREQUISITE);
    }
    let cssClass = button.getAttribute('class');
    if(cssClass.includes('new')){
        let onClick = button.getAttribute('onclick')
        const buildPath = regexSearchOne(REGEX_BUILD_PATH_ON_NEW_BUILDING, onClick, 'g');
        console.log("buildPath", buildPath);
        return await getTextAndCheckLogin(buildPath, "", 3000);
    }else if(cssClass.includes('builder')){
        // can only build with
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
