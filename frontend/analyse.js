

function findActiveVillage() {
    let result = xPathSearchDoc(XPATH_ACTIVE_VILLAGE_F);
    let next = result.iterateNext();
    if(next){
        const text = next.getAttribute("href");
        const linkId = regexSearchOne(REGEX_VILLAGE_LINK_F, text, "g");
        return VillageHelper.findVillage(villages, linkId);
    }
    return null;
}

function xPathSearchDoc(xPath) {
    return  document.evaluate(xPath, document.body, null, XPathResult.ANY_TYPE, null);
}

