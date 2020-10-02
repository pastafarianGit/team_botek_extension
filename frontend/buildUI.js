let dropDown = '    <div class="bootstrap">\n' +
    '        <div class="col-lg-12">\n' +
    '            <button id="button" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>\n' +
    '            <ul id="ul" class="dropdown-menu scrollable-menu" role="menu">\n' +
    '            </ul>\n' +
        '      </div>\n' +
        '</div>\n';

const showBuildUI = () => {
    const pathname = window.location.pathname;
    if(pathname === BUILD_PATH_F){
        showOnBuildPhp();
    }
}

const showOnBuildPhp = () => {
    const {buildingType, buildingLvl} = getBuildingTypeLevel();
    if (buildingType <= 4){
        const maxLvl = getMaxResourceLvl();
        const dropDownNode = createDropDown(buildingLvl+1, maxLvl, onBuildDropdownSelected, buildingType);
        document.getElementsByClassName("section1")[0].append(dropDownNode);
    }else{

    }
}

const onBuildDropdownSelected = (lvl, type) => {
    const locationId = getParamFromUrl("id");
    const buildTask = {lvl: parseInt(lvl), type: type, locationId: parseInt(locationId), villageDid: activeVillage.did};
    console.log("selected 1:  location", locationId);
    console.log("selected 2:  lvl", lvl);
    console.log("selected 3:  type", type);


    chrome.runtime.sendMessage({action: "build", "data": buildTask}, function(task) {
        console.log("is task complete", task);
        /*if(data.isActive && data.villages !== null){
            villages = new Villages(data.villages);
            activeVillage = findActiveVillage();
            showUi();
            showBuildUI();
        }*/
    });
}

const getParamFromUrl = (name) => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(name);
}

const createDropDown = (minLvl, maxLvl, onSelectedFun, buildingType) => {
    let dropDownNode = toHtmlElement(dropDown);
    let btnNode = dropDownNode.getElementsByTagName("button")[0];
    let ulNode = dropDownNode.getElementsByTagName("ul")[0];
    btnNode.insertBefore(document.createTextNode('add task'), btnNode.firstChild);
    ulNode.id = "build";
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

const getMaxResourceLvl = () => {
    let maxLvl  = MAX_RESOURCE_LVL;
    if(activeVillage.isCapital){
        maxLvl = MAX_CAPITAL_RESOURCE_LVL;
    }
    return maxLvl;
}

const getBuildingTypeLevel = () => {
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

const getItemLI = (text) => {
    let li = document.createElement('li');
    let a = document.createElement('a');
    a.appendChild(document.createTextNode(text));
    li.appendChild(a);
    return li;
}

const toHtmlElement = (str) => {
    let parser = new DOMParser();
    let doc =  parser.parseFromString(str, 'text/html');
    return doc.body.firstChild;

}
