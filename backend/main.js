let queue = [];
let referer;
let travianServer = "";
let botTabId;
let villagesController = null;
let serverSettings = null;
onStartUp();

function onStartUp() {
    //analyseVillageProfile().then(r => console.log("analysed data", r));
    //openBot();
    testStartup();
    analyseVillages().then(r => console.log("anal r", r));
    setInterval(mainLoop, 10000);

}

function testStartup() {
    let village1 = new Village("12744");
    let village2 = new Village("14562");
    village1.addParams(23, -63, true, "qwe");
    village2.addParams(25, -74, false, "qwe2");

    let villagesTest = [village1, village2];
    console.log("test villages", villagesTest);
    villagesController = new VillagesController(villagesTest);

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
            villagesController = new VillagesController(result);
            //= new Villages(result);
            console.log("villages ", villagesController);
            chrome.tabs.create({ url: tab.url });
        });
    })
}

function mainLoop (){
    console.log("main loop", villagesController.villages);
    for (let village of villagesController.villages){
        if(village.isNextBuildTask()){
            const isNextCheckTime = village.isNextCheckTime();

            if(isNextCheckTime){
                console.log("is next checkTime", isNextCheckTime);
                buildResources(village).then(result => console.log("result analyseDorf1Build", result));
            }
        }
    }
}
/*
const build = async(id) => {

    let buildingCall = await callFetch(BUILD_URL + id, {});
    let c = await retrieveC(buildingCall);
    console.log("c",c);
    return await callFetch(DORF1_URL+"?a="+id+"&c="+c, {});
}*/

