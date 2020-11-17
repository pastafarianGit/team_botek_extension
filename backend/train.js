function addNewTrainTask(data) {
    let village = VillagesHelper.findVillage(villages, data.did);
    village.trainTasks.push(data);
}
