function showTrainUI(){
    console.log("train pathname", pathname);
    console.log("train window location", window.location);
    if(pathname === BUILD_PATH_F) {
        showDropDownForTrainPer();
    }
}

function showDropDownForTrainPer() {
    const trainUnitsContainer = document.getElementsByClassName('trainUnits')[0];
    if(trainUnitsContainer === undefined){
        return;
    }

    const {buildingType, buildingLvl} = getBuildingTypeLevel();
    const dropDownNode = createDropDown(SELECT_OPTIONS_TRAIN, onSelectedTrain, buildingType, DROPDOWN_EXTRA_TRAIN);
    trainUnitsContainer.append(dropDownNode);
}

function onSelectedTrain(buildingType, timeText) {
    const locationId = getParamFromUrl("id");
    //const time = parseInt(timeString.split[' '][0]);
    const trainUnitsContainer = document.getElementsByClassName('trainUnits')[0];
    const inputs = trainUnitsContainer.getElementsByClassName('text');
    let trainTask = {taskType: TRAIN_TYPE, did: activeVillage.did,
        locationId: parseInt(locationId), timeText: buildingType};
    //let availableUnits = [];
    trainTask.units = [];
    for(let input of inputs){
        const type = input.name;
        const value = parseInt(input.value);
        trainTask.units.push({type: type, value: value, todo: value});
        console.log("on train selected", input);
        console.log("on train selected", type, value);
    }

    sendMessageToExtension(ADD_TASK_ACTION, trainTask, (villages) => {
        console.log("is train task complete", villages);
    });
}
