let romanTroops = [
  {
    "name": "Legionnaire",
    "attackPower": 40,
    "defenceAgainstInfantry": 35,
    "defenceAgainstCavalry": 50,
    "cropConsumption": 1,
    "speed": 6,
    "carryAmount": 50
  },
  {
    "name": "Praetorian",
    "attackPower": 30,
    "defenceAgainstInfantry": 65,
    "defenceAgainstCavalry": 35,
    "cropConsumption": 1,
    "speed": 5,
    "carryAmount": 20
  },
  {
    "name": "Imperian",
    "attackPower": 70,
    "defenceAgainstInfantry": 40,
    "defenceAgainstCavalry": 25,
    "cropConsumption": 1,
    "speed": 7,
    "carryAmount": 50
  },
  {
    "name": "Equites Legati",
    "attackPower": 0,
    "defenceAgainstInfantry": 20,
    "defenceAgainstCavalry": 10,
    "cropConsumption": 2,
    "speed": 16,
    "carryAmount": 0
  },
  {
    "name": "Equites Imperatoris",
    "attackPower": 120,
    "defenceAgainstInfantry": 65,
    "defenceAgainstCavalry": 50,
    "cropConsumption": 3,
    "speed": 14,
    "carryAmount": 100
  },
  {
    "name": "Equites Caesaris",
    "attackPower": 180,
    "defenceAgainstInfantry": 80,
    "defenceAgainstCavalry": 105,
    "cropConsumption": 4,
    "speed": 10,
    "carryAmount": 70
  },
  {
    "name": "Battering Ram",
    "attackPower": 60,
    "defenceAgainstInfantry": 30,
    "defenceAgainstCavalry": 75,
    "cropConsumption": 3,
    "speed": 4,
    "carryAmount": 0
  },
  {
    "name": "Fire Catapult",
    "attackPower": 75,
    "defenceAgainstInfantry": 60,
    "defenceAgainstCavalry": 10,
    "cropConsumption": 6,
    "speed": 3,
    "carryAmount": 0
  },
  {
    "name": "Senator",
    "attackPower": 50,
    "defenceAgainstInfantry": 40,
    "defenceAgainstCavalry": 30,
    "cropConsumption": 5,
    "speed": 4,
    "carryAmount": 0
  },
  {
    "name": "Settler",
    "attackPower": 0,
    "defenceAgainstInfantry": 80,
    "defenceAgainstCavalry": 80,
    "cropConsumption": 1,
    "speed": 5,
    "carryAmount": 3000
  }
];

let teutonTroops = [
  {
    "name": "Clubswinger",
    "attackPower": 40,
    "defenceAgainstInfantry": 20,
    "defenceAgainstCavalry": 5,
    "cropConsumption": 1,
    "speed": 7,
    "carryAmount": 60
  },
  {
    "name": "Spearman",
    "attackPower": 10,
    "defenceAgainstInfantry": 35,
    "defenceAgainstCavalry": 60,
    "cropConsumption": 1,
    "speed": 7,
    "carryAmount": 40
  },
  {
    "name": "Axeman",
    "attackPower": 60,
    "defenceAgainstInfantry": 30,
    "defenceAgainstCavalry": 30,
    "cropConsumption": 1,
    "speed": 6,
    "carryAmount": 50
  },
  {
    "name": "Scout",
    "attackPower": 0,
    "defenceAgainstInfantry": 10,
    "defenceAgainstCavalry": 5,
    "cropConsumption": 1,
    "speed": 9,
    "carryAmount": 0
  },
  {
    "name": "Paladin",
    "attackPower": 55,
    "defenceAgainstInfantry": 100,
    "defenceAgainstCavalry": 40,
    "cropConsumption": 2,
    "speed": 10,
    "carryAmount": 110
  },
  {
    "name": "Teutonic Knight",
    "attackPower": 150,
    "defenceAgainstInfantry": 50,
    "defenceAgainstCavalry": 75,
    "cropConsumption": 3,
    "speed": 9,
    "carryAmount": 80
  },
  {
    "name": "Ram",
    "attackPower": 65,
    "defenceAgainstInfantry": 30,
    "defenceAgainstCavalry": 80,
    "cropConsumption": 3,
    "speed": 4,
    "carryAmount": 0
  },
  {
    "name": "Catapult",
    "attackPower": 50,
    "defenceAgainstInfantry": 60,
    "defenceAgainstCavalry": 10,
    "cropConsumption": 6,
    "speed": 3,
    "carryAmount": 0
  },
  {
    "name": "Chief",
    "attackPower": 40,
    "defenceAgainstInfantry": 60,
    "defenceAgainstCavalry": 40,
    "cropConsumption": 4,
    "speed": 4,
    "carryAmount": 0
  },
  {
    "name": "Settler",
    "attackPower": 10,
    "defenceAgainstInfantry": 80,
    "defenceAgainstCavalry": 80,
    "cropConsumption": 1,
    "speed": 5,
    "carryAmount": 3000
  }
];

