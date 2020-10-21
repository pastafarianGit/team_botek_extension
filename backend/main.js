let queue = [];
let referer;
let baseServerUrl = "";
let botTabId;
let villages = null;
let serverSettings = null;
let tribe = -1;
let urlForFrontEnd = "";
let isBotActive = false;
let guiPortConnection = null;

onStartUp();
setInterval(mainLoop, 15000);

function onStartUp() {
    //analyseVillageProfile().then(r => console.log("analysed data", r));
    //openBot();
    //testStartup();
    //analyseVillages().then(r => console.log("anal r", r));
    // setInterval(frontEndUpdateLoop, 10000);

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
        let url = new URL(tab.url);
        botTabId = tab.id;
        baseServerUrl = url.origin;
        setFrontEndUrl(url, tab);
    })
}

function setFrontEndUrl(url, tab) {
    if(url.hostname.includes('travian')){
        chrome.storage.sync.get(['user'], (result) => {
            if(result.user === undefined){
                urlForFrontEnd = url.origin + LOGIN_PATHNAME;
                openBotTab(tab.id);
            }else{
                urlForFrontEnd = url.origin + DORF1_PATHNAME;
                loginFlow(url.origin, result)
                    .then(result => {
                        openBotTab(tab.id);
                    }).catch(err => {
                        openBotTab(tab.id);
                });
            }
        });
    }
}

async function loginFlow(url, storedUser) {
    storedUser.user.login = await analyseIsUserLoggedIn(DORF1_PATHNAME);
    return  await makePostRequest(url + LOGIN_PATHNAME, storedUser.user);
}

function mainLoop (){
    if(baseServerUrl === "")//if(!isBotActive)
        return;

    console.log("main loop", villages);
    addTasksToQueue();     //ANALYSE WORK TODO

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
