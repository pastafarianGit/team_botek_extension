const regexSearchOne = (regex, text, flags) => {
    let re = new RegExp(regex,flags);
    let result = re.exec(text);
    if(result !== null && result.length > 1){
        return  result[1];
    }
    return null;
}

const regexSearchMultiple = (regex, text) => {
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

const xPathSearch = (xPath, htmlString) => {
    let parser =  new DOMParser();
    let doc = parser.parseFromString(htmlString, 'text/html');
    return doc.evaluate(xPath, doc.body, null, XPathResult.ANY_TYPE, null);
}

async function getTextFromPage(url, params) {
    url =  url + params;
    let pageCall = await callFetch(url);
    return  await pageCall.text();
}

function makeValidJsonResource(text) {

    //text = text.slice(0, -); // remove ; last char
    text = text.replace(';', '');
    text = text.replace(/production/g, '"production"');
    text = text.replace(/storage/g, '"storage"');
    text = text.replace(/maxStorage/g, '"maxStorage"');
    return text;
}

async function callFetch (url, headers) {
    let myPromise = await fetch(url, headers);
    await new Promise((resolve, reject) => setTimeout(resolve, 3000));
    return myPromise;
}

const calcNextCheckTime = (secTimeToDo) => { // in sec
    return Date.now() + (secTimeToDo * 1000);
}
