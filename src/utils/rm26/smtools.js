import { getovrfromtemplate, getpositionid, setinitialatttributes, gkadjustment, getattributesforpos, rectifyovr, getpotential, calculatestamina, setmap } from './attributes.js';
import { getskintone, gethaircolor, getfacialhaircolor, getfacialhairtype, getheadtypecode, gethairtypecode, getshoe, getgkglove, geteyebrowcode, geteyecolorcode } from './appearance.js';
import { getfifabirthdateval, parseBirthdate, getinternationalrep, getfoot, getweakfoot } from './demographics.js';
import { nations } from './resources.js';

export let burnedplayerids = [];

export function makeplayers(templateData, settings) {
    let generatedPlayers = [];
    templateData.forEach(row => {
        let player = parsetemplateplayer({ ...row });
        
        let demo = builddemographics(
            player.height ? String(player.height).replace(/[^0-9.]/g, '') : 180, 
            player.weight ? String(player.weight).replace(/[^0-9.]/g, '') : 75, 
            player.birthdate || "01/01/2000", 
            player.foot || "Right", 
            player.weakfoot || "Bad", 
            player.finovr
        );
        let attr = buildplayerattributes(
            player.pos1, player.pos2, player.pos3, player.pos4, player.pos5, player.pos6, player.pos7,
            player.finovr, player.age,
            player.nat || player.NAT || player.Nat || "Uganda",
            settings
        );
        let gender = settings.makeWomen ? 1 : 0;
        let appearance = buildplayerappearances(gender, player.nat || player.NAT || player.Nat || "Uganda");
        
        let othr = {
            playerid: findplayerid(player.playerid || 0),
            nationality: (nations().find(nation => nation.nationname === (player.nat || player.NAT || player.Nat)) || {nationid: 146}).nationid,
            firstname: player.given || "",
            surname: player.sur || "",
            playerjerseyname: player.jersey || "",
            commonname: player.nick || "",
            firstnameid: findnameid(player.given),
            lastnameid: findnameid(player.sur),
            playerjerseynameid: findnameid(player.jersey),
            commonnameid: findnameid(player.nick),
            gkglovetypecode: getgkglove() || 73,
            eyebrowcode: (() => {
                let eyebrowcode = [30301, 60201, 2150301, 70000, 60302, 1140503, 70102, 120102, 1170502];
                return eyebrowcode[randbetween(0, eyebrowcode.length - 1)];
            })(),
            jerseystylecode: 1,
            skillmoves: player.skillmoves ? String(player.skillmoves).replace(/[^0-9.]/g, '') : 0,
            trait2: 0,
            tattooback: 0,
            accessorycode4: 0,
            gksavetype: randbetween(0, 1),
            tattooleftarm: 0,
            animpenaltiesstartposcode: 0,
            isretiring: 0,
            shoecolorcode2: 31,
            socklengthcode: randbetween(0, 2),
            finishingcode1: 0,
            accessorycode3: 0,
            accessorycolourcode1: 0,
            driref: 66,
            hasseasonaljersey: 0,
            shoetypecode: getshoe(),
            tattoohead: 0,
            tattooleftleg: 0,
            phypos: 66,
            trait1: 0,
            hashighqualityhead: 0,
            tattoorightarm: 0,
            headassetid: 267277,
            defspe: 62,
            usercaneditname: 1,
            avatarpomid: 0,
            finishingcode2: 0,
            paskic: 66,
            iscustomized: 1,
            runningcode2: 0,
            modifier: 0,
            jerseysleevelengthcode: 0,
            accessorycolourcode3: 0,
            accessorycode1: 0,
            playerjointeamdate: getfifabirthdateval(player.joindate) || 160273,
            headclasscode: 1,
            tattoofront: 0,
            gkkickstyle: 0,
            accessorycolourcode4: 0,
            headvariation: 0,
            skillmoveslikelihood: 2,
            shohan: 60,
            shortstyle: 0,
            smallsidedshoetypecode: 503,
            emotion: 2,
            runstylecode: 0,
            jerseyfit: 0,
            accessorycode2: 0,
            shoedesigncode: 0,
            shoecolorcode1: 30,
            hairstylecode: 0,
            bodytypecode: player.height ? (String(player.height).replace(/[^0-9.]/g, '') <= 170 ? 8 : (String(player.height).replace(/[^0-9.]/g, '') >= 185 ? 5 : 2)) : 2,
            pacdiv: 60,
            runningcode1: 0,
            accessorycolourcode2: 0,
            tattoorightleg: 0,
            faceposerpreset: randbetween(0, 4),
            contractvaliduntil: player.contract ? String(player.contract).replace(/[^0-9.]/g, '') : randbetween(2026, 2029),
            icontrait1: 0,
            icontrait2: 0,
            muscularitycode: 0,
            animfreekickstartposcode: 0,
            lipcolor: 0,
            skinsurfacepack: 100000,
            undershortstyle: 0,
            skinmakeup: 0,
            eyedetail: randbetween(1, 6),
            skincomplexion: randbetween(1, 10),
            role1: (player.pos1 === 0) ? randbetween(1, 2) :
                   (player.pos1 === 3) ? randbetween(3, 6) :
                   (player.pos1 === 7) ? randbetween(7, 10) :
                   (player.pos1 === 5) ? randbetween(11, 13) :
                   (player.pos1 === 10) ? randbetween(14, 16) :
                   (player.pos1 === 14) ? randbetween(18, 22) :
                   (player.pos1 === 12) ? randbetween(23, 26) :
                   (player.pos1 === 16) ? randbetween(27, 30) :
                   (player.pos1 === 18) ? randbetween(31, 33) :
                   (player.pos1 === 23) ? randbetween(35, 37) :
                   (player.pos1 === 27) ? randbetween(38, 40) :
                   (player.pos1 === 25) ? randbetween(41, 44) : 0,
            role2: 0, role3: 0, role4: 0, role5: 0,
            sockstylecode: randbetween(0, 1),
            facepsdlayer0: randbetween(0, 4),
            facepsdlayer1: randbetween(0, 4),
        };

        let fullPlayer = {
            ...player,
            ...demo,
            ...attr,
            ...appearance,
            ...othr
        };
        
        generatedPlayers.push(fullPlayer);
    });
    return generatedPlayers;
}

