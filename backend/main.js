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

onStartUp();
setInterval(mainLoop, 15000);

function onStartUp() {
    // loginIn().then(r => console.log("on startup ", r));
    //analyseVillageProfile().then(r => console.log("analysed data", r));
    // openBot();
    //testStartup();
    //analyseVillages().then(r => console.log("anal r", r));
    // setInterval(frontEndUpdateLoop, 10000);
    //testStartup();
}

function testStartup() {
    let village1 = new Village("3810");
    //let village2 = new Village("14562");
    village1.addParams(-54, 28, true, "1");
    //village2.addParams(25, -74, false, "qwe2");

    let villagesTest = [village1];
    console.log("test villages", villagesTest);
    villages = villagesTest;
    isBotOn = true;
    baseServerUrl = 'https://tx3.travian.com';
    urlForFrontEnd = baseServerUrl + DORF1_PATHNAME;

    callFetchWithBaseUrl(DORF1_PATHNAME, {"Sec-Fetch-Site" : "same-origin"}, 3000).then(r=>{console.log("fetcjed profile test r", r)});

    analyseVillagesAfterLogin(()=>{});
    //analyseVillagesAfterLogin(()=>{});

    //analyseBuildingsInAllVillages().then("done");
}

function openBot() {
    runOnActiveId((tab) => {
        let url = new URL(tab.url);
        botTabId = tab.id;
        baseServerUrl = url.origin;
        newBotOpen.updateProfile = true;
        newBotOpen.updateTribe = true;
        setFrontEndUrl(url, tab);

    })
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

function findUser(users){
    if(users === undefined){
        return Promise.reject(NO_USER);
    }

    for (let user of users){
        if(user.serverUrl === baseServerUrl){
            return user;
        }
    }
    return Promise.reject(NO_USER);
}

async function loginFlow(url) {
    let login = await analyseIsUserLoggedIn(DORF1_PATHNAME);
    return await makePostRequest(url + LOGIN_PATHNAME, storedUser);
}

function mainLoop (){

    if(villages.length === 0 || !isBotOn)//if(!isBotOn)
        return;
    toggleSleep();
    if(botSleep.isSleeping){
        return;
    }
    console.log("main loop", villages);
    addTasksToQueue();     //ANALYSE WORK TODO

    //DO WORK TASK FROM QUEUE
    if(queue.length !== 0){
        //console.log("main queue",  queue);
        const task = queue.shift();
        console.log("Doing task", task);
        if(task instanceof BuildTask){
            // task.name = "test main add to queue";
            buildAndHandleErrors(task);
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
        queue.push(task);
    }
    console.log("add 15 mins to timerType", timerType);
    village.timers.add15Mins(timerType);
}
