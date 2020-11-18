setTimeout(function() {
    /* Example: Send data from the page to your Chrome extension */
    console.log("INSIDE WEB PAGE", window);
    const travian = window.Travian;
    console.log("my travian is ", travian);
    let test  = travian.centipedeLiquefactionDecoratingCustodial;
    console.log("test", test);
    document.dispatchEvent(new CustomEvent('bearer_key_action', {

        detail: test // Some variable from Gmail.
    }));
}, 1000);
