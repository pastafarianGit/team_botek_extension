// FRONTEND
const BUILD_PATH_F = "/build.php";
const XPATH_ACTIVE_VILLAGE_F = '//*[@id="sidebarBoxVillagelist"]/div[2]/ul/li[@class=" active"]/a';
const REGEX_VILLAGE_LINK_F = 'newdid=(.*)&';


const MAX_RESOURCE_LVL = 10;
const MAX_CAPITAL_RESOURCE_LVL = 20;


const BUILDING_GID = "gid";
const BUILDING_AID = "aid";
const BUILDING_LEVEL = "level";
const BUILDING_LOCATION_ID = "buildingSlot";




// BACKEND
const EXTENSION_ID = "llkkcbnopngmldfgmlhepcbfpoooeaka";

const BUILD_TYPE = "build_dorf1";
const ANALYSE_TYPE = "build_dorf1";

const BASE_URL = "https://tx3.balkans.travian.com/";
const DORF1_URL = BASE_URL + "dorf1.php";
const DORF2_URL = BASE_URL + "dorf2.php";
const BUILD_URL = BASE_URL + "build.php?id=";
const PROFILE_URL = BASE_URL + "/profile";

const NEW_DID_PARAM = "?newdid="

const ERROR_BUILDING_C = "no value c";


const REGEX_VILLAGE_NAME = "<span class=\"name\">(.*)<\\/span>";
/*const REGEX_COORDINATE_X = "<span class=\"coordinateX\">\\((.*)</span><span class=\"coordinatePipe\">";
const REGEX_COORDINATE_Y = "<span class=\"coordinateY\">(.*)\\)";*/
const REGEX_COORDINATE_XY = "(−?‭\\d+)";
const XPATH_PROFILE_VILLAGES = "//*[@id='villages']/tbody/tr";
const REGEX_VILLAGE_LINK = '<a  href="\\?newdid=(.*)&';
const REGEX_RESOURCES_VAR = ' var resources = (\\{.*?)<\\/script>';
const REGEX_DORF2_BUILDING_LOCATION = 'a(\\d\\d)';
const REGEX_DORF2_BUILDING_TYPE = 'g(\\d+)';




// REQUESTS

const REQUESTS_INFO =
    {
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
    };