let gaulTroops = [
  {
    "name": "Phalanx",
    "attackPower": 15,
    "defenceAgainstInfantry": 40,
    "defenceAgainstCavalry": 50,
    "cropConsumption": 1,
    "speed": 7,
    "carryAmount": 35
  },
  {
    "name": "Swordsman",
    "attackPower": 65,
    "defenceAgainstInfantry": 35,
    "defenceAgainstCavalry": 20,
    "cropConsumption": 1,
    "speed": 6,
    "carryAmount": 45
  },
  {
    "name": "Pathfinder",
    "attackPower": 0,
    "defenceAgainstInfantry": 20,
    "defenceAgainstCavalry": 10,
    "cropConsumption": 2,
    "speed": 17,
    "carryAmount": 0
  },
  {
    "name": "Theutates Thunder",
    "attackPower": 90,
    "defenceAgainstInfantry": 25,
    "defenceAgainstCavalry": 40,
    "cropConsumption": 2,
    "speed": 19,
    "carryAmount": 75
  },
  {
    "name": "Druidrider",
    "attackPower": 45,
    "defenceAgainstInfantry": 115,
    "defenceAgainstCavalry": 55,
    "cropConsumption": 2,
    "speed": 16,
    "carryAmount": 35
  },
  {
    "name": "Haeduan",
    "attackPower": 140,
    "defenceAgainstInfantry": 60,
    "defenceAgainstCavalry": 165,
    "cropConsumption": 3,
    "speed": 13,
    "carryAmount": 65
  },
  {
    "name": "Ram",
    "attackPower": 50,
    "defenceAgainstInfantry": 30,
    "defenceAgainstCavalry": 105,
    "cropConsumption": 3,
    "speed": 4,
    "carryAmount": 0
  },
  {
    "name": "Trebuchet",
    "attackPower": 70,
    "defenceAgainstInfantry": 45,
    "defenceAgainstCavalry": 10,
    "cropConsumption": 6,
    "speed": 3,
    "carryAmount": 0
  },
  {
    "name": "Chieftain",
    "attackPower": 40,
    "defenceAgainstInfantry": 50,
    "defenceAgainstCavalry": 50,
    "cropConsumption": 4,
    "speed": 5,
    "carryAmount": 0
  },
  {
    "name": "Settler",
    "attackPower": 0,
    "defenceAgainstInfantry": 80,
    "defenceAgainstCavalry": 80,
    "cropConsumption": 1,
    "speed": 5,
    "carryAmount": 3000
  }
];

