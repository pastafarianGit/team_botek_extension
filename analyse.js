const analyse = async () => {
    let dorf1Call = await callFetch(DORF1_URL);
    let html = await dorf1Call.text();
    let parser =  new DOMParser();
    let doc = parser.parseFromString(html, 'text/html');

    let headings = doc.evaluate("//*[@id='sidebarBoxVillagelist']/div[2]/ul/li", doc.body, null, XPathResult.ANY_TYPE, null);

    let thisHeading = headings.iterateNext();
    while (thisHeading) {
        parseVillage(thisHeading.innerHTML);
        thisHeading = headings.iterateNext();
    }
    return doc;
}

const parseVillage = (thisHeading) => {
    let name  = parseText(REGEX_VILLAGE_NAME, thisHeading);
    let coordinateX  = parseText(REGEX_COORDINATE_X, thisHeading);
    let coordinateY  = parseText(REGEX_COORDINATE_Y, thisHeading);
    console.log("name", name);
    console.log("coordinateX", coordinateX);
    console.log("coordinateY", coordinateY);
}

const parseText = (regex, text) => {
    let re = new RegExp(regex,"g");
    let result = re.exec(text);

    if(result !== null && result.length > 1){
        return  result[1];
    }
    return null;
}


