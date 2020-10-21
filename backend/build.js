
async function build (task) {
    let village = VillagesHelper.findVillage(villages, task.villageDid);
    await analyseAndSwitchTo(task.building, village);


    // after analyse check If task is doable
    if(!isEnoughLvlAndResources(village, task)){
        return Promise.reject("not enough lvl or res");
    }

    if (CurrentlyBuildingHelper.isBuildSlotFree(task.building, village.currentlyBuilding)) {
        simulateClickBuildingAndPressUpgrade(task.building)
            .then(pageString => {
                analysePageStringDorf12(pageString, village, task.building.isResourceBuilding());
                village.timers.updateTimers(village.currentlyBuilding);
                village.updateIfTaskDone(village.currentlyBuilding);
            });
    } else {
        return Promise.reject(ERR_ALREADY_BUILDING)
    }
}

function isEnoughLvlAndResources(village, task) {
    if(village.removeTaskIfUnderLvl(task)){
        if(village.isEnoughRes(task)){
            return true;
        }else{
            BuildTaskHelper.calcWhenFirstTaskIsAvailable(village, task.timerType);
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
    let buildingCall = await callFetch(BUILD_URL + building.locationId, {}, 3000);
    let c = await retrieveC(buildingCall);
    return await getTextFromPage(building.getLocationTypeURL(), "?a="+building.locationId+"&c="+c, 3000)
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
    if(village.timers.isNextCheckTime(timerType)){
        console.log("isNextCheckTime", timerType, village);
        const buildTask = BuildTaskHelper.getNextTask(village, timerType);
        addToQueueAndUpdateTimer(buildTask, village, timerType);
    }
}