let natureTroops = [
  {
    "name": "Rat",
    "attackPower": 10,
    "defenceAgainstInfantry": 25,
    "defenceAgainstCavalry": 20,
    "cropConsumption": 1,
    "speed": 20,
    "carryAmount": 10
  },
  {
    "name": "Spider",
    "attackPower": 20,
    "defenceAgainstInfantry": 35,
    "defenceAgainstCavalry": 40,
    "cropConsumption": 1,
    "speed": 20,
    "carryAmount": 10
  },
  {
    "name": "Snake",
    "attackPower": 60,
    "defenceAgainstInfantry": 40,
    "defenceAgainstCavalry": 60,
    "cropConsumption": 1,
    "speed": 20,
    "carryAmount": 10
  },
  {
    "name": "Bat",
    "attackPower": 80,
    "defenceAgainstInfantry": 66,
    "defenceAgainstCavalry": 50,
    "cropConsumption": 1,
    "speed": 20,
    "carryAmount": 10
  },
  {
    "name": "Wild Boar",
    "attackPower": 50,
    "defenceAgainstInfantry": 70,
    "defenceAgainstCavalry": 33,
    "cropConsumption": 2,
    "speed": 20,
    "carryAmount": 10
  },
  {
    "name": "Wolf",
    "attackPower": 100,
    "defenceAgainstInfantry": 80,
    "defenceAgainstCavalry": 70,
    "cropConsumption": 2,
    "speed": 20,
    "carryAmount": 10
  },
  {
    "name": "Bear",
    "attackPower": 250,
    "defenceAgainstInfantry": 140,
    "defenceAgainstCavalry": 200,
    "cropConsumption": 3,
    "speed": 20,
    "carryAmount": 1000
  },
  {
    "name": "Crocodile",
    "attackPower": 450,
    "defenceAgainstInfantry": 380,
    "defenceAgainstCavalry": 240,
    "cropConsumption": 3,
    "speed": 20,
    "carryAmount": 10
  },
  {
    "name": "Tiger",
    "attackPower": 200,
    "defenceAgainstInfantry": 170,
    "defenceAgainstCavalry": 250,
    "cropConsumption": 3,
    "speed": 20,
    "carryAmount": 10
  },
  {
    "name": "Elephant",
    "attackPower": 600,
    "defenceAgainstInfantry": 440,
    "defenceAgainstCavalry": 520,
    "cropConsumption": 5,
    "speed": 20,
    "carryAmount": 10
  }
];

let natarTroops = [
  {
    "name": "Pikeman",
    "attackPower": 20,
    "defenceAgainstInfantry": 35,
    "defenceAgainstCavalry": 50,
    "cropConsumption": 1,
    "speed": 6,
    "carryAmount": 10
  },
  {
    "name": "Thorned Warrior",
    "attackPower": 65,
    "defenceAgainstInfantry": 30,
    "defenceAgainstCavalry": 10,
    "cropConsumption": 1,
    "speed": 7,
    "carryAmount": 10
  },
  {
    "name": "Guardsman",
    "attackPower": 100,
    "defenceAgainstInfantry": 90,
    "defenceAgainstCavalry": 75,
    "cropConsumption": 1,
    "speed": 6,
    "carryAmount": 10
  },
  {
    "name": "Birds of Prey",
    "attackPower": 0,
    "defenceAgainstInfantry": 10,
    "defenceAgainstCavalry": 0,
    "cropConsumption": 1,
    "speed": 25,
    "carryAmount": 10
  },
  {
    "name": "Axerider",
    "attackPower": 155,
    "defenceAgainstInfantry": 80,
    "defenceAgainstCavalry": 50,
    "cropConsumption": 2,
    "speed": 14,
    "carryAmount": 10
  },
  {
    "name": "Natarian Knight",
    "attackPower": 170,
    "defenceAgainstInfantry": 140,
    "defenceAgainstCavalry": 80,
    "cropConsumption": 3,
    "speed": 12,
    "carryAmount": 10
  },
  {
    "name": "Warelephant",
    "attackPower": 250,
    "defenceAgainstInfantry": 120,
    "defenceAgainstCavalry": 150,
    "cropConsumption": 6,
    "speed": 5,
    "carryAmount": 10
  },
  {
    "name": "Ballista",
    "attackPower": 60,
    "defenceAgainstInfantry": 45,
    "defenceAgainstCavalry": 10,
    "cropConsumption": 5,
    "speed": 3,
    "carryAmount": 10
  },
  {
    "name": "Natarian Emperor",
    "attackPower": 80,
    "defenceAgainstInfantry": 50,
    "defenceAgainstCavalry": 50,
    "cropConsumption": 1,
    "speed": 5,
    "carryAmount": 10
  },
  {
    "name": "Settler",
    "attackPower": 30,
    "defenceAgainstInfantry": 40,
    "defenceAgainstCavalry": 40,
    "cropConsumption": 1,
    "speed": 5,
    "carryAmount": 3000
  }
];

