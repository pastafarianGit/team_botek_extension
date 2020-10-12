let queue = [];
let referer;
let travianServer = "";
let botTabId;
let villagesHelper = null;
let serverSettings = null;
let tribe = -1;

onStartUp();

function onStartUp() {
    //analyseVillageProfile().then(r => console.log("analysed data", r));
    //openBot();
    testStartup();
    analyseVillages().then(r => console.log("anal r", r));
    setInterval(mainLoop, 15000);

}

function testStartup() {
    let village1 = new Village("12744");
    let village2 = new Village("14562");
    village1.addParams(23, -63, true, "qwe");
    village2.addParams(25, -74, false, "qwe2");

    let villagesTest = [village1, village2];
    console.log("test villages", villagesTest);
    villagesHelper = new VillagesHelper(villagesTest);

    analyseVillageProfile().then(r => {
        console.log("analyse profile done", r);
    })
}

function openBot() {
    runOnActiveId((tab) => {
        console.log("open bot1 result", tab);
        travianServer = tab.url;
        // chrome.tabs.create({ url: tab.url });
        chrome.tabs.update(tab.id, {url:"http://localhost:4200/"});
        botTabId = tab.id;
        analyseVillageProfile().then(result => {
            villagesHelper = new VillagesHelper(result);
            //= new Villages(result);
            console.log("villages ", villagesHelper);
            chrome.tabs.create({ url: tab.url });
        });
    })
}

function mainLoop (){
    //ANALYSE WORK TODO
    console.log("main loop", villagesHelper.villages);
    addTasksToQueue();

    //DO WORK TASK FROM QUEUE
    if(queue.length !== 0){
        console.log("main queue",  queue);
        const task = queue.shift();
        console.log("Doing task", task);
        if(task instanceof BuildTask){
            // task.name = "test main add to queue";
            build(task).then(result => console.log("result", result));
        }
    }
}

function addTasksToQueue() {
    for (let village of villagesHelper.villages){
        addBuildingTasks(village);
    }
}

function addBuildingTasks(village) {
    if(village.buildTasks.length > 0){
        if(tribe === TRIBE_ROMANS){
            addRomanBuildTask(village, ROMANS_DORF1_ID);
            addRomanBuildTask(village, ROMANS_DORF2_ID);
        }else{
            if(village.timers.isNextCheckTime(BUILD_ID)){
                const resTask = BuildHelper.getNextTask(village);
                addToQueueAndUpdateTimer(resTask, village, BUILD_ID);
            }
        }
    }
}

function addRomanBuildTask (village, type) {
    console.log("add building task!!", village.timers.isNextCheckTime(type), type);

    if(village.timers.isNextCheckTime(type)){
        console.log("isNextCheckTime", type, village);
        const resTask = BuildHelper.getNextTaskWithType(village, type === ROMANS_DORF1_ID);
        addToQueueAndUpdateTimer(resTask, village, type);
    }
}

function addToQueueAndUpdateTimer (task, village, timerType) {
    if(task !== null){
        console.log("add to queue");
        queue.push(task);
    }
    console.log("add 15 mins to timerType", timerType);
    village.timers.add15Mins(timerType);
}
