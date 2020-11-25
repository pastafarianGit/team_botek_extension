console.log("background botek ext")
let bearerKey = false;
let backgroundWindow = null;

function handleNoBearerKey() {
    if(!bearerKey){
        handleNotCorrectBearerKey();
    }
}

function closeBackgroundWindow(){
    if(backgroundWindow){
        chrome.windows.remove(backgroundWindow.id, ()=> {
            console.log("removed background window");
        });
        backgroundWindow = null;
    }
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    (info) =>{
        //console.log("info1: ", info);
        let url = new URL(info.url);
        if(info.initiator !== undefined && info.initiator.includes(EXTENSION_ID) && !SERVER_URL.includes(url.origin)){
            modifyHeaders(url.pathname, info.requestHeaders);
            modifyHeaderOrigin(info.url, info.requestHeaders);
        }else{
            modifyHeaders(url.pathname, info.requestHeaders);
            modifyHeaderOrigin(info.url, info.requestHeaders);
        }
        addBearerKey(info);
        return {requestHeaders: info.requestHeaders};

    },
    {
        urls:ACCESSIBLE_URLS
    },
    [ 'blocking', 'requestHeaders', 'extraHeaders']
)

function addBearerKey(info){
    for (let header of info.requestHeaders){
        if(header.name === 'Authorization'){
            if(header.value === 'Bearer false'){
                if(bearerKey){
                    header.value = "Bearer " + bearerKey;
                }
            }
        }
    }
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        //console.log("details", details);
        if(details.method === "POST" && details.url === baseServerUrl + LOGIN_PATHNAME){
            const formData = details.requestBody.formData;
            if(formData !== undefined){
                let newUser = {name: formData.name[0], password: formData.password[0], s1: formData.s1[0], w: formData.w[0], serverUrl : baseServerUrl};
                chrome.storage.sync.get(['users'], (result) => {
                    console.log("result on before request", result);
                    let users = addUser(result, newUser);
                    chrome.storage.sync.set({users: users}, () => {
                        console.log("saved user to exetension");
                    });
                });

            }
        }
    },
    {urls: ACCESSIBLE_URLS},
    ["blocking", "requestBody"]);

function addUser(result, newUser) {
    let users = [];
    let addedNewOne = false;
    if(result.users === undefined){ // fist time
        console.log("returning new users");
        return [newUser];
    }

    for(let user of result.users){
        if(user.serverUrl === newUser.serverUrl){
            users.push(newUser)  // add new one
            addedNewOne = true;
        }else{
            users.push(user);   // re add previous ones
        }
    }
    if(!addedNewOne){
        users.push(newUser);
    }
    return users;
}

function addHeader (newHeader, headers) {
    //console.log("new header", newHeader);
    for (let index in headers){
        if (newHeader.name === headers[index].name){
            headers[index] = newHeader;
            return;
        }
    }
    headers.push(newHeader);
}

function modifyHeaders (pathname, reqHeaders) {
    let constHeaders = REQUESTS_INFO[pathname];
    if(constHeaders === undefined){
        constHeaders = REQUESTS_INFO['others'];
    }
    if(constHeaders){
        constHeaders.headers.forEach(header => {
            addHeader(header, reqHeaders);
        });
    }
}

function modifyHeaderOrigin (url, requestHeaders) {
    if(referer !== undefined){
        addHeader({name: 'referer', value: referer}, requestHeaders);
    }else{
        addHeader({name: 'sec-fetch-site', value: 'none'}, requestHeaders)
    }
    if(url.includes('login')){
        addHeader({name: 'origin', value: baseServerUrl}, requestHeaders)
    }
    if(url.includes(baseServerUrl) && !url.includes('api')){
        referer = url;
    }
}

function handleNotCorrectBearerKey(){
        chrome.windows.create({url: baseServerUrl + DORF1_PATHNAME, state: 'minimized'}, (window)=> {
            backgroundWindow = window;
            console.log("opened new page on ", window);
        });
}

chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
        //console.log("ON RECEIVED", details.statusCode === 401);
        if(details.statusCode === 401) {
            handleNotCorrectBearerKey();
        }
        modifyCookie(details);
        return {
            responseHeaders:  removeSecurityHeaders(details)
        };
    },
    {
        urls: ACCESSIBLE_URLS
    },
    ["blocking", "responseHeaders", "extraHeaders"]
);

function modifyCookie(details) {
    details.responseHeaders.forEach((header) => {
        if (header.name.toLowerCase() === "set-cookie") {
            header.value = header.value + ";Secure;SameSite=None;";
        }
    });
}

function removeSecurityHeaders(details) {
    return details.responseHeaders.filter((header) => {
        return (
            !HEADERS_TO_STRIP.includes(header.name.toLowerCase())
        );
    })
}

// cookie change

chrome.cookies.onChanged.addListener( (object) => {
    if (object.cookie.domain.indexOf("travian.") !== -1 || object.cookie.domain.indexOf("kingdoms.") !== -1) {
        if (object.removed === false && object.cookie.sameSite !== "no_restriction" && object.cookie.secure !== true) {
            let cookie = object.cookie;
            let d = cookie.domain.indexOf('.') === 0 ? cookie.domain.replace('.', '') : cookie.domain;
            let newCookie = {
                url: "https://" + d,
                name: cookie.name,
                value: cookie.value,
                secure: true,
                sameSite: "no_restriction",
                expirationDate: cookie.expirationDate,
                storeId: cookie.storeId,

            }
            chrome.cookies.set(newCookie);
        }
    }
});

chrome.cookies.getAll({}, function (callback) {
    callback.forEach(function (cookie) {
        if (cookie.domain.indexOf("travian.") !== -1 || cookie.domain.indexOf("kingdoms.") !== -1) {
            let d = cookie.domain.indexOf('.') === 0 ? cookie.domain.replace('.', '') : cookie.domain;
            let newCookie = {
                url: "https://" + d,
                name: cookie.name,
                value: cookie.value,
                secure: true,
                sameSite: "no_restriction",
                expirationDate: cookie.expirationDate,
                storeId: cookie.storeId,

            }
            chrome.cookies.set(newCookie);
        }
    })
});
