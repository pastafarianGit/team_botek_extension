let villages = null;
let activeVillage = null;
console.log("hey botek extension", window.location);
// hey();


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("on msg request qweqwe", request);
    sendResponse("qwe recived on FE 1 qqwe");
    console.log("11111111111111111111");
    return true;
});

async function hey(){
    await sleep(2000);
    if(window.location.pathname === "/login.php"){
        console.log("on login click");
         document.getElementsByTagName("form")[0].submit();
    }
    await sleep(2000);
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

// document.getElementById('sidebarBeforeContent').style.visibility = 'hidden';

let hostname = window.location.hostname;
if(hostname.includes('botek') || hostname.includes('localhost')){
    chrome.runtime.sendMessage({action: GET_IFRAME_URL}, (url) => {
        console.log("front end url is", url);
        window.document.getElementById('iframe-container').setAttribute('src', url);
        /*console.log("is active", data);
        if(data.isActive && data.villages !== null){
            villages = data.villages;
            activeVillage = findActiveVillage(); // TODO active village not working for drof2
            showUi();
            showBuildUI();
        }*/
    });
}else{
    chrome.runtime.sendMessage({action: IS_TAB_ACTIVE}, function(data) {
        console.log("is active", data);
        if(data.isActive && data.villages !== null){
            villages = data.villages;
            activeVillage = findActiveVillage(); // TODO active village not working for drof2
            showUi();
            showBuildUI();
        }
    });
}


function showUi(){
    let villageProduction = document.getElementsByClassName("villageList production")
    console.log("inner html asd", villageProduction)
    let custom = document.createElement('div');
    custom.innerHTML = '<button type="button">Click Me!</button>'


    for (elt of villageProduction){
        elt.style['background-color'] = '#ff00FF'
        elt.appendChild(custom)
    }
}

function myFunction() {
    let btn = document.createElement("BUTTON");
    let t = document.createTextNode("CLICK ME");

    btn.setAttribute("style","color:red;font-size:23px");

    btn.appendChild(t);
    document.body.appendChild(btn);

    btn.setAttribute("onclick", alert("clicked"));

}

/*
function gotMessage(request, sender, sendResponse) {
    console.log("msg recived", request)

}
*/
