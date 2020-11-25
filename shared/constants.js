
const PRIMARY_COLOR = '#ff4081';

const TRIBE_ROMANS = 1;
const TRIBE_GAULS = 3;
const TRIBE_TEUTONS = 2;
//const SERVER_URL = "http://www.travianteambot.com/";
//const SERVER_URL = "http://168.119.157.162/";
const SERVER_URL = "http://localhost:4200/";
const EXTENSION_ID = "cbnloeijbkamkdkpnieednoedeakkdga";
// FRONTEND
const BUILD_PATH_F = "/build.php";
const XPATH_ACTIVE_VILLAGE_F = '//*[@id="sidebarBoxVillagelist"]/div[2]/ul/li[@class=" active"]/a';
const REGEX_VILLAGE_LINK_F = 'newdid=(.*?)&';
const MAX_RESOURCE_LVL = 10;
const MAX_CAPITAL_RESOURCE_LVL = 20;
const BUILDING_GID = "gid";
const BUILDING_AID = "aid";
const BUILDING_LEVEL = "level";
const BUILDING_LOCATION_ID = "buildingSlot";
const HOUR = "h";
const MIN = "min";
const DONE = 'done';
const SELECT_OPTIONS_TRAIN = ['1 ' + MIN, '2 ' + MIN, '15 '+ MIN, '30 '+ MIN, '45 '+MIN, '1 '+HOUR, '2 '+HOUR];
const ADD_BUILDING_NAME = 'add building ';
const ADD_UNITS_NAME = 'train per ';
const ALL_RES_LOCATION_ID = 100;
const TYPES_NAMES = {1: "Wood", 2: "Clay", 3: "Iron", 4: "Crop"};
// ACTIONS
const CHANGE_VILLAGE_ACTION = 'change_village_action';
const IS_TAB_ACTIVE_ACTION = "is_tab_active_action";
const GET_IFRAME_URL_ACTION = "get_iframe_url_action";
const UPDATE_BUILD_TASK_ACTION = "update_build_task_action";
const UPDATE_VILLAGES_ACTION = "update_villages_action";
const UPDATE_ALL_GUI_BOT_DATA_ACTION = "update_all_gui_bot_data_action";
const ADD_BUILD_TASK_ACTION = "add_build_task_action";
const ADD_TRAIN_TASK_ACTION = "add_train_task_action";
const IS_ACTIVE_BOT_ACTION = "is_active_bot_action";
const UPDATE_BOT_STATUS_ACTION = 'update_bot_status_action';
const BEARER_KEY_ACTION = 'bearer_key_action';

const BOT_IS_SLEEPING_STATUS = "sleeping";
const BOT_IS_WORKING_STATUS = "working";
const BOT_IS_BUILDING_STATUS = "building";
const BOT_IS_ON_PAUSE_STATUS = "on pause";
const BOT_IS_ANALYSING_VILLAGES = "analysing all villages";

const RES_MAX_LOCATION = 18;
const ERROR_ALREADY_BUILDING = "already building";
const NOT_ENOUGH_RES_OR_LVL = "not enough resources or task lvl too low";
const ERROR_NOT_ENOUGH_RES = "not enough resources";
const NO_USER = "no login user";
const BUILDING_DIFF_TASK_LVL_OR_LVL_TOO_LOW = "building is diff than task or lvl too low";
const ERROR_TASK_LOWER_LVL_THAN_BUILDING = "task lower lvl than building";
const ERROR_TASK_DIFF_TYPE_THAN_BUILDING = "task diff type than building";
const ERROR_BUILDING_C = "no value c";
const ERROR_NO_PREREQUISITE = "Not meeting prerequisite";
const HIGHLIGHT_TASK_CSS = 'highlight-task';
const TASK_OK = "TASK_ok";
const ERROR_WAREHOUSE_TOO_LOW = "warehouse too low";
const ERROR_NO_UNITS_TO_TRAIN = "no units to train";

const BOTH_BUILD_ID = 0;
const RES_ID = 1;
const TOWN_ID = 2;
const RES_AND_TOWN_ID = 3;

