let allResources = {1: true, 2: true, 3: true, 4: true};

function showBuildUI() {
    console.log("response showBuildUI ", pathname);
    if(pathname === BUILD_PATH_F){
        showUIOnExistingBuilding();
        showUIOnNewBuilding();
    }else if(pathname === DORF1_PATHNAME){
        showUIAllResources();
    }
}

function showUIAllResources() {
    const productionContainer = getProductionTableBodyContainerF();
    let isCreatedDropDown = createAllResDropDown();
    if(isCreatedDropDown) {
        createCheckboxes(productionContainer);
    }

}

function createAllResDropDown() {
    const maxLvl = getMaxResourceLvl();
    const minLvl = BuildingHelper.getMinLvlForAllResources(activeVillage);
    if(minLvl === maxLvl){
        return false;
    }
    const selectOptions = createArrayWithItemsInRange(minLvl + 1, maxLvl);
    const dropDown = createDropDown(selectOptions, allResSelectedListener, WOOD_TYPE, DROPDOWN_EXTRA_NEW);
    let production = document.getElementsByClassName('production')[0];
    production.lastElementChild.replaceWith(dropDown);
    return true;
}

function allResSelectedListener(lvl, type) {
    console.log("on all res", lvl, allResources);
    const locationId = ALL_RES_LOCATION_ID;
    const types = getSelectedTypes();
    const buildTask = {taskType: BUILD_TYPE,
        lvl: parseInt(lvl), type: types, locationId: parseInt(locationId), did: activeVillage.did};
    sendMessageToExtension(ADD_TASK_ACTION, buildTask, (villages) => {
        console.log("is task complete", villages);
    });
}

function getSelectedTypes() {
    let selected = [];
    for (const [key, value] of Object.entries(allResources)) {
        console.log(key, value);
        if(value){
            selected.push(parseInt(key));
        }
    }
    return selected;
}

function createCheckboxes(productionTable) {
    for(let tr of productionTable.children){
        const link = tr.getElementsByTagName('i')[0];
        if(link.className.startsWith('r')){
            const checkbox = createResCheckbox(link.className[1]);
            tr.insertBefore(checkbox, tr.firstChild);
        }
    }
}

function createResCheckbox(resType) {
    const td = document.createElement('td');
    let input = document.createElement("input");
    input.setAttribute('value', resType);
    input.setAttribute('type', 'checkbox');
    input.checked = true;
    input.addEventListener('change', ()=> {
       allResources[input.value] = input.checked;
    });
    td.appendChild(input);
    return td;
}

function highlightTasks() {
    if (pathname === DORF1_PATHNAME) {
        highlightResourcesTasks();
    }
    else if (pathname === DORF2_PATHNAME) {
        highlightBuildingsTasks();
        console.log("hey");
    }
}

function highlightBuildingsTasks() {
    let buildingElements = getBuildingsElements(document);
    for (let element of buildingElements){
        console.log("element,", element);
        const isOnLocation = BuildHelper.isTaskOnLocation(element.building.locationId, activeVillage.tasks.buildTasks)

        if(element.building.lvl === 0){
            highlightUnBuildTask(element.divContainer, isOnLocation);
        }else{
            const labelLayer = element.divContainer.getElementsByClassName('labelLayer')[0];
            highlightElement(labelLayer, isOnLocation);
        }

    }
}

function highlightUnBuildTask(element, isOnLocation) {
        const clickShape = element.getElementsByClassName("clickShape")[0];
        if(isOnLocation){
            clickShape.getElementsByTagName("path")[0].classList.add(HIGHLIGHT_PLACEHOLDER_CSS);
        }else{
            clickShape.getElementsByTagName("path")[0].classList.remove(HIGHLIGHT_PLACEHOLDER_CSS);
        }
        console.log("clickShape", clickShape);
        console.log("shape path child2", clickShape.getElementsByTagName("path")[0]);
}

function highlightResourcesTasks() {
    let resourceElements = getResourceElements(document);
    console.log("highlight active village", activeVillage.tasks.buildTasks);
    for (let element of resourceElements) {
        let isOnLocation = BuildHelper.isTaskOnLocation(element.building.locationId, activeVillage.tasks.buildTasks)
        highlightElement(element.divContainer.firstChild, isOnLocation);
    }
}

function highlightElement(element, isOnLocation) {
    if(element !== undefined){
        if(isOnLocation){
            element.classList.add(HIGHLIGHT_TASK_CSS);
        }else{
            element.classList.remove(HIGHLIGHT_TASK_CSS);
        }
    }
}

