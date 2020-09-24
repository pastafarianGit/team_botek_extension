let Village = class {
    link;
    x;
    y;
    isCapital;
    name;

    constructor(link) {
        this.link  = link;
    }

    addParams(x, y, isCapital, name) {
        this.x  = x;
        this.y  = y;
        this.isCapital  = isCapital;
        this.name  = name;
    }

};



let Villages = class {

    constructor(villages) {
        this.allVillages = villages;
    }

    findVillage(linkId){
        for(let i = 0; i < this.allVillages.length; i++){
            const village = this.allVillages[i];
            if(village.link === linkId){
                console.log("village F", village);
                return village;
            }
        }
        return null;
    }

}