const ROMANS_DORF1_ID = 4;
const ROMANS_DORF2_ID = 5;




// BACKEND
const BUILD_TYPE = "build_dorf1";
const ANALYSE_TYPE = "build_dorf1";

// const BASE_URL = "https://tx3.balkans.travian.com/";
const DORF1_PATHNAME = "/dorf1.php"; // todo changing to dorf1.php
const DORF2_PATHNAME = "/dorf2.php";
const LOGIN_PATHNAME = "/login.php";
const BUILD_PATH = "/build.php?id=";
const PROFILE_PATHNAME ="/profile";
const AND_GID_PARAM = '&gid='
const CATEGORY_PARAM = "&category=";
const NEW_DID_PARAM = "?newdid="


const REGEX_VILLAGE_NAME = "<span class=\"name\">(.*)<\\/span>";
/*const REGEX_COORDINATE_X = "<span class=\"coordinateX\">\\((.*)</span><span class=\"coordinatePipe\">";
const REGEX_COORDINATE_Y = "<span class=\"coordinateY\">(.*)\\)";*/
const REGEX_COORDINATE_XY = "(−?‭\\d+)";
const XPATH_PROFILE_VILLAGES = "//*[@id='villages']/tbody/tr";
const XPATH_CURRENTLY_BUILDING = "//*[@id='content']/div[2]/ul";
const REGEX_VILLAGE_LINK = '<a  href="\\?newdid=(.*)&';
const REGEX_VILLAGE_LINK_TEXT = 'newdid=(.*)&';
const REGEX_RESOURCES_VAR = 'var resources = (\\{.*?)<\\/script>';
const REGEX_CURRENTLY_BUILDING = 'var bld=(.*?)<\\/script>';
const REGEX_DORF2_BUILDING_LOCATION = 'a(\\d\\d)';
const REGEX_DORF2_BUILDING_TYPE = 'g(\\d+)';
const REGEX_SERVER_SETTINGS = 'Travian.Translation.add\\((.*?)<\\/script>';
const REGEX_BUILD_PATH_ON_NEW_BUILDING = 'href = \'(.*)\';';

const REGEX_SERVER_SPEED = 'Travian.Game.speed = (\\d);';
const REGEX_SERVER_VERSION = 'Travian.Game.version = (.*);';
const REGEX_SERVER_WORLD_ID = 'Travian.Game.worldId = (.*);';
const REGEX_TRIBE = 'tribe(\\d)"';
const CONTRACT_BUILDING = 'contract_building';

const MAIN_BUILDING_ID = 15;
const WOOD_TYPE = 1;
const DROPDOWN_CSS_NEW = "-new";
const DROPDOWN_CSS_TRAIN = "-train";
const DROPDOWN_CSS_EXISTING = "-existing";

//
let DROP_DOWN = '    <div id="" class="bootstrap">\n' +
    '        <div class="col-lg-12">\n' +
    '<div id="btn-container">\n'+
    '            <button id="build-btn" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>\n' +
    '            <ul id="" class="dropdown-menu scrollable-menu" role="menu">\n' +
    '            </ul>\n' +
    '      </div>\n' +
    '      </div>\n' +
    '</div>\n' +
    '</div>\n';

let CHECKBOX = '<td class="all-res"> ' +
                    '<input type="checkbox" id="" name="" value=""> ' +
                '</td>'

const HEADERS_TO_STRIP = [
    "content-security-policy",
    "x-frame-options"
];

const WALL_LOCATION = 40;
const WALL_IDS = [31, 32, 33];
const TYPE_FREE_SLOT = 'gid0';

