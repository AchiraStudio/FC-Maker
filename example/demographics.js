function getinternationalrep(ovr){
    let internationalrep = 1;
    if(ovr>70){internationalrep=2}
    if(ovr>75){internationalrep=3}
    if(ovr>81){internationalrep=4}
    if(ovr>86){internationalrep=5}

    return internationalrep;
}

function getfoot(foottext){
    switch(foottext){
        case "Right" ||"right" || "r" || "R": 
            return 1;
        case "Left" || "left" || "l" ||"L": 
            return 2;
        default: 
            return 1;
    }
}

function getweakfoot(weakfoot){
    switch(weakfoot){
        case "Terrible": return 1;
        case "Bad": return 2;
        case "Average": return 3;
        case "Good": return 4;
        case "Excellent": return 5;
        default: 
            return 2;
    }
}

function getposition(positionstring){
    let pos = positions().find(x=>x.position==positionstring);
    if(pos){return pos.id;}else{return -1;}
}

function getfifabirthdateval(rawdate){
    return Math.trunc((new Date(rawdate)/86400000)+141428);
}