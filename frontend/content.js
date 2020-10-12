let villagesHelper = null;
let activeVillage = null;
console.log("hey botek extension", window.location.toString());

chrome.runtime.sendMessage({action: "isTabActive"}, function(data) {
    console.log("is active", data);
    if(data.isActive && data.villages !== null){
        villagesHelper = new VillagesHelper(data.villages);
        activeVillage = findActiveVillage(); // TODO active village not working for drof2
        showUi();
        showBuildUI();
    }
});

function showUi(){
    let asd = document.getElementsByClassName("villageList production")
    console.log("inner html asd", asd)
    let custom = document.createElement('div');
    custom.innerHTML = '<button type="button">Click Me!</button>'


    for (elt of asd){
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

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(request, sender, sendResponse) {
    console.log("msg recived", request.txt)
}
