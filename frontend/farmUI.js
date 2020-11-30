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
            console.log("drop container", container);
        }
    }
}

