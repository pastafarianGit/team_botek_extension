
async function build (task) {
    let village = VillagesHelper.findVillage(villages, task.villageDid);
    await analyseAndSwitchTo(task.building, village);


    // after analyse check If task is doable
    if(!isEnoughLvlAndResources(village, task)){
        return Promise.resolve(NOT_ENOUGH_RES_OR_LVL);
    }

    if (CurrentlyBuildingHelper.isBuildSlotFree(task.building, village.currentlyBuilding)) {
        const pageString = await simulateClickBuildingAndPressUpgrade(task.building);
        analysePageStringDorf12(pageString, village, task.building.isResourceBuilding());
        village.timers.updateTimers(village.currentlyBuilding);
        village.updateIfTaskDone(village.currentlyBuilding);
    } else {
        return Promise.reject(ERR_ALREADY_BUILDING);
    }
}

function isEnoughLvlAndResources(village, task) {
    if(village.removeTaskIfUnderLvl(task)){
        if(village.isEnoughRes(task)){
            return true;
        }else{
            let minTime = BuildTaskHelper.calcWhenFirstTaskIsAvailable(village, task.timerType);
            console.log("add time from now when next task available", minTime);
            village.timers.addTimeFromNowMins(task.timerType, minTime);
            // calc first to build from task.timertype
        }
        //return Promise.reject("Not enough res");
    }
    return false;
    // return Promise.reject(("task already more lvl"));
}



function calcTimeToBuild (village, building, serverSpeed) {
    let timeToBuild = buildingsData[building.type].cost[building.lvl + 1].timeToBuild;  // + 1 to get for next lvl
    let decreaseMB = village.getMainBuildingSpeed();
    return  timeToBuild * decreaseMB / serverSpeed;
}

async function  retrieveC (buildingCall){
    let body = await buildingCall.text();
    let cArray = /;c=(.*?)\';/g.exec(body);
    if(cArray !== null && cArray.length > 1){
        return  cArray[1];
    }
    throw new Error(ERROR_BUILDING_C);
}

async function simulateClickBuildingAndPressUpgrade (building) {
    let buildingCall = await callFetchWithBaseUrl(BUILD_PATH + building.locationId, {}, 3000);
    let c = await retrieveC(buildingCall);
    return await getTextAndCheckLogin(building.getLocationTypeURL(), "?a="+building.locationId+"&c="+c, 3000)
    // callFetch(DORF1_URL+"?a="+locationId+"&c="+c, {});
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
