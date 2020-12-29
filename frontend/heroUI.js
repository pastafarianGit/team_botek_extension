const statusDivId = 'add-task-status-div-hero';

function showHeroUI() {
    console.log("response showHeroUI ", pathname);

    if(pathname === HERO_PATH){
        showDropDownForHero();
    }
}

function showDropDownForHero() {
    const dropdown = createDropDown(SELECT_OPTIONS_HERO, onHeroDropDownClicked, null, DROPDOWN_EXTRA_HERO)
    const content = document.getElementById('content');
    const attributes = document.getElementById('attributes');
    let div = document.createElement('div');

    if(hero){
        let t = document.createTextNode(hero.option);
        div.appendChild(t);
    }
    div.id = statusDivId;
    attributes.append(dropdown);
    attributes.append(div);
    //attributes.prepend(dropdown);
    console.log("appended hero");
}


function onHeroDropDownClicked(clickedOption, extraInfo) {
    console.log("hero clicked option ", clickedOption);
    hero.option = clickedOption;
    let statusDiv = document.getElementById(statusDivId);

    sendMessageToExtension(UPDATE_HERO_ACTION, hero, (result)=>{
        console.log("hero updated", result);
    })
    if(statusDiv.firstChild){
        statusDiv.firstChild.textContent = clickedOption;
    }
}
