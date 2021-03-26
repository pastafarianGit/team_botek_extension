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
            const farmListId = container.children[0].getAttribute('data-listid')
            const name = getName(container);
            const dropDownNode = createDropDown(SELECT_OPTIONS_FARM, onSelectedFarmListener, {villageDid: did, farmId: farmListId, name: name}, DROPDOWN_EXTRA_FARM);
            container.getElementsByClassName('listName')[0].append(dropDownNode, container.firstChild);
            console.log("drop container", container);
        }
    }
}

function getName(container) {
    const listName = container.getElementsByClassName('listName')[0];
    const span = listName.getElementsByTagName('span')[0];
    console.log("name1 ", span);
    console.log("name2 ", span.innerText);
    return span.innerText;
}

function onSelectedFarmListener(timeText, extraInfo) {
    console.log("on selected farmlist", extraInfo.farmId);
    console.log("with time", extraInfo);
    let farmListTask = {taskType: FARM_TYPE, did: extraInfo.villageDid, id: extraInfo.farmId, name: extraInfo.name, timeText: timeText};
    sendMessageToExtension(ADD_TASK_ACTION, farmListTask, (villages) => {
        console.log("is train task complete", villages);
    });
}
