// /────────────────────── src/utils/tm/scraper.js ───────────────────────/

export async function runScraper(
  url,
  mode,
  deepFetch,
  log,
  onProgress,
  startTeamId = 1001,
  startPlayerId = 200000,
  defaultPlayers = [],
  playerNamesMap = new Map()
) {
  let isRunning = true;
  const state = {
    teams: [],
    players: [],
    scrapedPlayers: [],
    errorTeams: {},
    successfulTeams: new Set()
  };
  const stop = () => { isRunning = false; };

  // ─── Reverse map: name → nameid ──────────────────────────────────────
  const nameToIdMap = new Map();
  for (const [id, name] of playerNamesMap.entries()) {
    const normalized = name.trim().toLowerCase();
    if (normalized && !nameToIdMap.has(normalized)) {
      nameToIdMap.set(normalized, id);
    }
  }
  log(`📊 Name→ID map: ${nameToIdMap.size} entries`);

  // ─── Build existing players indices ──────────────────────────────────
  const existingByIdPair = new Map(); // "firstId|lastId" → player data

  for (const p of defaultPlayers) {
    const firstId = parseInt(p.firstnameid, 10);
    const lastId = parseInt(p.lastnameid, 10);
    if (isNaN(firstId) || isNaN(lastId) || firstId <= 0 || lastId <= 0) continue;

    const key = `${firstId}|${lastId}`;
    existingByIdPair.set(key, {
      playerid: parseInt(p.playerid, 10),
      firstnameid: firstId,
      lastnameid: lastId,
      nationality: p.nationality,
      overallrating: p.overallrating
    });
  }
  log(`📊 Existing players by ID pair: ${existingByIdPair.size} entries`);

  // Debug: check test key
  const testKey = `10742|2970`;
  if (existingByIdPair.has(testKey)) {
    log(`✅ Test key ${testKey} FOUND in ID index.`);
  } else {
    log(`❌ Test key ${testKey} NOT found in ID index. Will use direct fallback.`);
  }

  // ─── Helper to generate name combinations ─────────────────────────────
  const getNameCombinations = (fullName) => {
    // replace hyphens with spaces
    const cleanName = fullName.trim().replace(/-/g, ' ').replace(/\s+/g, ' ');
    const parts = cleanName.split(' ').filter(Boolean);
    const combos = [];

    if (parts.length === 0) return [{ firstName: '', lastName: '' }];
    if (parts.length === 1) return [{ firstName: parts[0], lastName: '' }];
    if (parts.length === 2) return [{ firstName: parts[0], lastName: parts[1] }];
    
    // 3 parts: A B C -> A B + C, or A + B C
    if (parts.length === 3) {
      combos.push({ firstName: `${parts[0]} ${parts[1]}`, lastName: parts[2] });
      combos.push({ firstName: parts[0], lastName: `${parts[1]} ${parts[2]}` });
      return combos;
    }
    
    // 4+ parts
    combos.push({ firstName: parts[0], lastName: parts.slice(1).join(' ') });
    combos.push({ firstName: `${parts[0]} ${parts[1]}`, lastName: parts.slice(2).join(' ') });
    combos.push({ firstName: parts[0], lastName: parts[parts.length - 1] });
    return combos;
  };

  // ─── Find existing player (ID pair + direct fallback scan) ───────────
  const findExistingPlayer = (firstNameStr, lastNameStr) => {
    const firstNorm = firstNameStr?.trim().toLowerCase();
    const lastNorm = lastNameStr?.trim().toLowerCase();
    if (!firstNorm || !lastNorm) return null;

    // Stage 1: ID‑based using index
    const firstId = nameToIdMap.get(firstNorm);
    const lastId = nameToIdMap.get(lastNorm);
    if (firstId && lastId) {
      const key = `${firstId}|${lastId}`;
      const existing = existingByIdPair.get(key);
      if (existing) return { playerid: existing.playerid };
    }

    // Stage 2: Direct fallback scan of defaultPlayers
    if (firstId && lastId) {
      for (const p of defaultPlayers) {
        const pFirstId = parseInt(p.firstnameid, 10);
        const pLastId = parseInt(p.lastnameid, 10);
        if (pFirstId === firstId && pLastId === lastId) {
          return { playerid: parseInt(p.playerid, 10) };
        }
      }
    }

    // Stage 3: If IDs missing, try matching names directly (rare)
    for (const p of defaultPlayers) {
      const pFirstId = parseInt(p.firstnameid, 10);
      const pLastId = parseInt(p.lastnameid, 10);
      const pFirstName = playerNamesMap.get(pFirstId)?.toLowerCase();
      const pLastName = playerNamesMap.get(pLastId)?.toLowerCase();
      if (pFirstName === firstNorm && pLastName === lastNorm) {
        return { playerid: parseInt(p.playerid, 10) };
      }
    }

    return null;
  };

  // ────────────────── Network & parsing helpers (unchanged) ────────────
  const safeRequest = async (targetUrl, retryCount = 0) => {
    if (retryCount >= 3 || !isRunning) return null;
    try {
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 1500));
      let proxyUrl = targetUrl.replace("https://www.transfermarkt.com", "/tm");
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (text.includes("Checking your browser") || text.includes("cf-browser-verification") ||
          text.includes("Just a moment") || text.includes("challenge-platform") ||
          text.includes("cf-challenge") || text.length < 500) {
        log(`  ⚠️ Anti-bot challenge. Retry ${retryCount + 1}/3...`);
        await new Promise(r => setTimeout(r, 5000));
        return safeRequest(targetUrl, retryCount + 1);
      }
      return text;
    } catch (e) {
      log(`  ⚠️ Request error: ${e.message}. Retry ${retryCount + 1}/3...`);
      await new Promise(r => setTimeout(r, 4000));
      return safeRequest(targetUrl, retryCount + 1);
    }
  };

  const convertPosition = (pos) => {
    const p = pos.trim().toLowerCase();
    if (p.includes('goalkeeper')) return 'GK';
    if (p.includes('centre-back') || p.includes('center back')) return 'CB';
    if (p.includes('left-back')) return 'LB';
    if (p.includes('right-back')) return 'RB';
    if (p.includes('defensive midfield')) return 'CDM';
    if (p.includes('central midfield')) return 'CM';
    if (p.includes('attacking midfield')) return 'CAM';
    if (p.includes('left winger')) return 'LW';
    if (p.includes('right winger')) return 'RW';
    if (p.includes('second striker')) return Math.random() < 0.5 ? 'CAM' : 'ST';
    if (p.includes('centre-forward') || p.includes('center forward')) return 'ST';
    return p.length <= 3 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1);
  };

  const buildSquadUrl = (teamUrl, directSquadUrl = null, seasonOverride = null) => {
    let baseUrl;
    if (directSquadUrl) {
      baseUrl = directSquadUrl;
      if (baseUrl.startsWith('/')) baseUrl = 'https://www.transfermarkt.com' + baseUrl;
    } else {
      let rel = teamUrl;
      if (rel.startsWith('https://www.transfermarkt.com')) rel = rel.replace('https://www.transfermarkt.com', '');
      const match = rel.match(/^(\/[^/]+)\/[^/]+\/verein\/(\d+)/);
      if (match) baseUrl = `https://www.transfermarkt.com${match[1]}/kader/verein/${match[2]}`;
      else baseUrl = 'https://www.transfermarkt.com' + rel.replace(/\/spielplan\//, '/kader/').replace(/\/startseite\//, '/kader/');
    }
    baseUrl = baseUrl.replace(/\/saison_id\/\d+/, '');
    if (seasonOverride) return baseUrl + `/saison_id/${seasonOverride}/plus/1`;
    return baseUrl + '/plus/1';
  };

  const getTeams = async () => {
    const html = await safeRequest(url);
    if (!html) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const teams = [];

    if (mode === 'worldcup') {
      const matchBoxes = doc.querySelectorAll('.box.pokalWettbewerbSpieltagsbox');
      const box = matchBoxes[matchBoxes.length - 1];
      if (box) {
        box.querySelectorAll('tr.begegnungZeile').forEach(row => {
          ['heim', 'gast'].forEach(side => {
            const a = row.querySelector(`.verein-${side} .vereinsname a`);
            if (a && a.title && a.href) {
              teams.push({ name: a.title, href: a.href, squadUrl: null, nationality: a.title.trim() });
            }
          });
        });
      }
    } else if (mode === 'cup') {
      doc.querySelectorAll('.large-6.columns, .large-12.columns').forEach(col => {
        const tbody = col.querySelector('table.items tbody');
        if (tbody) {
          Array.from(tbody.querySelectorAll('tr')).slice(0, 4).forEach(row => {
            const a = row.querySelector('td.no-border-links.hauptlink a');
            if (a && a.title && a.href) teams.push({ name: a.title, href: a.href, squadUrl: null, nationality: '' });
          });
        }
      });
    } else {
      const tables = doc.querySelectorAll('table.items');
      for (const table of tables) {
        const tbody = table.querySelector('tbody');
        if (!tbody) continue;
        if (!tbody.querySelector('td.hauptlink a[href*="/verein/"]')) continue;
        tbody.querySelectorAll('tr.odd, tr.even').forEach(row => {
          const teamCell = row.querySelector('td.hauptlink');
          if (!teamCell) return;
          const teamLink = teamCell.querySelector('a[href*="/verein/"]');
          if (!teamLink || !teamLink.title || !teamLink.href) return;
          const teamName = teamLink.title.trim();
          let directSquadUrl = null;
          const squadLinks = row.querySelectorAll('a[href*="/kader/"]');
          if (squadLinks.length > 0) directSquadUrl = squadLinks[0].getAttribute('href');
          let teamNationality = '';
          const flag = row.querySelector('img.flaggenrahmen');
          if (flag && flag.title) teamNationality = flag.title.trim();
          teams.push({ name: teamName, href: teamLink.href, squadUrl: directSquadUrl, nationality: teamNationality });
        });
        if (teams.length > 0) break;
      }
      if (teams.length === 0) {
        log("⚠️ Standard table detection failed. Attempting broad link scan...");
        const seen = new Set();
        doc.querySelectorAll('a[href*="/verein/"][title]').forEach(a => {
          const href = a.getAttribute('href');
          if (href && !href.includes('#') && !href.startsWith('javascript') && a.title.trim()) {
            const name = a.title.trim();
            if (!seen.has(name)) { seen.add(name); teams.push({ name, href, squadUrl: null, nationality: '' }); }
          }
        });
      }
    }
    return teams;
  };

  const parseSquadList = (html, teamName) => {
    const players = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const tbody = doc.querySelector('table.items tbody');
    if (!tbody) return players;

    tbody.querySelectorAll('tr.odd, tr.even').forEach(row => {
      const p = {
        Nationality: '', Firstname: '', Lastname: '', Jerseyname: '', Commonname: '',
        MarketValue: '', OVR: '', Position1: '', Position2: '', Position3: '', Position4: '',
        PreferredFoot: '', WeakFoot: Math.floor(Math.random() * 4) + 1, Birthdate: '', Height: '',
        Weight: Math.floor(Math.random() * (90 - 55 + 1)) + 55, SkillMoves: Math.floor(Math.random() * 4) + 1,
        Team: teamName, ProfileUrl: ''
      };

      const inlineTbl = row.querySelector('table.inline-table');
      if (inlineTbl) {
        const trs = inlineTbl.querySelectorAll('tr');
        if (trs[0]) {
          const a = trs[0].querySelector('td.hauptlink a');
          if (a) {
            p.ProfileUrl = a.getAttribute('href');
            const fullName = a.textContent.trim().replace(/\s+/g, ' ');
            p.FullName = fullName;
            const defaultCombo = getNameCombinations(fullName)[0];
            p.Firstname = defaultCombo.firstName;
            p.Lastname = defaultCombo.lastName;
            p.Jerseyname = defaultCombo.lastName || defaultCombo.firstName;
          }
        }
        if (trs[1]) {
          const posTd = trs[1].querySelector('td');
          if (posTd) p.Position1 = convertPosition(posTd.textContent);
        }
      }

      row.querySelectorAll('td.zentriert').forEach(td => {
        if (td.querySelector('img')) return;
        const txt = td.textContent.trim();
        const birthdateMatch = txt.match(/^(\d{2})\/(\d{2})\/(\d{4})\s*\(\d+\)/);
        if (birthdateMatch) {
          p.Birthdate = `${birthdateMatch[3]}-${birthdateMatch[2]}-${birthdateMatch[1]}`;
          return;
        }
        const heightMatch = txt.match(/^(\d+[,.]\d+)m$/);
        if (heightMatch) {
          p.Height = Math.round(parseFloat(heightMatch[1].replace(',', '.')) * 100);
          return;
        }
        const footLower = txt.toLowerCase();
        if (['right', 'left', 'both'].includes(footLower)) {
          p.PreferredFoot = txt.charAt(0).toUpperCase() + txt.slice(1);
        }
      });

      if (mode === 'worldcup') p.Nationality = teamName;
      else {
        const flag = row.querySelector('img.flaggenrahmen');
        if (flag && flag.title) p.Nationality = flag.title;
      }

      const mv = row.querySelector('td.rechts.hauptlink a');
      if (mv) {
        p.MarketValue = mv.textContent.trim();
        let valStr = p.MarketValue.replace('€', '').replace(/,/g, '').toLowerCase();
        let mult = 1;
        if (valStr.includes('k')) { valStr = valStr.replace('k', ''); mult = 1000; }
        else if (valStr.includes('m')) { valStr = valStr.replace('m', ''); mult = 1000000; }
        const value = parseFloat(valStr) * mult;
        if (!isNaN(value)) {
          const clamped = Math.max(10000, Math.min(value, 200000000));
          const scaled = 50 + 35 * ((Math.log10(clamped) - 4) / (8.3 - 4));
          p.OVR = Math.min(85, Math.max(50, Math.round(scaled) + Math.floor(Math.random() * 5) - 2));
        }
      }
      if (!p.OVR) p.OVR = 50 + Math.floor(Math.random() * 15);

      if (p.Firstname || p.Lastname) players.push(p);
    });
    return players;
  };

  const extractPlayerDetails = (html, player) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    doc.querySelectorAll('.info-table__content--regular').forEach(label => {
      const text = label.textContent.trim().toLowerCase();
      const valueSpan = label.nextElementSibling;
      if (!valueSpan || !valueSpan.classList.contains('info-table__content--bold')) return;
      if (text.includes('citizenship:')) {
        const firstImg = valueSpan.querySelector('img.flaggenrahmen');
        if (firstImg && firstImg.title) player.Nationality = firstImg.title.trim();
        else {
          const textContent = valueSpan.textContent.trim().split('\n')[0].trim();
          if (textContent) player.Nationality = textContent;
        }
      } else if (text.includes('foot:')) {
        const footText = valueSpan.textContent.trim().toLowerCase();
        if (['right', 'left', 'both'].includes(footText))
          player.PreferredFoot = footText.charAt(0).toUpperCase() + footText.slice(1);
      }
    });
  };

  // ────────────────── Main extraction loop ─────────────────────────────
  log("Initiating extraction with ID pair + direct scan fallback...");
  const scrapedTeams = await getTeams();
  if (!scrapedTeams.length) throw new Error("No teams found.");
  log(`Detected ${scrapedTeams.length} target teams.`);

  let playerIdCounter = startPlayerId;
  let teamIdCounter = startTeamId;

  for (let i = 0; i < scrapedTeams.length; i++) {
    if (!isRunning) break;
    const { name: teamName, href: teamUrl, squadUrl: directSquadUrl, nationality: teamNationality } = scrapedTeams[i];
    const natLog = (mode === 'league' && teamNationality) ? ` [${teamNationality}]` : '';
    log(`Scraping Squad List: ${teamName}${natLog}...`);

    const urlStrategies = [
      { url: buildSquadUrl(teamUrl, directSquadUrl, 2026), label: '2026' }
    ];
    if (directSquadUrl) {
      const seasonMatch = directSquadUrl.match(/saison_id\/(\d+)/);
      if (seasonMatch && seasonMatch[1] !== '2026') {
        urlStrategies.push({ url: buildSquadUrl(teamUrl, directSquadUrl, seasonMatch[1]), label: `original (${seasonMatch[1]})` });
      }
    }
    const teamSeasonMatch = teamUrl.match(/saison_id\/(\d+)/);
    if (teamSeasonMatch && teamSeasonMatch[1] !== '2026') {
      const alreadyAdded = urlStrategies.some(s => s.label.includes(teamSeasonMatch[1]));
      if (!alreadyAdded) {
        urlStrategies.push({ url: buildSquadUrl(teamUrl, directSquadUrl, teamSeasonMatch[1]), label: `team-page (${teamSeasonMatch[1]})` });
      }
    }
    urlStrategies.push({ url: buildSquadUrl(teamUrl, directSquadUrl), label: 'default (no season)' });

    let players = [];
    for (const strategy of urlStrategies) {
      if (!isRunning) break;
      const shortUrl = strategy.url.replace("https://www.transfermarkt.com", "");
      log(`  ↳ Trying [${strategy.label}]: ${shortUrl}`);
      const squadHtml = await safeRequest(strategy.url);
      if (!squadHtml) continue;
      players = parseSquadList(squadHtml, teamName);
      if (players.length > 0) { log(`  ↳ ✓ ${players.length} players found [${strategy.label}]`); break; }
      log(`  ↳ No player rows found on that page.`);
    }

    if (!players.length) {
      state.errorTeams[teamName] = teamUrl;
      log(`⚠️ Missing data for ${teamName} — all URL strategies exhausted.`);
      continue;
    }

    if (deepFetch) {
      log(`Deep fetching detailed profiles for ${players.length} players...`);
      for (let j = 0; j < players.length; j++) {
        if (!isRunning) break;
        const p = players[j];
        if (p.ProfileUrl) {
          const profileHtml = await safeRequest(`https://www.transfermarkt.com${p.ProfileUrl}`);
          if (profileHtml) extractPlayerDetails(profileHtml, p);
        }
        const teamProgress = (i / scrapedTeams.length) * 100;
        const playerProgress = ((j + 1) / players.length) * (100 / scrapedTeams.length);
        onProgress(Math.round(teamProgress + playerProgress));
      }
    } else {
      onProgress(Math.round(((i + 1) / scrapedTeams.length) * 100));
    }

    const teamIdForPlayer = teamIdCounter;
    for (const p of players) {
      const displayName = p.FullName || `${p.Firstname} ${p.Lastname}`;
      log(`  🔎 Checking: "${displayName}"`);
      
      let existing = null;
      let matchedCombo = null;
      const combos = p.FullName ? getNameCombinations(p.FullName) : [{ firstName: p.Firstname, lastName: p.Lastname }];
      
      for (const combo of combos) {
        existing = findExistingPlayer(combo.firstName, combo.lastName);
        if (existing) {
          matchedCombo = combo;
          break;
        }
      }

      if (existing) {
        // Use the matched combination for the final output
        p.Firstname = matchedCombo.firstName;
        p.Lastname = matchedCombo.lastName;
        p.Jerseyname = matchedCombo.lastName || matchedCombo.firstName;
        p.playerid = existing.playerid;
        p.isScraped = false;
        log(`     ✅ Matched in DB as: ${p.Firstname} ${p.Lastname} → ID ${p.playerid}`);
      } else {
        p.playerid = playerIdCounter++;
        p.isScraped = true;
        log(`     ❌ No match found. Added as new ID ${p.playerid}`);
      }
      p.TeamId = teamIdForPlayer;
      delete p.ProfileUrl;
      delete p.FullName;
    }

    state.players.push(...players);
    state.scrapedPlayers.push(...players.filter(p => p.isScraped));
    state.successfulTeams.add(teamName);
    state.teams.push({
      teamid: teamIdCounter++,
      teamname: teamName,
      teamnationality: teamNationality || ''
    });
    log(`✓ Locked ${players.length} players for ${teamName} (${players.filter(p => p.isScraped).length} new, ${players.filter(p => !p.isScraped).length} existing)`);
  }

  return { result: state, stop };
}