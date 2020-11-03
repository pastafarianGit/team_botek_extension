function regexSearchOne(regex, text, flags) {
    let re = new RegExp(regex,flags);
    let result = re.exec(text);
    if(result !== null && result.length > 1){
        return  result[1];
    }
    return null;
}

function regexSearchMultiple(regex, text) {
    let results = [];
    let re = new RegExp(regex,"g");
    let matches = re[Symbol.matchAll](text);
    for (const match of matches) {
        //console.log("multiple matches", match);
        if(match !== null && match.length > 1){
            results.push(match[1]);
        }
    }
    return results;
}

function xPathSearch(xPath, htmlString) {
    let doc = toHtmlElement(htmlString);
    return doc.evaluate(xPath, doc.body, null, XPathResult.ANY_TYPE, null);
}

async function getTextFromPage(pathname, params, time) {
    let pageCall = await callFetchWithBaseUrl(pathname + params, {}, time);
    return  await pageCall.text();
}

async function getTextAndCheckLogin(pathname, params, time){
    let pageString = getTextFromPage(pathname, params, time);

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
    return makePostRequest(baseServerUrl + LOGIN_PATHNAME, user);
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

async function makePostRequest(url, params){

    let formData = "name=" + encodeURIComponent(params.name) + "&password=" + encodeURIComponent(params.password) + "&s1=" + encodeURIComponent(params.s1) + "&w=" + encodeURIComponent(params.w) + "&login=" + encodeURIComponent(params.login);
    const headers = {
        method: 'POST',
        body: formData,
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

function sendMessageToGUI(action, data) {
    if(guiPortConnection !== null){
        guiPortConnection.postMessage({action: action, data:data});
    }
}

function openBotTab(tabId){
    chrome.tabs.update(tabId, {url: SERVER_URL});
}

function sendMessageToExtension(action, data, callback) {
    chrome.runtime.sendMessage({action: action, data: data}, callback);
}

function toHtmlElement(str){
    let parser = new DOMParser();
    let doc =  parser.parseFromString(str, 'text/html');
    return doc;
}

function toHtmlGetBodyFirstChild(str){
    let parser = new DOMParser();
    let doc =  parser.parseFromString(str, 'text/html');
    return doc.body.firstChild;
}