const ACCESSIBLE_URLS= [
    "https://request.urih.com/",
    "*://*.travianteambot.com/*",
    "*://*.kingdoms.com/*",
    "http://*.localhost/*",
    "https://*.travian.ae/*",
    "https://*.travian.com/*",
    "https://*.travian.asia/*",
    "https://*.travian.com.au/*",
    "https://*.travian.ba/*",
    "https://*.travian.bg/*",
    "https://*.travian.com.br/*",
    "https://*.travian.cl/*",
    "https://*.travian.cz/*",
    "https://*.travian.de/*",
    "https://*.travian.dk/*",
    "https://*.travian.com.eg/*",
    "https://*.travian.fi/*",
    "https://*.travian.fr/*",
    "https://*.travian.gr/*",
    "https://*.travian.hk/*",
    "https://*.travian.com.hr/*",
    "https://*.travian.hu/*",
    "https://*.travian.co.id/*",
    "https://*.travian.co.il/*",
    "https://*.travian.ir/*",
    "https://*.travian.it/*",
    "https://*.travian.jp/*",
    "https://*.travian.lt/*",
    "https://*.travian.com.my/*",
    "https://*.travian.net/*",
    "https://*.travian.nl/*",
    "https://*.travian.no/*",
    "https://*.travian.pl/*",
    "https://*.travian.pt/*",
    "https://*.travian.ro/*",
    "https://*.travian.rs/*",
    "https://*.travian.ru/*",
    "https://*.travian.com.sa/*",
    "https://*.travian.se/*",
    "https://*.travian.si/*",
    "https://*.travian.sk/*",
    "https://*.travian.com.tr/*",
    "https://*.travian.tw/*",
    "https://*.travian.co.uk/*",
    "https://*.travian.us/*",
    "https://*.travian.vn/*"
];
// REQUESTS

const REQUESTS_INFO =
    {
        "others": {
            "name":"others",
            "type":"GET",
            "headers": [
                {"name": "accept", "value":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"},
                {"name": "Sec-Fetch-Dest", "value":"document"},
                {"name": "Sec-Fetch-Mode", "value":"navigate"},
                {"name": "Sec-Fetch-Site", "value":"same-origin"},
                {"name": "Sec-Fetch-User", "value":"?1"},
                {"name": "upgrade-insecure-requests", "value":"1"},
            ]
        },
        "/dorf1.php": {
            "name":"dorf1.php",
            "type":"GET",
            "headers": [
                {"name": "accept", "value":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"},
                {"name": "Sec-Fetch-Dest", "value":"document"},
                {"name": "Sec-Fetch-Mode", "value":"navigate"},
                {"name": "Sec-Fetch-Site", "value":"same-origin"},
                {"name": "Sec-Fetch-User", "value":"?1"},
                {"name": "upgrade-insecure-requests", "value":"1"},
            ]
        },
        "/dorf2.php": {
            "name":"dorf2.php",
            "type":"GET",
            "headers": [
                {"name": "accept", "value":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"},
                {"name": "Sec-Fetch-Dest", "value":"document"},
                {"name": "Sec-Fetch-Mode", "value":"navigate"},
                {"name": "Sec-Fetch-Site", "value":"same-origin"},
                {"name": "Sec-Fetch-User", "value":"?1"},
                {"name": "upgrade-insecure-requests", "value":"1"},
            ]
        },
        "/build.php": {
            "name":"build.php",
            "type":"GET",
            "headers": [
                {"name": "accept", "value":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"},
                {"name": "Sec-Fetch-Dest", "value":"document"},
                {"name": "Sec-Fetch-Mode", "value":"navigate"},
                {"name": "Sec-Fetch-Site", "value":"same-origin"},
                {"name": "Sec-Fetch-User", "value":"?1"},
                {"name": "upgrade-insecure-requests", "value":"1"},
            ]
        },
       "/login.php": {
            "name":"login.php",
            "type":"POST",
            "headers": [
                {"name": "accept", "value":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"},
                {"name": "cache-control", "value":"max-age=0"},
                {"name": "Sec-Fetch-Dest", "value":"document"},
                {"name": "Sec-Fetch-Mode", "value":"navigate"},
                {"name": "Sec-Fetch-Site", "value":"same-origin"},
                {"name": "Sec-Fetch-User", "value":"?1"},
                {"name": "upgrade-insecure-requests", "value":"1"},
            ]
        },
    };
