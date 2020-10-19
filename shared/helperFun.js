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

async function getTextFromPage(url, params) {
    url =  url + params;
    let pageCall = await callFetch(url);
    return  await pageCall.text();
}

async function getHtmlDocFromPage(url) {
    let pageString = await getTextFromPage(url, "");
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
    //let formData = new FormData();

    let formData = "name=" + encodeURIComponent(params.name) + "&password=" + encodeURIComponent(params.password) + "&s1=" + encodeURIComponent(params.s1) + "&w=" + encodeURIComponent(params.w) + "&login=" + encodeURIComponent(params.login);
    /*for (let param in params){
        if(params.hasOwnProperty(param)){
            formData.append(param, params[param]);
        }
    }*/

    const headers = {
        method: 'POST',
        body: formData
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

async function callFetch (url, headers) {
    let myPromise = await fetch(url, headers);
    await new Promise((resolve, reject) => setTimeout(resolve, 3000));
    return myPromise;
}

function calcNextCheckTime (secTimeToDo) { // in sec
    return Date.now() + (secTimeToDo * 1000);
}
