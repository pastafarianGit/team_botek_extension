setTimeout(function() {
    const key = findBearerKey();
    //console.log("key", key);
    document.dispatchEvent(new CustomEvent('bearer_key_action', {
        detail: key
    }));
}, 1000);


function findBearerKey() {
    const travian = window.Travian;
        for(const property in travian){
            if(travian.hasOwnProperty(property)){
            if(typeof (travian[property]) === 'string'){
                //console.log("property", property);
                //console.log("content", travian[property]);
                if(travian[property].length === 32){
                    return travian[property];
                }
                //console.log("content len", travian[property].length);

            }
        }
    }
    return null;
}
