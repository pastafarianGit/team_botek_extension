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
    const dropDownNode = createDropDown(SELECT_OPTIONS_TRAIN, onSelectedTrain, buildingType, '-train', ADD_UNITS_NAME);
    trainUnitsContainer.append(dropDownNode);
}

function onSelectedTrain(buildingType) {
    const locationId = getParamFromUrl("id");

    const trainUnitsContainer = document.getElementsByClassName('trainUnits')[0];
    const inputs = trainUnitsContainer.getElementsByClassName('text');
    let trainTask = {villageDid: activeVillage.did, locationId: parseInt(locationId), buildingType: parseInt(buildingType)};
    //let availableUnits = [];
    for(let input of inputs){
        const name = input.name;
        const value = input.value;
        trainTask[name] = value;
        console.log("on train selected", input);
        console.log("on train selected", name, value);
    }

    sendMessageToExtension(ADD_TRAIN_TASK_ACTION, trainTask, (villages) => {
        console.log("is train task complete", villages);
    });
}
