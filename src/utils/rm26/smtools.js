// /───────────────────── src/utils/rm26/smtools.js ──────────────────────/

import { getovrfromtemplate, getpositionid, setinitialatttributes, gkadjustment, getattributesforpos, rectifyovr, getpotential, calculatestamina, setmap } from './attributes.js';
import { getskintone, gethaircolor, getfacialhaircolor, getfacialhairtype, getheadtypecode, gethairtypecode, getshoe, getgkglove, geteyebrowcode, geteyecolorcode } from './appearance.js';
import { getfifabirthdateval, parseBirthdate, getinternationalrep, getfoot, getweakfoot } from './demographics.js';
import { nations } from './resources.js';

export let burnedplayerids = [];

export function fixMojibake(str) {
  if (typeof str !== 'string') return str;
  // If the string contains Mojibake patterns (UTF-8 bytes mis-read as Latin-1),
  // recover by treating each char as a byte and re-decoding as UTF-8.
  try {
    // Build a byte array from the char codes (works when chars are Latin-1 range)
    const bytes = new Uint8Array(str.length);
    let needsFix = false;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      bytes[i] = code & 0xFF;
      // 0xC3/0xC2 followed by a continuation byte is a tell-tale UTF-8 sequence
      if (code === 0xC3 || code === 0xC2) needsFix = true;
    }
    if (!needsFix) return str;
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch(e) { return str; }
}

// Encode a JS string to UTF-8 with BOM so Excel and modern game tools read special characters correctly.
export function encodeUTF8WithBOM(str) {
  const utf8Bytes = new TextEncoder().encode(str);
  const bytesWithBOM = new Uint8Array(utf8Bytes.length + 3);
  bytesWithBOM[0] = 0xEF;
  bytesWithBOM[1] = 0xBB;
  bytesWithBOM[2] = 0xBF;
  bytesWithBOM.set(utf8Bytes, 3);
  return bytesWithBOM;
}

// ── Case-insensitive field getter (no Unicode changes) ─────────────────
function getFieldCI(obj, name) {
    const key = Object.keys(obj).find(k => k.toLowerCase() === name.toLowerCase());
    return key ? obj[key] : undefined;
}

// ── Nationality alias normalisation (preserves original display name) ──
const NATIONALITY_ALIASES = {
    'north korea':              'Korea DPR',
    'south korea':              'Korea Republic',
    'republic of korea':        'Korea Republic',
    'dprk':                     'Korea DPR',
    'ivory coast':              "Côte d'Ivoire",
    "cote d'ivoire":            "Côte d'Ivoire",
    'netherlands':              'Holland',
    'the netherlands':          'Holland',
    'united states':            'United States',
    'usa':                      'United States',
    'republic of ireland':      'Republic of Ireland',
    'ireland':                  'Republic of Ireland',
    'czechia':                  'Czech Republic',
    'chinese taipei':           'Chinese Taipei',
    'taiwan':                   'Chinese Taipei',
    'north macedonia':          'North Macedonia',
    'bosnia':                   'Bosnia and Herzegovina',
    'trinidad & tobago':        'Trinidad and Tobago',
    'democratic republic of congo': 'Congo DR',
    'dr congo':                 'Congo DR',
};

function normaliseNationality(raw) {
    if (!raw) return null;
    const trimmed = String(raw).trim();
    const lower = trimmed.toLowerCase();
    // Return aliased name (with original Unicode characters) or the trimmed string
    return NATIONALITY_ALIASES[lower] || trimmed;
}

