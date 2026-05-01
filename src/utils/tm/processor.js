// /───────────────────── src/utils/tm/processor.js ──────────────────────/

import { position_mapping, templates, random_values, names_data } from './templates';
import { nations } from '../rm26/resources.js';

// ── Helper: Generate random FIFA birthdate integer (1965–2000) ───────────
function getRandomFIFADate() {
  const start = new Date(1965, 0, 1);
  const end = new Date(2000, 11, 31);
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const year = randomDate.getUTCFullYear();
  const month = randomDate.getUTCMonth() + 1;
  const day = randomDate.getUTCDate();

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn = day + Math.floor((153 * m + 2) / 5) + y * 365 + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jdn - 2299160;
}

// ── Jersey number pools (unchanged) ─────────────────────────────────────
const JERSEY_POOLS = {
  GK: { primary: [1, 99], secondary: [12, 13, 22, 23, 31, 32, 33] },
  CB: { primary: [2, 3, 4, 5], secondary: [15, 20, 24, 25, 26, 29] },
  FB: { primary: [2, 3, 12, 13], secondary: [21, 22, 23, 24, 25, 26, 29] },
  CDM: { primary: [6, 8, 5, 16, 18, 14], secondary: [4, 15, 24, 28, 29] },
  CM: { primary: [6, 8, 16, 18, 14, 5], secondary: [4, 15, 24, 28, 29] },
  ATT_MID: { primary: [10, 11, 7, 17, 21, 19], secondary: [6, 8, 14, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
  ST: { primary: [9, 19, 7, 17], secondary: [10, 11, 21, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
};

const posToJerseyGroup = (numPos) => {
  if (numPos === 0) return 'GK';
  if ([4, 5, 6].includes(numPos)) return 'CB';
  if ([3, 7, 2, 8].includes(numPos)) return 'FB';
  if ([9, 10, 11].includes(numPos)) return 'CDM';
  if ([13, 14, 15].includes(numPos)) return 'CM';
  if ([12, 16, 17, 18, 19, 23, 27].includes(numPos)) return 'ATT_MID';
  if ([20, 21, 22, 24, 25, 26].includes(numPos)) return 'ST';
  return 'CM';
};

const pickJerseyNumber = (group, usedNumbers) => {
  const pool = JERSEY_POOLS[group];
  for (const n of pool.primary) if (!usedNumbers.has(n)) { usedNumbers.add(n); return n; }
  for (const n of pool.secondary) if (!usedNumbers.has(n)) { usedNumbers.add(n); return n; }
  for (let n = 1; n <= 99; n++) if (!usedNumbers.has(n)) { usedNumbers.add(n); return n; }
  return 99;
};

const DEF_POSITIONS = new Set([3, 4, 5, 6, 7, 2, 8]);
const MID_POSITIONS = new Set([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
const ATT_POSITIONS = new Set([20, 21, 22, 23, 24, 25, 26, 27]);

const parseFormationCounts = (formationName) => {
  if (!formationName || typeof formationName !== 'string') return { def: 4, mid: 3, att: 3 };
  const parts = formationName.replace(/[^0-9-]/g, '').split('-').map(Number).filter(n => !isNaN(n) && n > 0);
  if (parts.length < 2) return { def: 4, mid: 3, att: 3 };
  return { def: parts[0], att: parts[parts.length - 1], mid: parts.slice(1, -1).reduce((s, n) => s + n, 0) };
};

const calcMatchdayRatings = (teamPlayers, formationName) => {
  const avg = (arr) => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 63;
  const getOvr = (p) => parseInt(p.OVR || p.ovr || p.Ovr || 63, 10) || 63;
  const vary = (v) => Math.min(99, Math.max(1, v + Math.floor(Math.random() * 7) - 3));
  const { def: defCount, mid: midCount, att: attCount } = parseFormationCounts(formationName);
  const sorted = (set, count) => [...teamPlayers].filter(p => set.has(p.NumericPosition)).sort((a, b) => getOvr(b) - getOvr(a)).slice(0, count);
  const topGk = teamPlayers.filter(p => p.NumericPosition === 0).slice(0, 1);
  const topDef = sorted(DEF_POSITIONS, defCount);
  const topMid = sorted(MID_POSITIONS, midCount);
  const topAtt = sorted(ATT_POSITIONS, attCount);
  const defRating = avg(topDef.map(getOvr));
  const midRating = avg(topMid.map(getOvr));
  const attRating = avg(topAtt.map(getOvr));
  const allRating = avg([...topGk, ...topDef, ...topMid, ...topAtt].map(getOvr));
  return {
    overall: allRating, attack: attRating, midfield: midRating, defense: defRating,
    matchdayOverall: vary(allRating), matchdayAttack: vary(attRating),
    matchdayMidfield: vary(midRating), matchdayDefense: vary(defRating),
  };
};

export function processData(teams, players, isNationalTeam = false, startManagerId = null, startTeamKitId = null, leagueId = 0, artificialId = 0) {
  const results = {};
  Object.keys(templates).forEach(key => { if (key !== 'common_template_numbers') results[key] = []; });
  if (!results.team_nations_link) results.team_nations_link = [];
  if (!results.league_team_links) results.league_team_links = [];

  const getCompatiblePositions = (pos) => {
    const map = {
      0: [0], 3: [3, 4, 5, 6, 7, 10], 4: [4, 5, 6, 3, 7, 10], 6: [6, 5, 4, 7, 3, 10],
      7: [7, 4, 5, 6, 3, 10], 10: [10, 13, 14, 15, 9, 11, 4, 5, 6],
      13: [13, 14, 15, 10, 12, 16, 17, 19], 15: [15, 14, 13, 10, 16, 12, 19, 17],
      23: [23, 17, 20, 19, 27, 12, 16], 25: [25, 21, 24, 26, 20, 22, 23, 27],
      27: [27, 19, 22, 16, 23, 17, 20]
    };
    return map[pos] || [];
  };

  const assignPlayersToPositions = (teamPlayers) => {
    const order = [[0, 0], [3, 1], [4, 2], [6, 3], [7, 4], [10, 5], [13, 6], [15, 7], [23, 8], [25, 9], [27, 10]];
    const assignments = {}, mainPlayers = [], assignedIds = new Set();
    order.forEach(([pos, key]) => {
      const p = teamPlayers.find(p => !assignedIds.has(p.playerid) && p.NumericPosition === pos);
      if (p) { assignments[`${pos}_${key}`] = p.playerid; mainPlayers.push(p.playerid); assignedIds.add(p.playerid); }
    });
    order.forEach(([pos, key]) => {
      if (!assignments[`${pos}_${key}`]) {
        const compats = getCompatiblePositions(pos);
        const p = teamPlayers.find(p => !assignedIds.has(p.playerid) && compats.includes(p.NumericPosition));
        if (p) { assignments[`${pos}_${key}`] = p.playerid; mainPlayers.push(p.playerid); assignedIds.add(p.playerid); }
      }
    });
    order.forEach(([pos, key]) => {
      if (!assignments[`${pos}_${key}`]) {
        const p = teamPlayers.find(p => !assignedIds.has(p.playerid));
        if (p) { assignments[`${pos}_${key}`] = p.playerid; mainPlayers.push(p.playerid); assignedIds.add(p.playerid); }
      }
    });
    return { assignments, mainPlayers };
  };

  const calcLocalHash = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) & 0xFFFFFFFF;
    return hash & 0x80000000 ? hash - 0x100000000 : hash;
  };

  const getCol = (obj, target) => {
    const key = Object.keys(obj).find(k => k.toLowerCase() === target.toLowerCase());
    return key ? obj[key] : undefined;
  };

  const randChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const processedPlayers = players.map(p => ({
    ...p,
    NumericPosition: position_mapping[String(getCol(p, 'Position1') || getCol(p, 'Position') || '').toUpperCase()] || 28,
    playerid: getCol(p, 'playerid'),
    Team: getCol(p, 'team')
  })).sort((a, b) => parseInt(getCol(b, 'OVR') || 50) - parseInt(getCol(a, 'OVR') || 50));

  // Preserve team order & assign rivals sequentially
  const rivalMap = {};
  for (let i = 0; i < teams.length; i++) {
    const teamId = getCol(teams[i], 'teamid');
    const nextTeamId = getCol(teams[(i + 1) % teams.length], 'teamid');
    rivalMap[teamId] = nextTeamId;
  }

  const nationList = nations();
  const nationNameToId = new Map();
  nationList.forEach(n => nationNameToId.set(n.nation.toLowerCase(), n.nationid));

  for (let idx = 0; idx < teams.length; idx++) {
    const team = teams[idx];
    const teamId = getCol(team, 'teamid');
    const teamName = getCol(team, 'teamname');
    const teamnationality = getCol(team, 'teamnationality') || '';
    const teamPlayers = processedPlayers.filter(p => p.Team === teamName);
    if (teamPlayers.length === 0) continue;

    const templateNum = templates.common_template_numbers[idx % templates.common_template_numbers.length];
    const rivalTeamId = rivalMap[teamId] || -1;
    const { assignments, mainPlayers } = assignPlayersToPositions(teamPlayers);

    let specialRoles = Array(7).fill(-1);
    if (mainPlayers.length >= 7) specialRoles = [...mainPlayers].sort(() => 0.5 - Math.random()).slice(0, 7);
    else if (mainPlayers.length > 0) specialRoles = Array.from({ length: 7 }, () => mainPlayers[Math.floor(Math.random() * mainPlayers.length)]);
    if (mainPlayers.length >= 3) specialRoles[4] = mainPlayers[0];

    // 1. Teams (with random stadium capacity)
    const formationTemplate = templates.formations.templates[`template${templateNum}`];
    const formationRow = formationTemplate ? formationTemplate[0] : '';
    const fmtCols = templates.formations.columns;
    const fmtVals = formationRow.replace(/{[^}]+}/g, '0').split(',');
    const fmtNameIdx = fmtCols.indexOf('formationname');
    const formationName = fmtNameIdx >= 0 ? fmtVals[fmtNameIdx] : '4-3-3';

    const ratings = calcMatchdayRatings(teamPlayers, formationName);
    const stadiumCapacity = Math.floor(Math.random() * (85000 - 35000 + 1) + 35000);

    let tRow = templates.teams.template;
    const tReplacements = {
      teamid: teamId, team_id: teamId, team_name: teamName,
      rightfreekicktakerid: specialRoles[0], longkicktakerid: specialRoles[1],
      rightcornerkicktakerid: specialRoles[2], leftcornerkicktakerid: specialRoles[3],
      captainid: specialRoles[4], leftfreekicktakerid: specialRoles[5], penaltytakerid: specialRoles[6],
      freekicktakerid: specialRoles[0], rivalteam: rivalTeamId, stadiumcapacity: stadiumCapacity
    };
    Object.entries(tReplacements).forEach(([k, v]) => tRow = tRow.replace(new RegExp(`\\{${k}\\}`, 'g'), v));

    const teamCols = templates.teams.columns;
    const tVals = tRow.split(',');
    const setCol = (name, val) => { const i = teamCols.indexOf(name); if (i >= 0) tVals[i] = String(val); };
    setCol('overallrating', ratings.overall); setCol('attackrating', ratings.attack);
    setCol('midfieldrating', ratings.midfield); setCol('defenserating', ratings.defense);
    setCol('matchdayoverallrating', ratings.matchdayOverall); setCol('matchdayattackrating', ratings.matchdayAttack);
    setCol('matchdaymidfieldrating', ratings.matchdayMidfield); setCol('matchdaydefenserating', ratings.matchdayDefense);
    results.teams.push(tVals);

    // 2. TeamKits
    templates.teamkits.templates.forEach((kitTemplate, kitIdx) => {
      let kRow = kitTemplate.replace(/{team_id}/g, teamId).replace(/{teamid}/g, teamId);
      const computedKitId = startTeamKitId + (idx * 3) + kitIdx;
      kRow = kRow.replace(/{startingKitId}/g, computedKitId);
      results.teamkits.push(kRow.split(','));
    });

    // 3. Formations
    let fRow = templates.formations.templates[`template${templateNum}`][0];
    fRow = fRow.replace(/{teamid}/g, teamId).replace(/{formationid}/g, templateNum);
    results.formations.push(fRow.split(','));

    // 4. Starting Players (GK only at playerid0)
    const starting_order = [0, 3, 4, 6, 7, 10, 13, 15, 23, 25, 27];
    let startingPlayers = [], usedStartingIds = new Set();
    for (const pos of starting_order) {
      let candidates = teamPlayers.filter(p => p.NumericPosition === pos && !usedStartingIds.has(p.playerid));
      if (!candidates.length) {
        const compats = getCompatiblePositions(pos);
        candidates = teamPlayers.filter(p => compats.includes(p.NumericPosition) && !usedStartingIds.has(p.playerid));
      }
      if (!candidates.length) candidates = teamPlayers.filter(p => !usedStartingIds.has(p.playerid));
      if (candidates.length) { startingPlayers.push(candidates[0].playerid); usedStartingIds.add(candidates[0].playerid); }
      else startingPlayers.push(-1);
    }

    // 5. TeamMentality
    let mentTemplateKey = `template${templateNum}`;
    if (!templates.teammentality.templates[mentTemplateKey]) mentTemplateKey = 'template1';
    const mentPlayerOrder = [0, 9, 1, 7, 6, 5, 8, 2, 4, 3, 10];
    templates.teammentality.templates[mentTemplateKey].forEach(mTemplate => {
      let mRow = mTemplate.replace(/{teamid}/g, teamId).replace(/{team_id}/g, teamId);
      const roleReplacements = {
        rightfreekicktakerid: specialRoles[0], longkicktakerid: specialRoles[1],
        rightcornerkicktakerid: specialRoles[2], leftcornerkicktakerid: specialRoles[3],
        captainid: specialRoles[4], leftfreekicktakerid: specialRoles[5], penaltytakerid: specialRoles[6]
      };
      Object.entries(roleReplacements).forEach(([k, v]) => mRow = mRow.replace(new RegExp(`\\{${k}\\}`, 'g'), v));
      mentPlayerOrder.forEach(idx => { mRow = mRow.replace('{playeridrelatedtoteam}', startingPlayers[idx] !== undefined ? startingPlayers[idx] : -1); });
      results.teammentality.push(mRow.split(','));
    });

    // 6. TeamSheet
    let tsRow = templates.teamsheet.template.replace(/{teamid}/g, teamId).replace(/{team_id}/g, teamId);
    for (let i = 0; i < 11; i++) tsRow = tsRow.replace(new RegExp(`\\{playerid${i}\\}`, 'g'), startingPlayers[i] !== undefined ? startingPlayers[i] : -1);
    const subs = teamPlayers.filter(p => !startingPlayers.includes(p.playerid));
    for (let i = 11; i < 52; i++) { const subIdx = i - 11; tsRow = tsRow.replace(new RegExp(`\\{playerid${i}\\}`, 'g'), subIdx < subs.length ? subs[subIdx].playerid : -1); }
    const tsRoleMapping = {
      rightfreekicktakerid: specialRoles[0], longkicktakerid: specialRoles[1],
      rightcornerkicktakerid: specialRoles[2], leftcornerkicktakerid: specialRoles[3],
      captainid: specialRoles[4], leftfreekicktakerid: specialRoles[5], penaltytakerid: specialRoles[6],
      freekicktakerid: specialRoles[0], formationid: templateNum
    };
    Object.entries(tsRoleMapping).forEach(([k, v]) => tsRow = tsRow.replace(new RegExp(`\\{${k}\\}`, 'g'), v));
    results.teamsheet.push(tsRow.split(','));

    // 7. TeamPlayerLink
    const assignedIdsLink = new Set(), teamUsedNumbers = new Set();
    startingPlayers.forEach((pid, i) => {
      if (pid !== -1) {
        const pos = starting_order[i];
        const group = posToJerseyGroup(pos);
        const jerseyNum = pickJerseyNumber(group, teamUsedNumbers);
        results.teamplayerlink.push([0, 0, 0, 0, jerseyNum, pos, i, teamId, 0, 0, 0, 0, 0, pid, 3, 0]);
        assignedIdsLink.add(pid);
      }
    });
    const subsLink = teamPlayers.filter(p => !assignedIdsLink.has(p.playerid));
    subsLink.forEach((sub, i) => {
      const group = posToJerseyGroup(sub.NumericPosition ?? 14);
      const jerseyNum = pickJerseyNumber(group, teamUsedNumbers);
      results.teamplayerlink.push([0, 0, 0, 0, jerseyNum, 28, startingPlayers.length + i, teamId, 0, 0, 0, 0, 0, sub.playerid, 3, 0]);
    });
    const defaultTeamUsedNumbers = new Set();
    teamPlayers.forEach(p => {
      const isScrapedVal = getCol(p, 'isScraped');
      const isExistingPlayer = isScrapedVal === false || String(isScrapedVal).toLowerCase() === 'false';
      if (!isExistingPlayer) {
        const group = posToJerseyGroup(p.NumericPosition ?? 14);
        const jerseyNum = pickJerseyNumber(group, defaultTeamUsedNumbers);
        results.teamplayerlink.push([0, 0, 0, 0, jerseyNum, 0, 0, 111592, 0, 0, 0, 0, 0, p.playerid, 3, 0]);
      }
    });

    // 8. Managers
    const natCode = randChoice(random_values.nationalities);
    const countryList = Object.keys(names_data);
    let countryData = null;
    if (natCode >= 1 && natCode <= countryList.length) countryData = names_data[countryList[natCode - 1]];
    if (!countryData || !countryData.first_names) countryData = names_data[countryList[0]] || names_data["England"];

    const managerId = startManagerId !== null ? startManagerId + idx : teamId * 1000;
    const managerFirstname = randChoice(countryData.first_names);
    const managerSurname = randChoice(countryData.last_names);

    const managerObj = {
      managerid: managerId,
      starrating: randChoice([2.5, 3.5, 4.5]),
      firstname: managerFirstname,
      surname: managerSurname,
      commonname: `${managerFirstname} ${managerSurname}`,
      eyebrowcode: randChoice(random_values.eyebrowcodes),
      skintypecode: 0,
      haircolorcode: 22,
      facialhairtypecode: randChoice(random_values.facialhairtypecodes),
      accessorycode4: 0,
      hairtypecode: randChoice(random_values.hairtypecodes),
      facepsdlayer0: 3,
      lipcolor: 0,
      skinsurfacepack: randChoice(random_values.skinsurfacepacks),
      accessorycode3: 0,
      accessorycolourcode1: 0,
      headtypecode: randChoice(random_values.headtypecodes),
      height: randChoice(random_values.heights),
      seasonaloutfitid: randChoice(random_values.seasonaloutfitids),
      birthdate: getRandomFIFADate(),
      isrewardable: 0,
      skinmakeup: 0,
      trait1vweak: 132224,
      weight: randChoice(random_values.weights),
      hashighqualityhead: 1,
      eyedetail: 2,
      gender: 0,
      headassetid: managerId,
      ethnicity: randChoice(random_values.ethnicities),
      faceposerpreset: 0,
      islicensed: 1,
      teamid: teamId,
      trait1vequal: 263296,
      eyecolorcode: 4,
      personalityid: randChoice(random_values.personalityids),
      accessorycolourcode3: 0,
      accessorycode1: 0,
      headclasscode: 0,
      nationality: natCode,
      sideburnscode: 0,
      accessorycolourcode4: 0,
      headvariation: 0,
      skintonecode: randChoice(random_values.skintonecodes),
      outfitid: randChoice(random_values.outfitids),
      facepsdlayer1: 0,
      skincomplexion: 3,
      accessorycode2: 0,
      hairstylecode: 0,
      bodytypecode: randChoice(random_values.bodytypecodes),
      managerjointeamdate: 160725,
      trait1vstrong: 4202624,
      accessorycolourcode2: 0,
      facialhaircolorcode: randChoice(random_values.facialhaircolorcodes)
    };
    const managerRow = templates.managers.columns.map(col => managerObj[col] !== undefined ? managerObj[col] : '');
    results.managers.push(managerRow);

    // 9. Language Strings
    const common_abbreviations = {
      "manchester united": "MUN", "manchester city": "MCI", "real madrid": "RMA",
      "barcelona": "FCB", "bayern munich": "FCB", "paris saint-germain": "PSG",
      "liverpool": "LIV", "chelsea": "CHE", "tottenham hotspur": "TOT", "arsenal": "ARS"
    };
    let abbr3 = common_abbreviations[teamName.toLowerCase()];
    if (!abbr3) {
      const words = teamName.split(' ').filter(w => w);
      if (words.length === 2) abbr3 = `${words[0][0].toUpperCase()}${words[1].substring(0, 2).toUpperCase()}`;
      else if (words.length >= 3) abbr3 = words.slice(0, 3).map(w => w[0].toUpperCase()).join('');
      else abbr3 = teamName.substring(0, 3).toUpperCase();
    }
    const strVars = [
      [`TeamName_${teamId}`, teamName], [`TeamName_Abbr3_${teamId}`, abbr3],
      [`TeamName_Abbr7_${teamId}`, teamName], [`TeamName_Abbr10_${teamId}`, teamName],
      [`TeamName_Abbr15_${teamId}`, teamName], [`CT_TeamName_${teamId}`, teamName]
    ];
    strVars.forEach(([sid, sval]) => {
      let sRow = templates.language_strings.template;
      sRow = sRow.replace('{hash}', calcLocalHash(sid)).replace('{stringid}', sid).replace('{stringvalue}', sval);
      results.language_strings.push(sRow.split(','));
    });

    // 10. TeamNationsLink
    let teamNationId = 146;
    if (teamnationality && teamnationality.trim() !== '') {
      const matched = nationNameToId.get(teamnationality.toLowerCase());
      if (matched) teamNationId = matched;
    }
    results.team_nations_link.push([leagueId, teamNationId, teamId]);

    // 11. LeagueTeamLinks
    results.league_team_links.push([
      0, 2, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0,
      leagueId, leagueId, 0, 0, 0, 0, artificialId, 0, teamId,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ]);
  }

  return results;
}