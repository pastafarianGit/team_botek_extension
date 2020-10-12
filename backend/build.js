
async function build (task) {
    let village = villagesHelper.findVillage(task.villageDid);
    await analyseAndSwitchTo(task.building, village);


    // after analyse check If task is doable
    if(!village.isEnoughResAndLvl(task.uuid, task)){
        return Promise.reject("Not enough res or lvl");
    }

    if (village.currBuilding.isBuildSlotFree(task.building)) {
        simulateClickBuildingAndPressUpgrade(task.building)
            .then(pageString => {
                analysePageStringDorf12(pageString, village, task.building.isResourceBuilding());
                village.timers.updateTimers(village.currBuilding.tasks);
                village.updateIfTaskDone(village.currBuilding.tasks);
            });
    } else {
        //let time = village.currBuilding.getFinishBuildingTime(task.building.isResourceBuilding());
        //village.timers.addTimeFromNow(task.timerType, time);
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
