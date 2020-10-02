

const findActiveVillage = () => {
    let result = xPathSearchDoc(XPATH_ACTIVE_VILLAGE_F);
    let next = result.iterateNext();
    if(next){
        const text = next.getAttribute("href");
        console.log("text active v: ", text);
        const linkId = regexSearchOne(REGEX_VILLAGE_LINK_F, text, "g");
        return villagesController.findVillage(linkId);
    }
    return null;
}

const xPathSearchDoc = (xPath) => {
    return  document.evaluate(xPath, document.body, null, XPathResult.ANY_TYPE, null);
}

/*
const regexSearchSingle = (regex, text) => {
    let re = new RegExp(regex,"g");
    let result = re.exec(text);
    if(result !== null && result.length > 1){
        return  result[1];
    }
    return null;
}*/

