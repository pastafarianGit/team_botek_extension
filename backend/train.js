
function addNewTrainTask(trainData) {
    let village = VillagesHelper.findVillage(villages, trainData.did);
    village.trainTasks.push(new TrainTask(trainData, village));
}


function addTrainTaskToQueue(village, isBuildTaskAdded) {
       for(const task of village.trainTasks){
           const isOverdo = TrainTaskHelper.isTaskOverdo(task);
           console.log("task timer - Date.now", (task.timerUpdate - Date.now()) / 1000);

           let isAfterPoint  = TrainTaskHelper.isTimerAfterAwhile(task);
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
    let village = VillagesHelper.findVillage(villages, task.did);

    train(task, village)
        .then(result => {
            console.log("train worked", result, new Date().toLocaleTimeString());
        })
        .catch(error => {
            console.log("train error", error);
        }).finally(() => {
            if(TrainTaskHelper.isTaskOverdo(task)){
                TrainTaskHelper.resetTask(task);
            }
            task.isInQueue = false;
        });
}


async function train(task, village) {
    const taskStatus = TrainTaskHelper.isTaskAvailable(task);
    if(taskStatus !== TASK_OK){
        return taskStatus;
    }

    await analyseAndSwitchTo(task.building, village);
    const pageStringOnPOST = await simulateClickBuildingAndTrain(task, village);
    console.log("page string on POST", pageStringOnPOST);
    if(pageStringOnPOST.status === 200){
        TrainTaskHelper.subtractDoneUnits(task);
    }
}

function createUriComponentUnits(units){
    let unitsString = "";
    for(const unit of units){
        unitsString += "&" + unit.name +"=" + encodeURIComponent(unit.value);
    }
    return unitsString;
}

async function simulateClickBuildingAndTrain(task) {
    const building = task.building;
    const params = building.locationId + AND_GID_PARAM + building.type;

    let buildingPageString = await getText(BUILD_PATH, params, 2000);

    const bodyData = createBodyData(task, buildingPageString);
    return makePostRequest(baseServerUrl+ BUILD_PATH +params, bodyData);
}

function createBodyData(task, pageString) {
    const {z, a, s, did} = analyseTrainBuilding(pageString);
    const hiddenValues = "z=" + encodeURIComponent(z) + "&a=" + encodeURIComponent(a) + "&s=" + encodeURIComponent(s) + "&did=" + encodeURIComponent(did);
    const units = createUriComponentUnits(task.units);
    return hiddenValues + units + "&s1="+encodeURIComponent('ok');
}

function addToQueue(task) {
    task.isInQueue = true;
    queue.push(task);
}
