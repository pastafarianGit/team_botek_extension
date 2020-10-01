let queue = [];
let referer;
let travianServer = "";
let botTabId;
let villagesController = null;
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


/*function parseResourcesOnPage(village, pageText) {
    let resourceText = regexTextSingle(REGEX_RESOURCES_VAR, pageText, "gs");
    resourceText = makeValidJsonResource(resourceText);
    return JSON.parse(resourceText);
}*/

async function analyseDorf1BuildTest(village) {
    /*const params =  NEW_DID_PARAM + village.did;
    let pageText = await getPageText(DORF1_URL, params);
    village.parseResources(pageText);
    village.parseResourceLvls(pageText);*/
    let task = village.getNextTask();// TODO narest groupe taskov

    console.log("village status", village);
    if(task !== null){
        console.log("started building task", task);
        village.nextCheckTime += 60000; // TODO check building time + main building lvl
        let buildingCall = await callFetch(BUILD_URL + task.locationId, {});
        let c = await retrieveC(buildingCall);
        console.log("c",c);
        let buildStart = await callFetch(DORF1_URL+"?a="+task.locationId+"&c="+c, {});
        return buildStart;
    }
}

function mainLoop (){
    console.log("main loop");
    for (let village of villagesController.villages){
        if(village.isNextCheckTime()){
            if(village.isNextBuildTask()){
                console.log("next build task", village);
                analyseDorf1BuildTest(village).then(result => console.log("result analyseDorf1Build", result));
            }
        }
    }
}

const build = async(id) => {
    let dorf1Call = await callFetch(DORF1_URL, /*{headers:{request:"true"}}*/);
    let buildingCall = await callFetch(BUILD_URL + id, {});
    let c = await retrieveC(buildingCall);
    console.log("c",c);
    return await callFetch(DORF1_URL+"?a="+id+"&c="+c, {});
}

const retrieveC = async (buildingCall) => {
    let body = await buildingCall.text();
    let cArray = /c=(.*)\'/g.exec(body);
    if(cArray !== null && cArray.length > 1){
        return  cArray[1];
    }
    throw new Error(ERROR_BUILDING_C);
}
