let villages = null;
let activeVillage = null;
console.log("hey botek extension", window.location.toString());
//document.getElementById('villageList production').innerHtml += '<button class="button button1">Green</button>';



chrome.runtime.sendMessage({action: "isTabActive"}, function(data) {
    // console.log("my url: ", response.url);
    // console.log(document.getElementById('myframe'))
    console.log("is active", data);
    // villages = data.villages;
    // villages.findVillage("12");
    // console.log("type of villages", typeof villages);
    if(data.isActive && data.villages !== null){
        villages = new Villages(data.villages);
        activeVillage = findActiveVillage();
        showUi();
        showBuildUI();
    }
});


const showUi = () => {
    let asd = document.getElementsByClassName("villageList production")
    console.log("inner html asd", asd)
    let custom = document.createElement('div');
    custom.innerHTML = '<button type="button">Click Me!</button>'


    for (elt of asd){
        elt.style['background-color'] = '#ff00FF'
        elt.appendChild(custom)
    }
}
//console.log("inner html", document.getElementById("topBar"))


function myFunction() {
    let btn = document.createElement("BUTTON");
    let t = document.createTextNode("CLICK ME");

    btn.setAttribute("style","color:red;font-size:23px");

    btn.appendChild(t);
    document.body.appendChild(btn);

    btn.setAttribute("onclick", alert("clicked"));

}
/*
if(window.location.toString().includes("localhost")){
    chrome.runtime.sendMessage({action: "greeting"}, function(response) {
        //console.log("my url: ", response.url);
       // console.log(document.getElementById('myframe'))
        document.getElementById('myframe').src  = response.url;
        //document.get('iframe').src = response.url;
    });
}
*/


chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(request, sender, sendResponse) {
    console.log("msg recived", request.txt)
}