export function playerstableobjtostring26(obj){
    const keysorder=["firstnameid","lastnameid","playerjerseynameid","commonnameid","role4","role3","gkglovetypecode","role5","role2","role1","eyebrowcode","skintypecode","haircolorcode","facialhairtypecode","curve","jerseystylecode","agility","tattooback","accessorycode4","gksavetype","positioning","tattooleftarm","hairtypecode","facepsdlayer0","standingtackle","preferredposition3","longpassing","penalties","animfreekickstartposcode","lipcolor","isretiring","longshots","gkdiving","icontrait2","interceptions","shoecolorcode2","crossing","potential","gkreflexes","finishingcode1","reactions","composure","skinsurfacepack","vision","contractvaliduntil","finishing","dribbling","slidingtackle","accessorycode3","preferredposition5","accessorycolourcode1","headtypecode","driref","sprintspeed","undershortstyle","height","hasseasonaljersey","tattoohead","preferredposition2","strength","shoetypecode","birthdate","preferredposition1","tattooleftleg","skinmakeup","ballcontrol","phypos","shotpower","trait1","socklengthcode","weight","hashighqualityhead","eyedetail","tattoorightarm","icontrait1","balance","gender","headassetid","gkkicking","defspe","internationalrep","preferredposition6","shortpassing","freekickaccuracy","skillmoves","faceposerpreset","usercaneditname","avatarpomid","finishingcode2","aggression","acceleration","paskic","headingaccuracy","iscustomized","preferredposition7","runningcode2","modifier","gkhandling","eyecolorcode","jerseysleevelengthcode","sockstylecode","accessorycolourcode3","accessorycode1","playerjointeamdate","headclasscode","tattoofront","nationality","preferredfoot","sideburnscode","weakfootabilitytypecode","jumping","personality","gkkickstyle","stamina","playerid","accessorycolourcode4","gkpositioning","headvariation","skillmoveslikelihood","trait2","shohan","skintonecode","shortstyle","overallrating","smallsidedshoetypecode","emotion","runstylecode","facepsdlayer1","muscularitycode","skincomplexion","jerseyfit","accessorycode2","shoedesigncode","shoecolorcode1","hairstylecode","bodytypecode","animpenaltiesstartposcode","pacdiv","defensiveawareness","runningcode1","preferredposition4","volleys","accessorycolourcode2","tattoorightleg","facialhaircolorcode"];

    const headerrow = keysorder.join('\t');
    const allrows = [headerrow];

    Object.keys(obj).forEach(nestedobjectkey => {
        const nestedobj = obj[nestedobjectkey];
        const valuesrow = keysorder.map(key => {
            return String(nestedobj[key] !== undefined ? nestedobj[key] : '');
        }).join('\t');
        allrows.push(valuesrow);
    });

    return allrows.join('\n');
}

export function editedplayernamesobjtostring26(obj) {
  const headers = ['firstname', 'commonname', 'playerjerseyname', 'surname', 'playerid'];
  const headerRow = headers.join('\t');
  const allRows = [headerRow];
  Object.keys(obj).forEach(nestedobjectkey => {
      const player = obj[nestedobjectkey];
      const valuesRow = headers.map(header => {
          return String(player[header] !== undefined ? player[header] : '');
      }).join('\t');
      allRows.push(valuesRow);
  });
  return allRows.join('\n');
}

export function findnameid(name) {
  return 0;
}

