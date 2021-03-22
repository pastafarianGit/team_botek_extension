let villages, hero, queue, tribe;
let botTabId, windowTab;
let guiPortConnection;
let serverSettings;
let botStatus;
let urls;

onStartUp();

function onStartUp() {
    initGlobalVariables();
    onTabCloseListener();
    //testStartup();
}
/*
function testStartup() {
        const windowId = 78;

        let newURL = "https://ts1.x1.europe.travian.com/";
        chrome.tabs.getAllInWindow(windowId, function(tabs){  // remove prev bots
            for (let i = 0; i < tabs.length; i++) {
                if(tabs[i].url === SERVER_URL){
                    chrome.tabs.remove(tabs[i].id, ()=> {});
                }
            }
        });


        chrome.tabs.create({ windowId: windowId, url: newURL, active: true }, (tab)=> {
            setTimeout(()=> {
                openBot();
            }, 2000)
        });

}*/

function openBot() {

    runOnActiveId((tab) => {

        setInterval(mainLoop, 15000);
        closeBotIfAlreadyOpened(botTabId);
        console.log("tab", tab);
        let url = new URL(tab.url);
        console.log("open bot", tab);
        botTabId = tab.id;
        urls.baseServerUrl = url.origin;
        windowTab = tab.windowId;
        console.log("windowTab", windowTab);
        setFrontEndUrl(url, tab);

    })
}


function mainLoop (){

    if(villages.length === 0 || !botStatus.isBotOn)//if(!isBotOn)
        return;

    updateWorkingBotStatus();
    if(botStatus.isSleeping){
        return;
    }

    console.log("main loop", villages);
    addTasksToQueue();

    //DO WORK TASK FROM QUEUE
    if(queue.length !== 0){
        const task = queue.shift();
        console.log("doing task: ", task);
        switch (task.taskType) {
            case BUILD_TYPE:
                buildWrapper(task);
                break;
            case ANALYSE_TYPE:
                analyseVillagesOnStart(null);
                break;
            case TRAIN_TYPE:
                trainWrapper(task);
                break;
            case FARM_TYPE:
                farmWrapper(task);
                break;
        }
    }
}

function toggleSleep() {
    if(Date.now() > botStatus.timer){
        if(botStatus.isSleeping){
            botStatus.timer = Date.now() + hoursToMiliSec(0.4)
        }else{
            botStatus.timer = Date.now() + hoursToMiliSec(0.1)
        }
        botStatus.isSleeping = ! botStatus.isSleeping;
        console.log("bot is sleeping", botStatus.isSleeping, " until: ", miliSecondsToMins(Date.now() - botStatus.timer));
    }
}



function addTasksToQueue() {

    for (let village of villages){
        const isBuildAdded = addBuildTaskToQueue(village);

        addTrainTaskToQueue(village, isBuildAdded);
        addFarmTaskToQueue(village);
    }
}

function addToQueueAndUpdateTimer (task, village, timerType) {
    if(task !== null){
        queue.push(task);
    }
    console.log("add 15 mins to timerType", timerType);
    TimersHelper.add15Mins(timerType, village.timers);

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
                urls.urlForFrontEnd = url.origin + DORF1_PATHNAME;
            }).catch(err =>{
                urls.urlForFrontEnd = url.origin + LOGIN_PATHNAME;
        }).finally(() => {
            openBotTab(tab.id);
        })
    }
}

function initGlobalVariables() {
    queue = [];
    botTabId = undefined;
    villages = [];
    serverSettings = null;
    tribe = -1;
    guiPortConnection = null;
    botStatus = {
        isSleeping: true,
        isBotOn : false,
        updateProfile: true,
        updateTribe: true,
        timer: Date.now(), // + hoursToMiliSec(0),
    };
    windowTab = "";
    urls = {referer: undefined, urlForFrontEnd: "", baseServerUrl: ""};
    hero = {option: SELECT_OPTIONS_HERO[0], timer: Date.now() };
}
