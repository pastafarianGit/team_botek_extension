
async function getText(pathname, params, time){
    let pageString = await getTextFromPage(pathname, params, time);

    const isLogInPage = isOnLogInPage(pathname, pageString);
    if(isLogInPage){ // login again
        await logIn(isLogInPage);
        return getTextFromPage(pathname, params, time);  // request again after login
    }else{
        return pageString;
    }
}

async function logIn(isLogIn){
    let user = getUser();
    user.login = isLogIn;
    let bodyData = "name=" + encodeURIComponent(user.name) + "&password=" + encodeURIComponent(user.password) + "&s1=" + encodeURIComponent(user.s1) + "&w=" + encodeURIComponent(user.w) + "&login=" + encodeURIComponent(user.login);
    return makePostRequest(urls.baseServerUrl + LOGIN_PATHNAME, bodyData, URL_ENCODED_CONTENT_TYPE);
}

function saveUserData(){
    setToStorage(urls.baseServerUrl, {villages: villages, hero: hero});
}

function loadUserData(){
    getFromStorage(urls.baseServerUrl)
        .then(result => {
            console.log("saved villages", result);
            if(result && result.villages){
                hero.option = result.hero.option;
                for(const savedVillage of result.villages){
                    let village = VillageHelper.findVillage(villages, savedVillage.did);
                    if(savedVillage.did === village.did){
                        village.tasks = savedVillage.tasks;
                    }
                }
            }
            sendMessageToGUI(UPDATE_VILLAGES_ACTION, villages);
        });
    //villages = savedData;
}

async function getFromStorage(data){
    let promise = new Promise( (resolve, reject) => {
        chrome.storage.local.get([data], (result) => {
            resolve(result[data]);
        });
    });

    return await promise;
}

function setToStorage(name , data){
    chrome.storage.local.set({[name]: data}, (result) => {
        console.log("saved to chrome exetension", result);
    });
}

async function getHtmlDocFromPage(pathname) {
    let pageString = await getTextFromPage(pathname, "", 200);
    // console.log("pageString html", pageString);
    let parser = new DOMParser();
    let doc = parser.parseFromString(pageString, 'text/html');
    // console.log("doc ", doc);
    return  doc;
}


function makeValidJsonResource(text) {

    //text = text.slice(0, -); // remove ; last char
    text = text.replace(';', '');
    text = text.replace(/production/g, '"production"');
    text = text.replace(/storage/g, '"storage"');
    text = text.replace(/maxStorage/g, '"maxStorage"');
    return text;
}

async function makePostRequest(url, body, contentType){
    console.log("make post request", url);

    const headers = {
        method: 'POST',
        body: body,
        headers:{
            'content-type': contentType,
        }
    }
    return await fetch(url, headers);
}
/*
function getBuildingOnLocationForTask(taskBuilding, village) {
    let building = village.buildingsInfo.get(taskBuilding.locationId);
    if(building.type === 0){
        building = BuildingHelper.createBuilding(taskBuilding.locationId, taskBuilding.type, 0);
    }
    return building;
}*/

function hoursToMiliSec(hours){
    return minsToMiliSec(hours) * 60;
}

function minsToMiliSec(mins){
    return mins * 60 * 1000;
}

function miliSecondsToMins(miliSec){
    console.log("mili sec", miliSec);
    return (miliSec / 1000 / 60);
}

async function callFetchWithBaseUrl (pathname, headers, time) {
    const url = urls.baseServerUrl + pathname;
    let myPromise = await fetch(url, headers);
    await new Promise((resolve, reject) => setTimeout(resolve, time));
    return myPromise;
}

function calcNextCheckTime (secTimeToDo) { // in sec
    return Date.now() + (secTimeToDo * 1000);
}


function toHtmlElement(str){
    let parser = new DOMParser();
    let doc =  parser.parseFromString(str, 'text/html');
    return doc;
}

function toHtmlGetBodyFirstChild(str){
    let parser = new DOMParser();
    let doc =  parser.parseFromString(str, 'text/html');
    console.log("doc", doc, str);
    return doc.body.firstChild;
}



function getUuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

async function getUser(){
    let users = await getFromStorage('users');

    if(users === undefined){
        return Promise.reject(NO_USER);
    }

    for (let user of users){
        if(user.serverUrl === urls.baseServerUrl){
            return user;
        }
    }
    return Promise.reject(NO_USER);
}

function createArrayWithItemsInRange(min, max) {
    let rangeArray = [];
    for(let i = min; i <= max; i++){
        rangeArray.push(i);
    }
    return rangeArray;
}

function createDropDown(options, onSelectedFun, extraInfo, type) {
    let dropDownNode = toHtmlGetBodyFirstChild(DROP_DOWN);
    let btnNode = dropDownNode.getElementsByTagName("button")[0];
    let ulNode = dropDownNode.getElementsByTagName("ul")[0];

    dropDownNode.id = 'build-container'+ type.css;
    btnNode.insertBefore(document.createTextNode(type.name), btnNode.firstChild);
    ulNode.id = "add-task-ul" + type.css;
    for(let i = 0; i < options.length; i++){
        let li = getItemLI(options[i]);
        li.onclick = (event) => {
            let lvl = event.target.innerText;
            onSelectedFun(lvl, extraInfo);
        }
        ulNode.appendChild(li);
    }
    return dropDownNode;
}

function sendMessageToExtension(action, data, callback) {
    chrome.runtime.sendMessage({action: action, data: data}, callback);
}

function mapToJson(map) {
    return JSON.stringify([...map]);
}
function jsonToMap(jsonStr) {
    return new Map(JSON.parse(jsonStr));
}
/*
function deSerializeVillages(villages) {
    console.log("villages desER", villages);
    for (let village of villages){
        village.buildingsInfo = jsonToMap(village.buildingsInfo);
    }
    return villages;
}

function serializeVillages(villages) {
    let serializeVillages = [];
    for(const village of villages){
        let conVillage = JSON.parse(JSON.stringify(village));
        conVillage.buildingsInfo = mapToJson(village.buildingsInfo);
        serializeVillages.push(conVillage);
    }
    return serializeVillages;
}*/

function createPause(second) {
    setTimeout(()=> {
        console.log("pause over");
    }, second)
}

function randomiseW8Timer(timer) { // change timer by %
    const fraction =  timer * 0.2;
    let randomOfFraction = getRandInteger(0, fraction)
    let change = randomOfFraction * getRandPlusMinus();
    return timer + change;
}

function getRandPlusMinus() {
    const number = getRandInteger(0, 1);
    if(number === 1){
        return 1;
    }
    return -1;
}

function getRandInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
