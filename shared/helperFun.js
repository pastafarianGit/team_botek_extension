
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
    let users = await getFromStorage('users');
    let user = findUser(users);
    user.login = isLogIn;
    let bodyData = "name=" + encodeURIComponent(user.name) + "&password=" + encodeURIComponent(user.password) + "&s1=" + encodeURIComponent(user.s1) + "&w=" + encodeURIComponent(user.w) + "&login=" + encodeURIComponent(user.login);
    return makePostRequest(baseServerUrl + LOGIN_PATHNAME, bodyData);
}

async function getFromStorage(data){
    let promise = new Promise( (resolve, reject) => {
        chrome.storage.sync.get([data], (result) => {
            resolve(result.users);
        });
    });

    return await promise;
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

async function makePostRequest(url, body){
    console.log("make post request", url);

    const headers = {
        method: 'POST',
        body: body,
        headers:{
            'content-type': 'application/x-www-form-urlencoded',
        }
    }
    return await fetch(url, headers);
}

function getBuildingOnLocationForTask(taskBuilding, village) {
    let building = village.buildingsInfo.get(taskBuilding.locationId);
    if(building.type === 0){
        building = new Building(taskBuilding.locationId, taskBuilding.type, 0);
    }
    return building;
}

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
    const url = baseServerUrl + pathname;
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

function getBuildingCost(task, village) {
    const building = village.buildingsInfo.get(task.building.locationId);
    return  buildingsData[task.building.type].cost[building.lvl + 1];
}

function createArrayWithItemsInRange(min, max) {
    let rangeArray = [];
    for(let i = min; i <= max; i++){
        rangeArray.push(i);
    }
    return rangeArray;
}

function createDropDown(options, onSelectedFun, buildingType, cssSelector, name) {
    let dropDownNode = toHtmlGetBodyFirstChild(DROP_DOWN);
    let btnNode = dropDownNode.getElementsByTagName("button")[0];
    let ulNode = dropDownNode.getElementsByTagName("ul")[0];

    dropDownNode.id = 'build-container'+ cssSelector;
    btnNode.insertBefore(document.createTextNode(name), btnNode.firstChild);
    ulNode.id = "add-task-ul" + cssSelector;
    for(let i = 0; i < options.length; i++){
        ulNode.appendChild(getItemLI(options[i]));
    }

    ulNode.onclick = (event) => {
        let lvl = event.target.innerText;
        onSelectedFun(buildingType, lvl);
    }
    return dropDownNode;
}

function sendMessageToExtension(action, data, callback) {
    chrome.runtime.sendMessage({action: action, data: data}, callback);
}

function createPause(second) {
    setTimeout(()=> {
        console.log("pause over");
    }, second)
}