// ── Main generation function ───────────────────────────────────────────
export function makeplayers(templateData, settings) {
    let generatedPlayers = [];
    templateData.forEach(row => {
        let player = parsetemplateplayer({ ...row });
        
        const natName = player.nat || 'Uganda';

        let demo = builddemographics(
            player.height,
            player.weight,
            player.birthdate || '01/01/2000',
            player.foot,
            player.weakfoot || 'Bad',
            player.finovr
        );
        let attr = buildplayerattributes(
            player.pos1, player.pos2, player.pos3, player.pos4, player.pos5, player.pos6, player.pos7,
            player.finovr, player.age,
            natName,
            settings
        );
        let gender = settings.makeWomen ? 1 : 0;
        let appearance = buildplayerappearances(gender, natName);
        
        let othr = {
            playerid: findplayerid(player.playerid || 0),
            nationality: (nations().find(nation => nation.nation.toLowerCase() === natName.toLowerCase()) || {nationid: 146}).nationid,
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

// ── Export players to TXT (tab-separated, Windows-1252) ─────────────────
export function playerstableobjtostring26(obj){
    const keysorder=[
        "firstnameid","lastnameid","playerjerseynameid","commonnameid","role4","role3","gkglovetypecode","role5","role2","role1",
        "eyebrowcode","skintypecode","haircolorcode","facialhairtypecode","curve","jerseystylecode","agility","tattooback",
        "accessorycode4","gksavetype","positioning","tattooleftarm","hairtypecode","facepsdlayer0","standingtackle",
        "preferredposition3","longpassing","penalties","animfreekickstartposcode","lipcolor","isretiring","longshots","gkdiving",
        "icontrait2","interceptions","shoecolorcode2","crossing","potential","gkreflexes","finishingcode1","reactions","composure",
        "skinsurfacepack","vision","contractvaliduntil","finishing","dribbling","slidingtackle","accessorycode3","preferredposition5",
        "accessorycolourcode1","headtypecode","driref","sprintspeed","undershortstyle","height","hasseasonaljersey","tattoohead",
        "preferredposition2","strength","shoetypecode","birthdate","preferredposition1","tattooleftleg","skinmakeup","ballcontrol",
        "phypos","shotpower","trait1","socklengthcode","weight","hashighqualityhead","eyedetail","tattoorightarm","icontrait1",
        "balance","gender","headassetid","gkkicking","defspe","internationalrep","preferredposition6","shortpassing","freekickaccuracy",
        "skillmoves","faceposerpreset","usercaneditname","avatarpomid","finishingcode2","aggression","acceleration","paskic",
        "headingaccuracy","iscustomized","preferredposition7","runningcode2","modifier","gkhandling","eyecolorcode",
        "jerseysleevelengthcode","sockstylecode","accessorycolourcode3","accessorycode1","playerjointeamdate","headclasscode",
        "tattoofront","nationality","preferredfoot","sideburnscode","weakfootabilitytypecode","jumping","personality","gkkickstyle",
        "stamina","playerid","accessorycolourcode4","gkpositioning","headvariation","skillmoveslikelihood","trait2","shohan",
        "skintonecode","shortstyle","overallrating","smallsidedshoetypecode","emotion","runstylecode","facepsdlayer1",
        "muscularitycode","skincomplexion","jerseyfit","accessorycode2","shoedesigncode","shoecolorcode1","hairstylecode",
        "bodytypecode","animpenaltiesstartposcode","pacdiv","defensiveawareness","runningcode1","preferredposition4","volleys",
        "accessorycolourcode2","tattoorightleg","facialhaircolorcode"
    ];

    const headerrow = keysorder.join('\t');
    const allrows = [headerrow];

    Object.keys(obj).forEach(nestedobjectkey => {
        const nestedobj = obj[nestedobjectkey];
        const valuesrow = keysorder.map(key => {
            let val = nestedobj[key] !== undefined ? nestedobj[key] : '';
            // Ensure strings are preserved as UTF-8 (no extra processing needed)
            return String(val);
        }).join('\t');
        allrows.push(valuesrow);
    });

    return allrows.join('\n');
}

// Returns a UTF-8 Uint8Array with BOM suitable for Blob output
export function playerstableobjtostring26Bytes(obj) {
  return encodeUTF8WithBOM(playerstableobjtostring26(obj));
}

export function editedplayernamesobjtostring26(obj) {
    const headers = ['firstname', 'commonname', 'playerjerseyname', 'surname', 'playerid'];
    const headerRow = headers.join('\t');
    const allRows = [headerRow];
    Object.keys(obj).forEach(nestedobjectkey => {
        const player = obj[nestedobjectkey];
        const valuesRow = headers.map(header => {
            let val = player[header] !== undefined ? player[header] : '';
            return String(val);
        }).join('\t');
        allRows.push(valuesRow);
    });
    return allRows.join('\n');
}

// Returns a UTF-8 Uint8Array with BOM suitable for Blob output
export function editedplayernamesobjtostring26Bytes(obj) {
  return encodeUTF8WithBOM(editedplayernamesobjtostring26(obj));
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
    let nation = nations().find(n=>n.nation.toLowerCase() === nationname.toLowerCase());
    if(!nation){
        nation= nations()[145];
    }
    let skintone = getskintone(nation);
    let haircolor = gethaircolor(skintone);
    let facialhaircolor = getfacialhaircolor(haircolor);
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

// ── Template row parser: preserves UTF‑8 characters ─────────────────────
export function parsetemplateplayer(player){
    // OVR / Transfer Value
    let cleanOvr = getFieldCI(player, 'ovr');
    cleanOvr = cleanOvr ? parseInt(String(cleanOvr).replace(/[^0-9.]/g, ''), 10) : null;
    let cleanTransferValue = getFieldCI(player, 'transfervalue') || getFieldCI(player, 'transfer_value');
    cleanTransferValue = cleanTransferValue ? String(cleanTransferValue).trim() : null;
    let templateOvr = getovrfromtemplate(cleanOvr, cleanTransferValue);
    player.finovr = templateOvr ? templateOvr : randbetween(55, 75);

    // Nationality (with alias mapping, preserving Unicode)
    const rawNat = getFieldCI(player, 'nat') || getFieldCI(player, 'nationality');
    player.nat = normaliseNationality(rawNat) || 'Uganda';

    // Birthdate (parse or random)
    const rawBd = getFieldCI(player, 'birthdate') || getFieldCI(player, 'birthDate');
    const parsedBd = parseBirthdate(rawBd);
    let cleanBdString;
    if (parsedBd) {
        cleanBdString = `${parsedBd.year}-${String(parsedBd.month).padStart(2,'0')}-${String(parsedBd.day).padStart(2,'0')}`;
    } else {
        const randomYear = randbetween(1991, 2008);
        const randomMonth = randbetween(1, 12);
        const randomDay = randbetween(1, 28);
        cleanBdString = `${randomYear}-${String(randomMonth).padStart(2,'0')}-${String(randomDay).padStart(2,'0')}`;
    }
    player.age = calculateage(cleanBdString, '2026-01-01');
    player.birthdate = cleanBdString;

    // Height & weight (numeric)
    const rawH = getFieldCI(player, 'height');
    const cleanH = rawH ? parseInt(String(rawH).replace(/[^0-9.]/g, ''), 10) : NaN;
    player.height = (!isNaN(cleanH) && cleanH > 0) ? cleanH : randbetween(165, 180);
    const rawW = getFieldCI(player, 'weight');
    const cleanW = rawW ? parseInt(String(rawW).replace(/[^0-9.]/g, ''), 10) : NaN;
    player.weight = (!isNaN(cleanW) && cleanW > 0) ? cleanW : randbetween(65, 85);

    // Foot (case‑insensitive, but keep original string for mapping)
    const rawFoot = getFieldCI(player, 'foot') || getFieldCI(player, 'preferredfoot');
    const cleanFoot = rawFoot ? String(rawFoot).trim() : '';
    player.foot = cleanFoot.length > 0 ? cleanFoot : (Math.random() < 0.75 ? 'Right' : 'Left');
    const rawWF = getFieldCI(player, 'weakfoot') || getFieldCI(player, 'weak_foot');
    player.weakfoot = rawWF ? String(rawWF).trim() : 'Bad';

    // Name fields – preserve exactly as given but fix Mojibake (e.g. 'MoÃ¯se' -> 'Moïse')
    player.given  = fixMojibake(getFieldCI(player, 'given')  || getFieldCI(player, 'firstname')  || '');
    player.sur    = fixMojibake(getFieldCI(player, 'sur')    || getFieldCI(player, 'surname')    || getFieldCI(player, 'lastname') || '');
    player.jersey = fixMojibake(getFieldCI(player, 'jersey') || getFieldCI(player, 'jerseyname') || '');
    player.nick   = fixMojibake(getFieldCI(player, 'nick')   || getFieldCI(player, 'commonname') || '');

    // Positions – map from string to ID (string may contain UTF‑8)
    const normalizePos = (p) => {
        if (!p) return p;
        let str = String(p).trim().toLowerCase();
        if (str === 'left midfield') return 'LM';
        if (str === 'right midfield') return 'RM';
        return p;
    };
    player.pos1 = getpositionid(normalizePos(getFieldCI(player, 'pos1') || getFieldCI(player, 'position1') || getFieldCI(player, 'position')), true);
    player.pos2 = getpositionid(normalizePos(getFieldCI(player, 'pos2') || getFieldCI(player, 'position2')), false);
    player.pos3 = getpositionid(normalizePos(getFieldCI(player, 'pos3') || getFieldCI(player, 'position3')), false);
    player.pos4 = getpositionid(normalizePos(getFieldCI(player, 'pos4') || getFieldCI(player, 'position4')), false);
    player.pos5 = getpositionid(normalizePos(getFieldCI(player, 'pos5') || getFieldCI(player, 'position5')), false);
    player.pos6 = getpositionid(normalizePos(getFieldCI(player, 'pos6') || getFieldCI(player, 'position6')), false);
    player.pos7 = getpositionid(normalizePos(getFieldCI(player, 'pos7') || getFieldCI(player, 'position7')), false);

    return player;
}