
function addNewTrainTask(trainData) {
    let village = VillageHelper.findVillage(villages, trainData.did);
    village.tasks.trainTasks.push(TrainHelper.createTask(trainData, village));
}


function addTrainTaskToQueue(village, isBuildTaskAdded) {
       for(const task of village.tasks.trainTasks){
           const isOverdo = TaskHelper.isTaskOverdo(task);
           console.log("task timer - Date.now", (task.timerUpdate - Date.now()) / 1000);

           let isAfterPoint  = TrainHelper.isTimerAfterAwhile(task);
           let shouldTrain = isAfterPoint && isBuildTaskAdded;
           if(!task.isInQueue){
               if(isOverdo || shouldTrain){
                   addToQueue(task);
               }
           }
       }
       console.log("queue", queue);
}

function trainWrapper(task) {
    let village = VillageHelper.findVillage(villages, task.did);
    updateBotStatusGUI(BOT_IS_TRAINING_STATUS);

    train(task, village)
        .then(result => {
            console.log("train worked", result, new Date().toLocaleTimeString());
            updateWorkingBotStatus();
        })
        .catch(error => {
            console.log("train error", error);
            updateBotStatusGUI(error);
        }).finally(() => {

        if(TaskHelper.isTaskOverdo(task)){
                TrainHelper.resetTask(task);
            }
            task.isInQueue = false;
        });
}


async function train(task, village) {
    const taskStatus = TrainHelper.isTaskAvailable(task);
    if(taskStatus !== TASK_OK){
        return taskStatus;
    }

    await analyseAndSwitchTo(task.building, village);
    const pageStringOnPOST = await simulateClickBuildingAndTrain(task, village);
    console.log("page string on POST", pageStringOnPOST);
    if(pageStringOnPOST.status === 200){
        TrainHelper.subtractDoneUnits(task);
    }
}

function createUriComponentUnits(units){
    let unitsString = "";
    for(const unit of units){
        unitsString += "&" + unit.type +"=" + encodeURIComponent(unit.value);
    }
    return unitsString;
}

async function simulateClickBuildingAndTrain(task) {
    const params = createParams(task);
    let buildingPageString = await getText(BUILD_PATH + PARAM_ID, params, 2000);

    const bodyData = createBodyDataTrain(task, buildingPageString);
    return makePostRequest(urls.baseServerUrl + BUILD_PATH + PARAM_ID + params, bodyData, URL_ENCODED_CONTENT_TYPE);
}

function createParams(task) {
    const building = task.building;
    let params = building.locationId + AND_GID_PARAM + building.type;
    if(building.type === RESIDENCE_BUILDING_ID || building.type === PALACE_BUILDING_ID){
        params += "&s=1";
    }

    return params;
}

function createBodyDataTrain(task, pageString) {
    const {z, a, s, did} = analyseTrainBuilding(pageString);
    const hiddenValues = "z=" + encodeURIComponent(z) + "&a=" + encodeURIComponent(a) + "&s=" + encodeURIComponent(s) + "&did=" + encodeURIComponent(did);
    const units = createUriComponentUnits(task.units);
    return hiddenValues + units + "&s1="+encodeURIComponent('ok');
}

function addToQueue(task) {
    task.isInQueue = true;
    queue.push(task);
}
