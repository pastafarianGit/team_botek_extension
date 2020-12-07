function addNewFarmTask(data) {
    console.log("farm data", data);
    let village = VillageHelper.findVillage(villages, data.did);
    let farmTask = FarmHelper.createFarmTask(data);
    village.farmTasks.push(farmTask);
    console.log("new farm task", farmTask);
}


function addFarmTaskToQueue(village) {
    for(const task of village.farmTasks){
        const isOverdo = TaskHelper.isTaskOverdo(task);

        if(isOverdo && !task.isInQueue){
            addToQueue(task);
        }
    }
}

function farmWrapper(task) {
    let village = VillageHelper.findVillage(villages, task.did);
    updateBotStatusGUI(BOT_IS_FARMING_STATUS);
    farm(task, village)
        .then(result => {})
        .catch(error => {})
        .finally(() =>{
            TaskHelper.resetTimer(task);
            task.isInQueue = false;
        });
}

async function farm(task, village) {
    let randomTimer = randomiseW8Timer(FETCH_SWITCH_TIME);
    console.log("random w8 timer", randomTimer);
    const farmPageString = await getTextFromPage(BUILD_PATH_F, FARM_LIST_PARAMS, randomTimer);
    const bodyData = createBodyDataFarm(task.id, farmPageString);

    let postReq =  makePostRequest(baseServerUrl + RAID_LIST_PATHNAME, bodyData, APP_JSON_CONTENT_TYPE);

    console.log("data", postReq);
}

function createBodyDataFarm(id, pageString) {
    const data = analyseFarmList(id, pageString);
    let bodyData =  {a: data.a, captcha: null, direction: data.direction, listId: parseInt(data.lid), loadedLists: [], method: "ActionStartRaid",
        slots: [], sort: data.sort};
    /*const bodyData = "a=" + encodeURIComponent(data.a) + "&captcha=" + encodeURIComponent(null) + "&direction=" + encodeURIComponent(data.direction)
        + "&listId=" + encodeURIComponent(data.lid)  + "&loadedLists=" + encodeURIComponent([])  + "&method=" + encodeURIComponent("ActionStartRaid")
        + "&slots=" + encodeURIComponent([]) + "&sort=" + encodeURIComponent(data.sort);
*/
    return JSON.stringify(bodyData);
}


function analyseFarmList(id, pageString){
    const raidList = getRaidList(id, pageString);
    const form = raidList.getElementsByTagName('form')[0];
    let data = {};
    for(const input of form.getElementsByTagName("input")){
        let name = input.getAttribute('name');
        let value = input.getAttribute('value');
        data[name] = value;
        console.log("name", input.getAttribute('name'));
    }
    return data;
}

function getRaidList(id, pageString) {
    const doc = toHtmlElement(pageString);
    const raidLists = doc.getElementsByClassName('raidList');
    for(const raidL of raidLists){
        if(raidL.getAttribute('data-listid')){
            return raidL;
        }
    }
    return null;
}

