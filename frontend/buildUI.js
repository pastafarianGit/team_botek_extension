let dropDown = '    <div id="" class="bootstrap">\n' +
    '        <div class="col-lg-12">\n' +
    '<div id="btn-container">\n'+
    '            <button id="build-btn" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>\n' +
    '            <ul id="" class="dropdown-menu scrollable-menu" role="menu">\n' +
    '            </ul>\n' +
        '      </div>\n' +
    '      </div>\n' +
    '</div>\n' +
    '</div>\n';

function showBuildUI() {
    const pathname = window.location.pathname;
    if(pathname === BUILD_PATH_F){
        showDropDownOnOldBuilding();
        showDropDownForNewBuilding();
    }
}
function showDropDownForNewBuilding() {
    const buildWrappers = document.getElementsByClassName('contractWrapper');
    for(let wrapper of buildWrappers){
        console.log("wrapper",  wrapper);
        let id = wrapper.getAttribute('id');
        const buildingType = parseInt(id.substring(CONTRACT_BUILDING.length));
        console.log("my type ", buildingType);
        const maxLvl = getMaxLvl(buildingType);
        const dropDownNode = createDropDown(1, maxLvl, onBuildDropdownSelected, buildingType, '-new');

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

function showDropDownOnOldBuilding() {
    const {buildingType, buildingLvl} = getBuildingTypeLevel();
    const maxLvl = getMaxLvl(buildingType);
    const dropDownNode = createDropDown(buildingLvl+1, maxLvl, onBuildDropdownSelected, buildingType, '-old');

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
    const dropDownNode1 = createDropDown(0, 0, onBuildDropdownSelected, 0, '-old');
    section2.insertBefore(dropDownNode1, section2.firstChild);
    section2.firstChild.style.visibility = 'hidden';
}


function onBuildDropdownSelected(lvl, type) {
    const locationId = getParamFromUrl("id");
    const buildTask = {lvl: parseInt(lvl), type: type, locationId: parseInt(locationId), villageDid: activeVillage.did};

    sendMessageToExtension(ADD_BUILD_TASK_ACTION, buildTask, (task) => {
        console.log("is task complete", task);
    });
}

function getParamFromUrl (name) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(name);
}

function createDropDown(minLvl, maxLvl, onSelectedFun, buildingType, newOld) {
    let dropDownNode = toHtmlGetBodyFirstChild(dropDown);
    dropDownNode.id = 'build-container'+ newOld;
    let btnNode = dropDownNode.getElementsByTagName("button")[0];
    let ulNode = dropDownNode.getElementsByTagName("ul")[0];
    btnNode.insertBefore(document.createTextNode('add task '), btnNode.firstChild);
    // ulNode.id = "add_task_ul";
    for(let i = minLvl; i <= maxLvl; i++){
        ulNode.appendChild(getItemLI(i));
    }

    ulNode.onclick = (event) => {
        let lvl = event.target.innerText;
        onSelectedFun(lvl, buildingType);
    }
    //addOnClickListener(ulNode, onSelectedFun);
    return dropDownNode;
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

