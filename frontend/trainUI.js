function showTrainUI(){
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
    const dropDownNode = createDropDown(SELECT_OPTIONS_TRAIN, onSelectedTrain, buildingType, DROPDOWN_CSS_TRAIN, ADD_UNITS_NAME);
    trainUnitsContainer.append(dropDownNode);
}

function onSelectedTrain(buildingType, timeText) {
    const locationId = getParamFromUrl("id");
    //const time = parseInt(timeString.split[' '][0]);
    const trainUnitsContainer = document.getElementsByClassName('trainUnits')[0];
    const inputs = trainUnitsContainer.getElementsByClassName('text');
    let trainTask = {did: activeVillage.did, locationId: parseInt(locationId), timeText: timeText};
    //let availableUnits = [];
    trainTask.units = [];
    for(let input of inputs){
        const name = input.name;
        const value = parseInt(input.value);
        trainTask.units.push({name: name, value: value, todo: value});
        console.log("on train selected", input);
        console.log("on train selected", name, value);
    }

    sendMessageToExtension(ADD_TRAIN_TASK_ACTION, trainTask, (villages) => {
        console.log("is train task complete", villages);
    });
}
