let queue = [];
let referer;
let travianServer = "";
let botTabId;
let villages = null;
let serverSettings = null;
let tribe = -1;

onStartUp();

function onStartUp() {
    //analyseVillageProfile().then(r => console.log("analysed data", r));
    //openBot();
    testStartup();
    analyseVillages().then(r => console.log("anal r", r));
    setInterval(mainLoop, 15000);
    setInterval(frontEndUpdateLoop, 5000);

}

function testStartup() {
    let village1 = new Village("12744");
    let village2 = new Village("14562");
    village1.addParams(23, -63, true, "qwe");
    village2.addParams(25, -74, false, "qwe2");

    let villagesTest = [village1, village2];
    console.log("test villages", villagesTest);
    villages = villagesTest;

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
            villages = result;
            //= new Villages(result);
            console.log("villages ", villages);
            chrome.tabs.create({ url: tab.url });
        });
    })
}

function mainLoop (){
    //ANALYSE WORK TODO
    console.log("main loop", villages);
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


function frontEndUpdateLoop() {
        // should this be frontend?
}

function addTasksToQueue() {
    for (let village of villages){
        addBuildingTasks(village);
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