function highLightTasks() {
 /*    color: #ff4081;
    background: #f5bdf6; */
}

function isOnNewBuildingsPage() {
    const build = document.getElementById('build');
    return (build.classList.contains(TYPE_FREE_SLOT));
    /*const tabWrapper = document.getElementsByClassName('tabWrapper')[0];
    return (tabWrapper !== undefined);*/
}

function showUIOnNewBuilding() {
    if(!isOnNewBuildingsPage()){
        return;
    }

    const buildWrappers = document.getElementsByClassName('contractWrapper');
    for(let wrapper of buildWrappers){
        console.log("wrapper",  wrapper);
        let id = wrapper.getAttribute('id');
        const buildingType = parseInt(id.substring(CONTRACT_BUILDING.length));
        console.log("my type ", buildingType);
        const maxLvl = getMaxLvl(buildingType);
        const selectOptions = createArrayWithItemsInRange(1, maxLvl);
        const dropDownNode = createDropDown(selectOptions, onBuildDropdownSelectedListener, buildingType, DROPDOWN_EXTRA_NEW);

        const contractLink = wrapper.getElementsByClassName('contractLink')[0];
        contractLink.append(dropDownNode);
        /*const type = getTypeFromBuildingWrapper(wrapper);
        console.log("my type ", type);*/
    }
}


function getTypeFromBuildingWrapper(wrapper) {
    for(let child of wrapper.children){

        let id = child.getAttribute('id');
        if(id !== null && id.startsWith(CONTRACT_BUILDING)){
            return parseInt(id.substring(CONTRACT_BUILDING.length));
        }
    }
    return null;
}

function showUIOnExistingBuilding() {
    const {buildingType, buildingLvl} = getBuildingTypeLevel();
    const maxLvl = getMaxLvl(buildingType);
    const selectOptions = createArrayWithItemsInRange(buildingLvl+1, maxLvl);
    const dropDownNode = createDropDown(selectOptions, onBuildDropdownSelectedListener, buildingType, DROPDOWN_EXTRA_EXISTING);

    appendToSection(dropDownNode);
}

function appendToSection(dropDownNode) {
    const section1 = document.getElementsByClassName("section1")[0];
    if(section1 !== undefined){
        section1.insertBefore(dropDownNode, section1.firstChild);
        setHiddenChildToTakeSpace();
    }
}

function getMaxLvl(buildingType) {
    if (buildingType <= 4){
        return getMaxResourceLvl();
    }
    return Object.keys(buildingsData[buildingType].cost).length;

}

function setHiddenChildToTakeSpace() {
    const section2 = document.getElementsByClassName("section2")[0];
    const dropDownNode1 = createDropDown([], ()=>{}, 0, DROPDOWN_EXTRA_EXISTING);
    section2.insertBefore(dropDownNode1, section2.firstChild);
    section2.firstChild.style.visibility = 'hidden';
}


function onBuildDropdownSelectedListener(lvl, type) {
    const locationId = getParamFromUrl("id");
    const buildTask = {taskType: BUILD_TYPE, lvl: parseInt(lvl), type: parseInt(type), locationId: parseInt(locationId), did: activeVillage.did};
    modifyLocationForWall(buildTask);
    sendMessageToExtension(ADD_TASK_ACTION, buildTask, (villages) => {
        console.log("is task complete", villages);
    });
}

function modifyLocationForWall(buildTask) {
    if(WALL_IDS.includes(buildTask.type)){
        buildTask.locationId = WALL_LOCATION;
    }
}

function getParamFromUrl (name) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(name);
}

function getMaxResourceLvl() {
    let maxLvl  = MAX_RESOURCE_LVL;
    if(activeVillage.isCapital){
        maxLvl = MAX_CAPITAL_RESOURCE_LVL;
    }
    return maxLvl;
}

function getBuildingTypeLevel() {
    let buildingImg = document.getElementById("build");
    let list = buildingImg.classList;
    let type = -1;
    let lvl = 0;
    list.forEach((item) => {
        if(item.startsWith(BUILDING_GID)){
            type = item.substring(BUILDING_GID.length);
        }else if(item.startsWith(BUILDING_LEVEL)){
            lvl = item.substring(BUILDING_LEVEL.length)
        }
    });
    return {buildingType: type, buildingLvl: parseInt(lvl)};
}

function getItemLI(text) {
    let li = document.createElement('li');
    let a = document.createElement('a');
    a.appendChild(document.createTextNode(text));
    li.appendChild(a);
    return li;
}

