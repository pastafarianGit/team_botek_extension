async function buildResources(village) {
    let task = village.getNextTask();// TODO narest groupe taskov

    console.log("build village status", village);
    console.log("build task", task);
    console.log("build serverSettings", serverSettings);
    if(task !== null && serverSettings !== null){
        console.log("started building task", task);
        console.log("started village.buildingLvls", village.buildingsInfo);

        let building = village.buildingsInfo.get(task.locationId);
        let timeToBuild = calcTimeToBuild(village, building, serverSettings.speed);
        village.nextCheckTime = calcNextCheckTime(timeToBuild);

        console.log("village next check Time", village.nextCheckTime);

        let buildingCall = await callFetch(BUILD_URL + task.locationId, {});
        let c = await retrieveC(buildingCall);
        console.log("c",c);
        let buildStart = await callFetch(DORF1_URL+"?a="+task.locationId+"&c="+c, {});
        // TODO parse buildSTart da dobis, ce se gradi in koliko casa se gradi
        return buildStart;
    }
}

const calcTimeToBuild = (village, building, serverSpeed) => {
    let timeToBuild = buildingsData[building.gid].cost[building.lvl + 1].timeToBuild;  // + 1 to get for next lvl
    let decreaseMB = village.getMainBuildingSpeed();
    return  timeToBuild * decreaseMB / serverSpeed;
}

const retrieveC = async (buildingCall) => {
    let body = await buildingCall.text();
    let cArray = /c=(.*)\'/g.exec(body);
    if(cArray !== null && cArray.length > 1){
        return  cArray[1];
    }
    throw new Error(ERROR_BUILDING_C);
}
