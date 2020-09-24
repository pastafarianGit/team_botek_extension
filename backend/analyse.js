
const analyseVillageProfile = async () => {
    let villages = [];
    let profileCall = await callFetch(PROFILE_URL);
    let htmlString = await profileCall.text();
    let villagesLinks  = regexTextMultiple(REGEX_VILLAGE_LINK, htmlString);

    let results = xPathSearch(XPATH_PROFILE_VILLAGES, htmlString);
    let villageHtml = results.iterateNext();
    while (villageHtml) {
        const villageLink = villagesLinks.shift();
        const village = parseBasicVillageData(villageHtml, new Village(villageLink));
        villages.push(village);
        villageHtml = results.iterateNext();
    }
    console.log("villages", villages);
    return villages;
}

const parseBasicVillageData = (villageHtml, village) => {
    let children = villageHtml.childNodes;
    (children).forEach((item, index) => {
        if(item.className === "name"){
            setVillageNameCapital(item.childNodes, village);
        }else if(item.className === "coords"){
            setVillageCoordinates(item, village);
        }
    })
    return village;
}

const setVillageCoordinates = (coordinateChild, village) => {
    const text = coordinateChild.innerText;
    let coordinateXY  = regexTextMultiple(REGEX_COORDINATE_XY, text);
    village.x = coordinateXY[0];
    village.y = coordinateXY[1];
}

const xPathSearch = (xPath, htmlString) => {
    let parser =  new DOMParser();
    let doc = parser.parseFromString(htmlString, 'text/html');
    return doc.evaluate(xPath, doc.body, null, XPathResult.ANY_TYPE, null);
}

const setVillageNameCapital = (nameChildren, village) => {
    let name = '';
    let isCapital = false;
    (nameChildren).forEach((child) => {
        if(child.tagName === 'A'){
            name = child.textContent;
        }else if(child.tagName === 'SPAN' && child.className === 'mainVillage'){
            isCapital = true;
        }
    });
    village.name = name;
    village.isCapital = isCapital;
    //return {name:name, isCapital:isCapital};
}

/*
const parseVillage = (thisHeading) => {
    let name  = parseTextSingle(REGEX_VILLAGE_NAME, thisHeading);
    let coordinateX  = parseTextSingle(REGEX_COORDINATE_X, thisHeading);
    let coordinateY  = parseTextSingle(REGEX_COORDINATE_Y, thisHeading);
}*/

const regexTextSingle = (regex, text) => {
    let re = new RegExp(regex,"g");
    let result = re.exec(text);
    if(result !== null && result.length > 1){
        return  result[1];
    }
    return null;
}

const regexTextMultiple = (regex, text) => {
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
/*
const parseProfilePage = async () => {
    let dorf1Call = await callFetch(PROFILE_URL);
    let html = await dorf1Call.text();
    let parser =  new DOMParser();
    let doc = parser.parseFromString(html, 'text/html');
    let headings = doc.evaluate("//span[@class=\"mainVillage\"]", doc.body, null, XPathResult.ANY_TYPE, null);
    let thisHeading = headings.iterateNext();
}*/





