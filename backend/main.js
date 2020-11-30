let queue = [];
let referer;
let baseServerUrl = "";
let botTabId;
let villages = [];
let serverSettings = null;
let tribe = -1;
let urlForFrontEnd = "";
let isBotOn = false;
let guiPortConnection = null;
let newBotOpen = {updateProfile: false, updateTribe: false};
let botSleep = {isSleeping: true, timer: Date.now() + hoursToMiliSec(0)};
let windowTab = "";

onStartUp();

function onStartUp() {
    setInterval(mainLoop, 15000);
    //testStartup();
}

function testStartup() {
        let newURL = "https://tx3.travian.hu/";
        chrome.tabs.create({ windowId: 355, url: newURL, active: true }, (tab)=> {
            setTimeout(()=> {
                openBot();
            }, 2000)
        });

}

function openBot() {

    runOnActiveId((tab) => {
        closeBotIfAlreadyOpened(botTabId);
        console.log("tab", tab);
        let url = new URL(tab.url);
        console.log("open bot", tab);
        botTabId = tab.id;
        baseServerUrl = url.origin;
        initVariables();
        windowTab = tab.windowId;
        setFrontEndUrl(url, tab);
    })
}

function initVariables() {
    newBotOpen.updateProfile = true;
    newBotOpen.updateTribe = true;
    isBotOn = false;
}

function mainLoop (){

    if(villages.length === 0 || !isBotOn)//if(!isBotOn)
        return;

    updateWorkingBotStatus();
    if(botSleep.isSleeping){
        return;
    }

    console.log("main loop", villages);
    addTasksToQueue();

    //DO WORK TASK FROM QUEUE
    if(queue.length !== 0){
        const task = queue.shift();
        console.log("doing task: ", task);
        switch (task.constructor) {
            case BuildTask:
                buildWrapper(task);
                break;
            case AnalyseTask:
                analyseVillagesOnStart(null);
                break;
            case TrainTask:
                trainWrapper(task);
                break;
        }
    }
}

function toggleSleep() {
    if(Date.now() > botSleep.timer){
        if(botSleep.isSleeping){
            botSleep.timer = Date.now() + hoursToMiliSec(0.4)
        }else{
            botSleep.timer = Date.now() + hoursToMiliSec(0.1)
        }
        botSleep.isSleeping = ! botSleep.isSleeping;
        console.log("bot is sleeping", botSleep.isSleeping, " until: ", miliSecondsToMins(Date.now() - botSleep.timer));
    }
}

function addTasksToQueue() {
    for (let village of villages){
        const isBuildAdded = addBuildTaskToQueue(village);
        addTrainTaskToQueue(village, isBuildAdded);
    }
}

function addToQueueAndUpdateTimer (task, village, timerType) {
    if(task !== null){
        queue.push(task);
    }
    console.log("add 15 mins to timerType", timerType);
    village.timers.add15Mins(timerType);

    return (task !== null);
}

async function checkAndLogin() {
    const pageString = await getTextFromPage(DORF1_PATHNAME, "", 200);
    const isLogInPage = isOnLogInPage(pageString);
    if(isLogInPage){
        await logIn(isLogInPage);
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
}

function setFrontEndUrl(url, tab) {
    console.log("set front end url", url);
    if(url.hostname.includes('travian')){
        checkAndLogin()
            .then(r => {
                urlForFrontEnd = url.origin + DORF1_PATHNAME;
                openBotTab(tab.id);
            }).catch(err =>{
            urlForFrontEnd = url.origin + LOGIN_PATHNAME;
            openBotTab(tab.id);
        });
    }
}
