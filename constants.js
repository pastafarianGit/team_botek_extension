const EXTENSION_ID = "llkkcbnopngmldfgmlhepcbfpoooeaka";

const BUILD_TYPE = "build_dorf1";
const ANALYSE_TYPE = "build_dorf1";

const BASE_URL = "https://tx3.balkans.travian.com/";
const DORF1_URL = BASE_URL + "dorf1.php";
const DORF2_URL = BASE_URL + "dorf2.php";
const BUILD_URL = BASE_URL + "build.php?id=";

const ERROR_BUILDING_C = "no value c";


const REGEX_VILLAGE_NAME = "<span class=\"name\">(.*)<\\/span>";
const REGEX_COORDINATE_X = "<span class=\"coordinateX\">\\((.*)</span><span class=\"coordinatePipe\">";
const REGEX_COORDINATE_Y = "<span class=\"coordinateY\">(.*)\\)";

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


