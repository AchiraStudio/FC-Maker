// /────────────────────── src/utils/tm/scraper.js ───────────────────────/

export async function runScraper(url, mode, deepFetch, log, onProgress, startTeamId = 1001, startPlayerId = 200000) {
  let isRunning = true;
  const state = {
    teams: [],
    players: [],
    errorTeams: {},
    successfulTeams: new Set()
  };

  const stop = () => { isRunning = false; };

  const safeRequest = async (targetUrl, retryCount = 0) => {
    if (retryCount >= 3 || !isRunning) return null;
    try {
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 1500));
      
      let proxyUrl = targetUrl.replace("https://www.transfermarkt.com", "/tm");
      const res = await fetch(proxyUrl);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      
      if (
        text.includes("Checking your browser") ||
        text.includes("cf-browser-verification") ||
        text.includes("Just a moment") ||
        text.includes("challenge-platform") ||
        text.includes("cf-challenge") ||
        text.length < 500
      ) {
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

  // ──────────────────────────────────────────────────────────────────────
  // Build squad URL
  //   seasonOverride = number  → /saison_id/XXXX/plus/1
  //   seasonOverride = null    → /plus/1  (TM default/latest season)
  // ──────────────────────────────────────────────────────────────────────
  const buildSquadUrl = (teamUrl, directSquadUrl = null, seasonOverride = null) => {
    let baseUrl;

    if (directSquadUrl) {
      baseUrl = directSquadUrl;
      if (baseUrl.startsWith('/')) {
        baseUrl = 'https://www.transfermarkt.com' + baseUrl;
      }
    } else {
      let rel = teamUrl;
      if (rel.startsWith('https://www.transfermarkt.com')) {
        rel = rel.replace('https://www.transfermarkt.com', '');
      }

      const match = rel.match(/^(\/[^/]+)\/[^/]+\/verein\/(\d+)/);
      if (match) {
        baseUrl = `https://www.transfermarkt.com${match[1]}/kader/verein/${match[2]}`;
      } else {
        let fb = rel.replace(/\/spielplan\//, '/kader/').replace(/\/startseite\//, '/kader/');
        baseUrl = 'https://www.transfermarkt.com' + fb;
      }
    }

    // Strip any existing saison_id
    baseUrl = baseUrl.replace(/\/saison_id\/\d+/, '');

    if (seasonOverride) {
      return baseUrl + `/saison_id/${seasonOverride}/plus/1`;
    }
    return baseUrl + '/plus/1';
  };

  // ──────────────────────────────────────────────────────────────────────
  // Get teams from the league / cup / world-cup listing page
  // ──────────────────────────────────────────────────────────────────────
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
              teams.push({
                name: a.title,
                href: a.href,
                squadUrl: null,
                nationality: a.title.trim()
              });
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
            if (a && a.title && a.href) {
              teams.push({ name: a.title, href: a.href, squadUrl: null, nationality: '' });
            }
          });
        }
      });

    } else {
      // ── LEAGUE MODE ──
      const tables = doc.querySelectorAll('table.items');

      for (const table of tables) {
        const tbody = table.querySelector('tbody');
        if (!tbody) continue;

        const hasTeamLinks = tbody.querySelector('td.hauptlink a[href*="/verein/"]');
        if (!hasTeamLinks) continue;

        tbody.querySelectorAll('tr.odd, tr.even').forEach(row => {
          const teamCell = row.querySelector('td.hauptlink');
          if (!teamCell) return;

          const teamLink = teamCell.querySelector('a[href*="/verein/"]');
          if (!teamLink || !teamLink.title || !teamLink.href) return;

          const teamName = teamLink.title.trim();

          let directSquadUrl = null;
          const squadLinks = row.querySelectorAll('a[href*="/kader/"]');
          if (squadLinks.length > 0) {
            directSquadUrl = squadLinks[0].getAttribute('href');
          }

          let teamNationality = '';
          const flag = row.querySelector('img.flaggenrahmen');
          if (flag && flag.title) {
            teamNationality = flag.title.trim();
          }

          teams.push({
            name: teamName,
            href: teamLink.href,
            squadUrl: directSquadUrl,
            nationality: teamNationality
          });
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
            if (!seen.has(name)) {
              seen.add(name);
              teams.push({ name, href, squadUrl: null, nationality: '' });
            }
          }
        });
      }
    }

    return teams;
  };

  // ──────────────────────────────────────────────────────────────────────
  // Parse the squad list HTML into player objects
  //
  // Per-row td.zentriert layout (expanded /plus/1 view):
  //   [0] Jersey number        (class="zentriert rueckennummer ...")
  //   [1] Name + position      (class="posrela" — NOT zentriert)
  //   [2] Birthdate + age      (e.g. "09/10/1998 (27)")
  //   [3] Nationality flag     (img.flaggenrahmen)
  //   [4] Height               (e.g. "2,04m" or "1,89m")
  //   [5] Preferred foot       (e.g. "left" / "right")
  //   [6] Joined date          (e.g. "19/08/2025")
  //   [7] Previous club badge  (img.wappen)
  //   [8] Contract expiry      (e.g. "31/07/2030")
  //   [9] Market value         (class="rechts hauptlink")
  //
  // Each field is targeted by its UNIQUE pattern to avoid collisions.
  // ──────────────────────────────────────────────────────────────────────
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

      // ── Name & Position (from inline-table) ──
      const inlineTbl = row.querySelector('table.inline-table');
      if (inlineTbl) {
        const trs = inlineTbl.querySelectorAll('tr');
        if (trs[0]) {
          const a = trs[0].querySelector('td.hauptlink a');
          if (a) {
            p.ProfileUrl = a.getAttribute('href');
            const fullName = a.textContent.trim().replace(/\s+/g, ' ');
            const parts = fullName.split(' ');
            if (parts.length === 1) {
              p.Firstname = fullName; p.Commonname = fullName; p.Jerseyname = fullName;
            } else if (parts.length === 2) {
              p.Firstname = parts[0]; p.Lastname = parts[1];
            } else {
              p.Firstname = parts.slice(0, 2).join(' '); p.Lastname = parts.slice(2).join(' ');
            }
            p.Jerseyname = p.Lastname || p.Firstname;
          }
        }
        if (trs[1]) {
          const posTd = trs[1].querySelector('td');
          if (posTd) p.Position1 = convertPosition(posTd.textContent);
        }
      }

      // ── Scan all td.zentriert cells — match each by UNIQUE pattern ──
      const zTds = row.querySelectorAll('td.zentriert');

      zTds.forEach(td => {
        // Skip cells that only contain images (flag, badge, etc.)
        if (td.querySelector('img')) return;

        const txt = td.textContent.trim();

        // ── Birthdate: ONLY matches "DD/MM/YYYY (age)" — unique pattern ──
        // e.g. "09/10/1998 (27)"  →  "1998-10-09"
        // This will NOT match joined dates or contract dates (no parentheses)
        const birthdateMatch = txt.match(/^(\d{2})\/(\d{2})\/(\d{4})\s*\(\d+\)/);
        if (birthdateMatch) {
          p.Birthdate = `${birthdateMatch[3]}-${birthdateMatch[2]}-${birthdateMatch[1]}`;
          return;
        }

        // ── Height: matches "X,XXm" or "X.XXm" (comma OR dot decimal) ──
        // e.g. "2,04m" or "1,89m" or "1.85m"
        const heightMatch = txt.match(/^(\d+[,.]\d+)m$/);
        if (heightMatch) {
          p.Height = Math.round(parseFloat(heightMatch[1].replace(',', '.')) * 100);
          return;
        }

        // ── Preferred Foot: exact match on known values ──
        const footLower = txt.toLowerCase();
        if (footLower === 'right' || footLower === 'left' || footLower === 'both') {
          p.PreferredFoot = txt.charAt(0).toUpperCase() + txt.slice(1);
          return;
        }
      });

      // ── Nationality ──
      if (mode === 'worldcup') {
        p.Nationality = teamName;
      } else {
        const flag = row.querySelector('img.flaggenrahmen');
        if (flag && flag.title) p.Nationality = flag.title;
      }

      // ── Market Value ──
      const mv = row.querySelector('td.rechts.hauptlink a');
      if (mv) {
        p.MarketValue = mv.textContent.trim();
        let valStr = p.MarketValue.replace('€', '').replace(/,/g, '').toLowerCase();
        let mult = 1;
        if (valStr.includes('k')) { valStr = valStr.replace('k', ''); mult = 1000; }
        else if (valStr.includes('m')) { valStr = valStr.replace('m', ''); mult = 1000000; }

        let value = parseFloat(valStr) * mult;
        if (!isNaN(value)) {
          value = Math.max(10000, Math.min(value, 200000000));
          const scaled = 50 + 35 * ((Math.log10(value) - 4) / (8.3 - 4));
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

    const infoLabels = doc.querySelectorAll('.info-table__content--regular');
    infoLabels.forEach(label => {
      const text = label.textContent.trim().toLowerCase();
      const valueSpan = label.nextElementSibling;

      if (valueSpan && valueSpan.classList.contains('info-table__content--bold')) {
        if (text.includes('citizenship:')) {
          const firstImg = valueSpan.querySelector('img.flaggenrahmen');
          if (firstImg && firstImg.title) {
            player.Nationality = firstImg.title.trim();
          } else {
            const textContent = valueSpan.textContent.trim().split('\n')[0].trim();
            if (textContent) player.Nationality = textContent;
          }
        }
        else if (text.includes('foot:')) {
          const footText = valueSpan.textContent.trim().toLowerCase();
          if (['right', 'left', 'both'].includes(footText)) {
            player.PreferredFoot = footText.charAt(0).toUpperCase() + footText.slice(1);
          }
        }
      }
    });
  };

  // ──────────────────────────────────────────────────────────────────────
  // MAIN EXTRACTION LOOP
  // ──────────────────────────────────────────────────────────────────────
  log("Initiating web extraction protocol...");
  const scrapedTeams = await getTeams();

  if (!scrapedTeams.length) throw new Error("No teams found. Ensure mode matches URL.");
  log(`Detected ${scrapedTeams.length} target teams.`);

  if (startTeamId) log(`Team ID starting point: ${startTeamId}`);
  if (startPlayerId) log(`Player ID starting point: ${startPlayerId}`);

  let playerIdCounter = startPlayerId;
  let teamIdCounter = startTeamId;

  for (let i = 0; i < scrapedTeams.length; i++) {
    if (!isRunning) break;
    const { name: teamName, href: teamUrl, squadUrl: directSquadUrl, nationality: teamNationality } = scrapedTeams[i];

    const natLog = (mode === 'league' && teamNationality) ? ` [${teamNationality}]` : '';
    log(`Scraping Squad List: ${teamName}${natLog}...`);

    // ── Build URL strategy list ──
    const urlStrategies = [
      { url: buildSquadUrl(teamUrl, directSquadUrl, 2026), label: '2026' }
    ];

    if (directSquadUrl) {
      const seasonMatch = directSquadUrl.match(/saison_id\/(\d+)/);
      if (seasonMatch && seasonMatch[1] !== '2026') {
        urlStrategies.push({
          url: buildSquadUrl(teamUrl, directSquadUrl, seasonMatch[1]),
          label: `original (${seasonMatch[1]})`
        });
      }
    }

    const teamSeasonMatch = teamUrl.match(/saison_id\/(\d+)/);
    if (teamSeasonMatch && teamSeasonMatch[1] !== '2026') {
      const alreadyAdded = urlStrategies.some(s => s.label.includes(teamSeasonMatch[1]));
      if (!alreadyAdded) {
        urlStrategies.push({
          url: buildSquadUrl(teamUrl, directSquadUrl, teamSeasonMatch[1]),
          label: `team-page (${teamSeasonMatch[1]})`
        });
      }
    }

    urlStrategies.push({
      url: buildSquadUrl(teamUrl, directSquadUrl),
      label: 'default (no season)'
    });

    // ── Try each URL strategy until we find players ──
    let players = [];

    for (const strategy of urlStrategies) {
      if (!isRunning) break;
      const shortUrl = strategy.url.replace("https://www.transfermarkt.com", "");
      log(`  ↳ Trying [${strategy.label}]: ${shortUrl}`);

      const squadHtml = await safeRequest(strategy.url);
      if (!squadHtml) {
        log(`  ↳ Request failed (null).`);
        continue;
      }

      players = parseSquadList(squadHtml, teamName);
      if (players.length > 0) {
        log(`  ↳ ✓ ${players.length} players found [${strategy.label}]`);
        break;
      }

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

        p.playerid = playerIdCounter++;
        delete p.ProfileUrl;

        const teamProgress = (i / scrapedTeams.length) * 100;
        const playerProgress = ((j + 1) / players.length) * (100 / scrapedTeams.length);
        onProgress(Math.round(teamProgress + playerProgress));
      }
    } else {
      players.forEach(p => {
        p.playerid = playerIdCounter++;
        delete p.ProfileUrl;
      });
      onProgress(Math.round(((i + 1) / scrapedTeams.length) * 100));
    }

    state.players.push(...players);
    state.successfulTeams.add(teamName);
    state.teams.push({
      teamid: teamIdCounter++,
      teamname: teamName,
      teamnationality: teamNationality || ''
    });
    log(`✓ Locked ${players.length} players for ${teamName}`);
  }

  return { result: state, stop };
}