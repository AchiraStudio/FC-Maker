// /───────────────────── src/utils/tm/processor.js ──────────────────────/

import { position_mapping, templates, random_values, names_data } from './templates';

export function processData(teams, players, isNationalTeam = false) {
  const results = {};
  Object.keys(templates).forEach(key => {
    if (key !== 'common_template_numbers') results[key] = [];
  });

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
    const assignments = {};
    const mainPlayers = [];
    const assignedIds = new Set();

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
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 31 + text.charCodeAt(i)) & 0xFFFFFFFF;
    }
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

  // Shuffle teams array to correctly replicate Python's random rival assignments
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  const rivalMap = {};
  shuffledTeams.forEach((team, idx) => {
    const teamId = getCol(team, 'teamid');
    const nextTeamId = getCol(shuffledTeams[(idx + 1) % shuffledTeams.length], 'teamid');
    rivalMap[teamId] = nextTeamId;
  });

  shuffledTeams.forEach((team, idx) => {
    const teamId = getCol(team, 'teamid');
    const teamName = getCol(team, 'teamname');
    const teamPlayers = processedPlayers.filter(p => p.Team === teamName);
    
    if (teamPlayers.length === 0) return;

    const templateNum = templates.common_template_numbers[idx % templates.common_template_numbers.length];
    const rivalTeamId = rivalMap[teamId] || -1;
    const { assignments, mainPlayers } = assignPlayersToPositions(teamPlayers);
    
    let specialRoles = Array(7).fill(-1);
    if (mainPlayers.length >= 7) {
      specialRoles = [...mainPlayers].sort(() => 0.5 - Math.random()).slice(0, 7);
    } else if (mainPlayers.length > 0) {
      specialRoles = Array.from({length: 7}, () => mainPlayers[Math.floor(Math.random() * mainPlayers.length)]);
    }
    if (mainPlayers.length >= 3) specialRoles[4] = mainPlayers[0];

    // 1. Teams
    let tRow = templates.teams.template;
    const tReplacements = {
      teamid: teamId,
      team_id: teamId,  // FIX: Added team_id
      team_name: teamName,
      rightfreekicktakerid: specialRoles[0],
      longkicktakerid: specialRoles[1],
      rightcornerkicktakerid: specialRoles[2],
      leftcornerkicktakerid: specialRoles[3],
      captainid: specialRoles[4],
      leftfreekicktakerid: specialRoles[5],
      penaltytakerid: specialRoles[6],
      freekicktakerid: specialRoles[0],
      rivalteam: rivalTeamId
    };
    Object.entries(tReplacements).forEach(([k, v]) => tRow = tRow.replace(new RegExp(`\\{${k}\\}`, 'g'), v));
    results.teams.push(tRow.split(','));

    // 2. TeamKits
    templates.teamkits.templates.forEach(kitTemplate => {
      let kRow = kitTemplate.replace(/{team_id}/g, teamId);
      results.teamkits.push(kRow.split(','));
    });

    // 3. Formations
    let fRow = templates.formations.templates[`template${templateNum}`][0];
    fRow = fRow.replace(/{teamid}/g, teamId).replace(/{formationid}/g, templateNum);
    results.formations.push(fRow.split(','));

    // 4. TeamMentality
    let mentTemplateKey = `template${templateNum}`;
    if (!templates.teammentality.templates[mentTemplateKey]) mentTemplateKey = 'template1';
    
    templates.teammentality.templates[mentTemplateKey].forEach(mTemplate => {
      let mRow = mTemplate.replace(/{teamid}/g, teamId).replace(/{team_id}/g, teamId);
      
      const roleReplacements = {
        rightfreekicktakerid: specialRoles[0], longkicktakerid: specialRoles[1],
        rightcornerkicktakerid: specialRoles[2], leftcornerkicktakerid: specialRoles[3],
        captainid: specialRoles[4], leftfreekicktakerid: specialRoles[5], penaltytakerid: specialRoles[6],
        playeridrelatedtoteam: specialRoles[0],
        playerid0: specialRoles[0], playerid1: specialRoles[1], playerid2: specialRoles[2],
        playerid3: specialRoles[3], playerid4: specialRoles[4], playerid5: specialRoles[5],
        playerid6: specialRoles[6], playerid7: specialRoles[0], playerid8: specialRoles[1],
        playerid9: specialRoles[2], playerid10: specialRoles[3]
      };
      Object.entries(roleReplacements).forEach(([k, v]) => mRow = mRow.replace(new RegExp(`\\{${k}\\}`, 'g'), v));
      results.teammentality.push(mRow.split(','));
    });

    // 5. TeamSheet
    const starting_order = [0, 3, 4, 6, 7, 10, 13, 15, 23, 25, 27];
    let startingPlayers = [];
    
    for (const pos of starting_order) {
      let candidates = teamPlayers.filter(p => p.NumericPosition === pos);
      if (candidates.length === 0) {
        const compats = getCompatiblePositions(pos);
        candidates = teamPlayers.filter(p => compats.includes(p.NumericPosition));
      }
      if (candidates.length > 0) {
        startingPlayers.push(candidates[0].playerid);
      } else {
        startingPlayers.push(-1);
      }
    }
    
    let tsRow = templates.teamsheet.template.replace(/{teamid}/g, teamId).replace(/{team_id}/g, teamId);
    for (let i = 0; i < 11; i++) {
      tsRow = tsRow.replace(new RegExp(`\\{playerid${i}\\}`, 'g'), startingPlayers[i] !== undefined ? startingPlayers[i] : -1);
    }
    
    const subs = teamPlayers.filter(p => !startingPlayers.includes(p.playerid));
    for (let i = 11; i < 52; i++) {
      const subIdx = i - 11;
      tsRow = tsRow.replace(new RegExp(`\\{playerid${i}\\}`, 'g'), subIdx < subs.length ? subs[subIdx].playerid : -1);
    }
    
    const tsRoleMapping = {
      rightfreekicktakerid: specialRoles[0], longkicktakerid: specialRoles[1],
      rightcornerkicktakerid: specialRoles[2], leftcornerkicktakerid: specialRoles[3],
      captainid: specialRoles[4], leftfreekicktakerid: specialRoles[5], penaltytakerid: specialRoles[6],
      freekicktakerid: specialRoles[0], formationid: templateNum
    };
    Object.entries(tsRoleMapping).forEach(([k, v]) => tsRow = tsRow.replace(new RegExp(`\\{${k}\\}`, 'g'), v));
    results.teamsheet.push(tsRow.split(','));

    // 6. TeamPlayerLink
    const posOrder = [[0, 0], [3, 1], [4, 2], [6, 3], [7, 4], [10, 5], [13, 6], [15, 7], [23, 8], [25, 9], [27, 10]];
    const maxMain = isNationalTeam ? 26 : posOrder.length;
    const assignedIdsLink = new Set();
    
    posOrder.slice(0, maxMain).forEach(([pos, key]) => {
      const pid = assignments[`${pos}_${key}`];
      if (pid) {
        results.teamplayerlink.push([0,0,0,0,Math.floor(Math.random()*99)+1,pos,key,teamId,0,0,0,0,0,pid,3,0]);
        assignedIdsLink.add(pid);
      }
    });

    if (!isNationalTeam) {
      const subsLink = teamPlayers.filter(p => !assignedIdsLink.has(p.playerid)).slice(0, 10);
      subsLink.forEach((sub, i) => {
        results.teamplayerlink.push([0,0,0,0,Math.floor(Math.random()*99)+1,28,posOrder.length+i,teamId,0,0,0,0,0,sub.playerid,3,0]);
      });
    }

    // FIX: Default team (111592) for ALL players - removed extra 0 (was 17 columns, now 16)
    teamPlayers.forEach(p => {
      results.teamplayerlink.push([0,0,0,0,Math.floor(Math.random()*99)+1,0,0,111592,0,0,0,0,0,p.playerid,3,0]);
    });

    // 7. Managers (Fully Fixed nationality mapping and random attributes)
    const natCode = randChoice(random_values.nationalities);
    const countryList = Object.keys(names_data);
    
    // Safely resolve country data, fallback to first country if ID doesn't map
    let countryData = null;
    if (natCode >= 1 && natCode <= countryList.length) {
      countryData = names_data[countryList[natCode - 1]];
    }
    
    // Final fallback if nationality ID is out of bounds or country doesn't exist
    if (!countryData || !countryData.first_names) {
      countryData = names_data[countryList[0]] || names_data["England"];
    }

    let mRow = templates.managers.template;
    const mReps = {
      managerid: teamId * 1000, 
      firstname: randChoice(countryData.first_names),
      lastname: randChoice(countryData.last_names),
      eyebrowcode: randChoice(random_values.eyebrowcodes), 
      facialhairtypecode: randChoice(random_values.facialhairtypecodes), 
      hairtypecode: randChoice(random_values.hairtypecodes), 
      skinsurfacepack: randChoice(random_values.skinsurfacepacks), 
      headtypecode: randChoice(random_values.headtypecodes),
      height: randChoice(random_values.heights), 
      seasonaloutfitid: randChoice(random_values.seasonaloutfitids), 
      weight: randChoice(random_values.weights), 
      ethnicity: randChoice(random_values.ethnicities), 
      personalityid: randChoice(random_values.personalityids), 
      nationality: natCode,
      skintonecode: randChoice(random_values.skintonecodes), 
      outfitid: randChoice(random_values.outfitids), 
      bodytypecode: randChoice(random_values.bodytypecodes), 
      facialhaircolorcode: randChoice(random_values.facialhaircolorcodes), 
      teamid: teamId
    };
    Object.entries(mReps).forEach(([k, v]) => mRow = mRow.replace(new RegExp(`\\{${k}\\}`, 'g'), v));
    results.managers.push(mRow.split(','));

    // 8. Language Strings
    const common_abbreviations = {
      "manchester united": "MUN", "manchester city": "MCI", "real madrid": "RMA",
      "barcelona": "FCB", "bayern munich": "FCB", "paris saint-germain": "PSG",
      "liverpool": "LIV", "chelsea": "CHE", "tottenham hotspur": "TOT", "arsenal": "ARS"
    };
    
    let abbr3 = common_abbreviations[teamName.toLowerCase()];
    
    if (!abbr3) {
      const words = teamName.split(' ').filter(w => w);
      if (words.length === 2) {
        abbr3 = `${words[0][0].toUpperCase()}${words[1].substring(0, 2).toUpperCase()}`;
      } else if (words.length >= 3) {
        abbr3 = words.slice(0, 3).map(w => w[0].toUpperCase()).join('');
      } else {
        abbr3 = teamName.substring(0, 3).toUpperCase();
      }
    }

    const strVars = [
      [`TeamName_${teamId}`, teamName], 
      [`TeamName_Abbr3_${teamId}`, abbr3],
      [`TeamName_Abbr7_${teamId}`, teamName], 
      [`TeamName_Abbr10_${teamId}`, teamName],
      [`TeamName_Abbr15_${teamId}`, teamName], 
      [`CT_TeamName_${teamId}`, teamName]
    ];
    
    strVars.forEach(([sid, sval]) => {
      let sRow = templates.language_strings.template;
      sRow = sRow.replace('{hash}', calcLocalHash(sid)).replace('{stringid}', sid).replace('{stringvalue}', sval);
      results.language_strings.push(sRow.split(','));
    });
  });

  return results;
}