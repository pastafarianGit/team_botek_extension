let queue = [];
let referer;
let travianServer = "";
let botTabId;
let villages = null;
onStartUp();

function onStartUp() {
    //analyseVillageProfile().then(r => console.log("analysed data", r));
    //openBot();
    testStartup();
    setInterval(mainLoop, 5000);
}

function testStartup() {
    let village1 = new Village("12744");
    let village2 = new Village("14562");
    village1.addParams(23, -63, true, "qwe");
    village2.addParams(25, -74, false, "qwe2");

    let villagesTest = [village1, village2];
    console.log("test villages", villagesTest);
    villages = new Villages(villagesTest);
}

function openBot() {
    runOnActiveId((tab) => {
        console.log("open bot1 result", tab);
        travianServer = tab.url;
        // chrome.tabs.create({ url: tab.url });
        chrome.tabs.update(tab.id, {url:"http://localhost:4200/"});
        botTabId = tab.id;
        analyseVillageProfile().then(result => {
            villages = new Villages(result);
            //= new Villages(result);
            console.log("villages ", villages);
            chrome.tabs.create({ url: tab.url });
            // TODO  open new tab
        });
    })
}


function mainLoop (){
    let task = queue.shift();
    console.log("task: ", task);
    console.log("villages: ", villages);
    if(task === undefined)
        return;

    if (task.type === BUILD_TYPE){
        let buildTask = task.value;
        build(buildTask.id)
            .then(data => {
                console.log("build works:", data)
                task.response({"type": "success"});
            }).catch(err => {
                task.response(err);
                console.error("my: ", err)
            });
    }
}

async function callFetch (url, headers) {
    let myPromise = await fetch(url, headers);
    await new Promise((resolve, reject) => setTimeout(resolve, 3000));
    return myPromise;
}

function find() {

}

const build = async(id) => {
    let dorf1Call = await callFetch(DORF1_URL, /*{headers:{request:"true"}}*/);
    let buildingCall = await callFetch(BUILD_URL + id, {});
    let c = await retrieveC(buildingCall);
    console.log("c",c);
    let buildStart = await callFetch(DORF1_URL+"?a="+id+"&c="+c, {});
    return buildStart;
}

const retrieveC = async (buildingCall) => {
    let body = await buildingCall.text();
    let cArray = /c=(.*)\'/g.exec(body);
    if(cArray !== null && cArray.length > 1){
        return  cArray[1];
    }
    throw new Error(ERROR_BUILDING_C);
}
