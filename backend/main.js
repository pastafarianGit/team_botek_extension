let queue = [];
let referer;
let urlServerOrigin = "";
let botTabId;
let villages = null;
let serverSettings = null;
let tribe = -1;
let urlForFrontEnd = "";

onStartUp();

function onStartUp() {
    //analyseVillageProfile().then(r => console.log("analysed data", r));
    //openBot();
    //testStartup();
    //analyseVillages().then(r => console.log("anal r", r));
    setInterval(mainLoop, 15000);
    setInterval(frontEndUpdateLoop, 10000);

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
        botTabId = tab.id;
        let url = new URL(tab.url);
        urlServerOrigin = url.origin;
        console.log("my tab url", url);
        /*const userData = {
            name: 'pastafarian',
            password: '65c9e2b60d',
            s1: 'Prijava',
            w: '1920:1080'
        }*/

        setFrontEndUrl(url, tab);
        chrome.tabs.update(tab.id, {url:"http://localhost:4200/"});

        /*chrome.storage.sync.set({user: userData}, function() {
            console.log('Value is set to ', userData);
        });*/

        // if(tab.hostname.includes('travian') &&)
        // TODO check if link is travian server
            // is saved
                //try to go to dorf1
            // go to login page
                //save login data
        // TODO send botTabId link for iframe


        /*analyseVillageProfile().then(result => {
            villages = result;
            //= new Villages(result);
            console.log("villages ", villages);
            // chrome.tabs.create({ url: tab.url });
        });*/
    })
}

function setFrontEndUrl(url, tab) {
    if(url.hostname.includes('travian')){
        chrome.storage.sync.get(['user'], (result) => {
            console.log('Value currently is ', result);
            if(result.user === undefined){
                urlForFrontEnd = url.origin + '/'+ LOGIN_PATHNAME;
            }else{
                urlForFrontEnd = url.origin + '/' + DORF1_PATHNAME;
                analyseIsUserLoggedIn(urlForFrontEnd)
                    .then(userLogin => {
                        result.user.login = userLogin;
                        console.log("result user2", result.user);

                        makePostRequest(url.origin + '/'+ LOGIN_PATHNAME, result.user)
                            .then(result => {
                                console.log("result post request ", result);
                            }).catch(err => {
                                console.log("err post request", err);
                        });
                    }).catch(err => console.log("err is already logged in", err));
            }
        });
    }
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
