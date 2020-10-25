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
    let parser =  new DOMParser();
    let doc = parser.parseFromString(htmlString, 'text/html');
    return doc.evaluate(xPath, doc.body, null, XPathResult.ANY_TYPE, null);
}

async function getTextFromPage(pathname, params, time) {
    let pageCall = await callFetchWithBaseUrl(pathname + params, {}, time);
    return  await pageCall.text();
}

async function getTextAndCheckLogin(pathname, params, time){
    let pageString = getTextFromPage(pathname, params, time);

    const isLogIn = isOnLogInPage(pathname, pageString);
    if(isLogIn){ // login again
        await logIn(isLogIn);
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
/*
async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}*/

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
    //chrome.tabs.sendMessage(botTabId, {type: type, data: data}, response);
}

function openBotTab(tabId){
    chrome.tabs.update(tabId, {url: SERVER_URL});
}

function sendMessageToExtension(action, data, callback) {
    chrome.runtime.sendMessage({action: action, data: data}, callback);
}
