const showBuildUI = () => {
    console.log("showBuildUI", window.location);
    const pathname = window.location.pathname;
    if(pathname === BUILD_PATH){
        showOnBuildPhp();
    }
}



const showOnBuildPhp = () => {
    console.log(" window.location",  window.location.pathname);
    //console.log("resources", resources);
}




const parseText = (regex, text) => {
    let re = new RegExp(regex,"g");
    let result = re.exec(text);

    if(result !== null && result.length > 1){
        return  result[1];
    }
    return null;
}