export function findplayerid(input){
  if(input!=0){
    if(!burnedplayerids.find(x=>input==x)){
      return input;
    }
  }

  let startpt=1;
  if(input!=0){
    startpt=input;
  }
  
  for(let i=startpt;i<500000;i++){
    if(burnedplayerids.includes(i)){continue}else{
      burnedplayerids.push(i);
      return i;
    }
  }
}

export function randbetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function returninrange(min, max, val) {
    return Math.max(min, Math.min(max, val));
}

export function calculateage(birthdate, targetDate) {
    let bd = new Date(birthdate);
    let td = new Date(targetDate);
    let age = td.getFullYear() - bd.getFullYear();
    if (td.getMonth() < bd.getMonth() || (td.getMonth() === bd.getMonth() && td.getDate() < bd.getDate())) {
        age--;
    }
    return age;
}

export function buildplayerattributes(pos1, pos2, pos3, pos4, pos5, pos6, pos7, baseOvr, age, nationname, settings) {
    const mappedPos = setmap(pos1 ?? 14);

    // INJECT OPTIMISTIC CALCULATION BEFORE STAT GENERATION
    let ovr = baseOvr;
    if (settings && settings.optimisticMode) {
        ovr = Math.min(99, baseOvr + settings.boostAmount);
    }

    let attr = setinitialatttributes(ovr, mappedPos);
    attr = gkadjustment(pos1, pos2, pos3, pos4, ovr, attr);

    attr = getattributesforpos(pos4, ovr, attr);
    attr = getattributesforpos(pos3, ovr, attr);
    attr = getattributesforpos(pos2, ovr, attr);
    attr = getattributesforpos(pos1, ovr, attr); 

    attr.stamina = calculatestamina(ovr, pos1);

    attr = rectifyovr(pos1, attr, ovr);

    attr.overallrating = ovr;
    attr.potential = getpotential(age, ovr, pos1, pos2, pos3, pos4, nationname);

    attr.preferredposition1 = pos1 ?? 14;
    attr.preferredposition2 = pos2 ?? -1;
    attr.preferredposition3 = pos3 ?? -1;
    attr.preferredposition4 = pos4 ?? -1;
    attr.preferredposition5 = pos5 ?? -1;
    attr.preferredposition6 = pos6 ?? -1;
    attr.preferredposition7 = pos7 ?? -1;

    return attr;
}

export function buildplayerappearances(gender, nationname){

    let nation = nations().find(n=>n.nation==nationname);
    if(!nation){
        nation= nations()[145];
    }

    let skintone = getskintone(nation);
    let haircolor=gethaircolor(skintone);
    let facialhaircolor=getfacialhaircolor(haircolor);

    let appearance = {
        skintonecode: skintone || 5,
        haircolorcode: haircolor,
        facialhaircolorcode: facialhaircolor,
        facialhairtypecode: getfacialhairtype(gender),
        headtypecode: getheadtypecode(nation),
        hairtypecode: gethairtypecode(skintone),
        shoe: getshoe(),
        gkglove: getgkglove(),
        skintypecode: 0,
        sideburnscode: 0,
        eyebrowcode: geteyebrowcode()||0,
        eyecolorcode: geteyecolorcode(skintone)||8,
        gender: gender || 0
    }

    return appearance;
}

export function builddemographics(height, weight, birthdate, foot, weakfoot, ovr){
    
   let demo={
        height: height || 180,
        weight: weight || 75,
        birthdate: getfifabirthdateval(birthdate) || 141428,
        internationalrep: getinternationalrep(ovr) || 1 ,
        preferredfoot: getfoot(foot) || 1,
        personality: randbetween(1,5) || 3,
        weakfootabilitytypecode: getweakfoot(weakfoot) || 2
    };

    return demo;
}

export function parsetemplateplayer(player){
    let cleanOvr = player.ovr ? parseInt(String(player.ovr).replace(/[^0-9.]/g, ''), 10) : null;
    let cleanTransferValue = player.transfervalue ? parseInt(String(player.transfervalue).replace(/[^0-9.]/g, ''), 10) : null;
    
    player.finovr = getovrfromtemplate(cleanOvr, cleanTransferValue) || 60; 

    const rawBd = player.birthdate || player.Birthdate || player.birthDate;
    const parsedBd = parseBirthdate(rawBd);
    const cleanBdString = parsedBd
        ? `${parsedBd.year}-${String(parsedBd.month).padStart(2,'0')}-${String(parsedBd.day).padStart(2,'0')}`
        : '2000-01-01';
    player.age = calculateage(cleanBdString, '2026-01-01');
    player.birthdate = cleanBdString;

    player.pos1=getpositionid(player.pos1, true);
    player.pos2=getpositionid(player.pos2, false);
    player.pos3=getpositionid(player.pos3, false);
    player.pos4=getpositionid(player.pos4, false);
    player.pos5=getpositionid(player.pos5, false);
    player.pos6=getpositionid(player.pos6, false);
    player.pos7=getpositionid(player.pos7, false);

    return player;
}