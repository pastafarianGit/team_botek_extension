let queue = [];

setInterval(mainLoop, 15000);

function mainLoop () {
    let task = queue.shift();
    console.log("task: ", task);
    if(task === undefined)
        return;

}
