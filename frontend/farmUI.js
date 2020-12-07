function showFarmUI() {
    if(pathname === BUILD_PATH_F) {
        if(window.location.search === FARM_LIST_PARAMS){
            showDropDownForFarm();
        }
    }
}

function showDropDownForFarm(){
    let villageWrappers = document.getElementsByClassName('villageWrapper');

    console.log("showing dropdown on farm");

    for(const villageWrapper of villageWrappers) {
        const did = villageWrapper.getAttribute('data-did');
        console.log("village did ", did);
        const dropContainers = villageWrapper.getElementsByClassName('dropContainer');
        for(const container of dropContainers){
            let farmListId = container.children[0].getAttribute('data-listid')
            const dropDownNode = createDropDown(SELECT_OPTIONS_FARM, onSelectedFarm, {villageDid: did, farmId: farmListId}, DROPDOWN_EXTRA_FARM);
            container.getElementsByClassName('listName')[0].append(dropDownNode, container.firstChild);
            console.log("drop container", container);
        }
    }
}

function onSelectedFarm(extraInfo, timeText) {
    console.log("on selected farmlist", extraInfo.farmId);
    console.log("with time", extraInfo);
    let farmListTask = {taskType: FARM_TYPE, did: extraInfo.villageDid, id: extraInfo.farmId, timeText: timeText};
    sendMessageToExtension(ADD_TASK_ACTION, farmListTask, (villages) => {
        console.log("is train task complete", villages);
    });
}
