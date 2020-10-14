
async function build (task) {
    let village = VillagesHelper.findVillage(villages, task.villageDid);
    await analyseAndSwitchTo(task.building, village);


    // after analyse check If task is doable
    if(!village.isEnoughResAndLvl(task.uuid, task)){
        return Promise.reject("Not enough res or lvl");
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
    let buildingCall = await callFetch(BUILD_URL + building.locationId, {});
    let c = await retrieveC(buildingCall);
    return await getTextFromPage(building.getLocationTypeURL(), "?a="+building.locationId+"&c="+c)
    // callFetch(DORF1_URL+"?a="+locationId+"&c="+c, {});
}

function addBuildingTasks(village) {
    if(village.buildTasks.length > 0){
        if(tribe === TRIBE_ROMANS){
            addRomanBuildTask(village, ROMANS_DORF1_ID);
            addRomanBuildTask(village, ROMANS_DORF2_ID);
        }else{
            if(village.timers.isNextCheckTime(BUILD_ID)){
                const resTask = BuildHelper.getNextTask(village);
                addToQueueAndUpdateTimer(resTask, village, BUILD_ID);
            }
        }
    }
}

function addRomanBuildTask (village, type) {
    console.log("add building task!!", village.timers.isNextCheckTime(type), type);
    if(village.timers.isNextCheckTime(type)){
        console.log("isNextCheckTime", type, village);
        const resTask = BuildHelper.getNextTaskWithType(village, type === ROMANS_DORF1_ID);
        addToQueueAndUpdateTimer(resTask, village, type);
    }
}
