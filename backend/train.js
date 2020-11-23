function addNewTrainTask(trainTask) {
    let village = VillagesHelper.findVillage(villages, trainTask.did);
    trainTask.timer = Date.now() + TrainTaskHelper.getTimeInMiliSec(trainTask);
    village.trainTasks.push(trainTask);
}

function addTrainTaskToQueue(village, isBuildTaskAdded) {
        console.log("train task village", village.trainTasks);
}
