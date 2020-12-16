class TrainHelper {

    static createTask(task, village){
        task.taskType = TRAIN_TYPE;
        task.building = BuildingHelper.getBuildingOnLocation(task.locationId, village);
        task.timer = TrainHelper.getTimeInMiliSec(task);
        task.uuid = getUuidv4();
        task.timerUpdate = Date.now();
        TrainHelper.addNames(task);
        delete task.locationId;
        return task;
    }

    static getTimeInMiliSec(trainTask){
        let split = trainTask.timeText.split(" ");
        let time = parseInt(split[0]);
        const unit = split[1];
        if(unit === HOUR){
            time *= 60;
        }
        return time * 60 * 1000;
    }

    static initTimers(trainTask){
        trainTask.timer = TrainHelper.getTimeInMiliSec(trainTask);
        trainTask.timerUpdate = Date.now() + trainTask.timer;
    }

    /*static isTaskOverdo(task) {
        return (task.timerUpdate < Date.now());
    }*/

    static resetTask(task){
        TaskHelper.resetTimer(task);
        for(const unit of task.units){
            unit.todo = unit.value;
        }
    }

    static isThereUnitToTrain(task){
        for(let unit of task.units){
            if(unit.todo > 0){
                return true
            }
        }
        return  false;
    }

    static subtractDoneUnits(task){ // TODO subtract number and not all
        for(const unit of task.units){
            unit.todo = 0;
        }
    }

    static isTaskAvailable(task, village) {
        if(!TrainHelper.isThereUnitToTrain(task)){
            return Promise.reject(ERROR_NO_UNITS_TO_TRAIN);
        }
        return TASK_OK;
    }


    static isTimerAfterAwhile(task) {
        const halfWayPoint  = task.timerUpdate - (task.timer / 2);
        return (Date.now() > halfWayPoint);
    }

    /*static deserializationToTrainTaskObject(trainTasks) {
        console.log("qwe trainTasks", trainTasks);
        let convertTrainTasks = [];
        for(const _task of trainTasks){
            Object.setPrototypeOf( _task.building, Building.prototype)
            let task = Object.setPrototypeOf(_task, TrainTask.prototype);
            convertTrainTasks.push(task);
        }
        return convertTrainTasks;
    }*/

    static addNames(task) {
        const unitsData = this.getTribeUnitData();
        for(let unit of task.units){
            const index = this.getUnitId(unit);
            unit.typeNum = index;
            unit.name = unitsData[index].name;
        }
    }

    static getUnitId(unit){
        return parseInt(unit.type.substring(1));
    }

    static getTribeUnitData(){
        switch(tribe){
            case (TRIBE_ROMANS):
                return romanTroops;
            case (TRIBE_GAULS):
                return gaulTroops;
            case (TRIBE_TEUTONS):
                return teutonTroops;
        }
    }
}
