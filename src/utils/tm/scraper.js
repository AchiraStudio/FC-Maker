// /────────────────────── src/utils/tm/scraper.js ───────────────────────/

export async function runScraper(url, mode, deepFetch, log, onProgress) {
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
      // Dynamic delay to prevent Cloudflare blocking
      await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
      
      let proxyUrl = targetUrl.replace("https://www.transfermarkt.com", "/tm");
      const res = await fetch(proxyUrl);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      
      if (text.includes("Checking your browser") || text.includes("cf-browser-verification")) {
        await new Promise(r => setTimeout(r, 4000));
        return safeRequest(targetUrl, retryCount + 1);
      }
      return text;
    } catch (e) {
      await new Promise(r => setTimeout(r, 3000));
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

  const getTeams = async () => {
    const html = await safeRequest(url);
    if (!html) return {};
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const teams = {};

    if (mode === 'worldcup') {
      const matchBoxes = doc.querySelectorAll('.box.pokalWettbewerbSpieltagsbox');
      const box = matchBoxes[matchBoxes.length - 1];
      if (box) {
        box.querySelectorAll('tr.begegnungZeile').forEach(row => {
          ['heim', 'gast'].forEach(side => {
            const a = row.querySelector(`.verein-${side} .vereinsname a`);
            if (a && a.title && a.href) teams[a.title] = a.href;
          });
        });
      }
    } else if (mode === 'cup') {
      doc.querySelectorAll('.large-6.columns, .large-12.columns').forEach(col => {
        const tbody = col.querySelector('table.items tbody');
        if (tbody) {
          Array.from(tbody.querySelectorAll('tr')).slice(0, 4).forEach(row => {
            const a = row.querySelector('td.no-border-links.hauptlink a');
            if (a && a.title && a.href) teams[a.title] = a.href;
          });
        }
      });
    } else {
      const tbody = doc.querySelector('table.items tbody');
      if (tbody) {
        tbody.querySelectorAll('tr.odd, tr.even').forEach(row => {
          const a = row.querySelector('td.hauptlink.no-border-links a');
          if (a && a.title && a.href) teams[a.title] = a.href;
        });
      }
    }
    return teams;
  };

  const buildSquadUrl = (teamUrl) => {
    const match = teamUrl.match(/^(\/[^/]+)\/[^/]+\/verein\/(\d+)/);
    if (match) return `https://www.transfermarkt.com${match[1]}/kader/verein/${match[2]}/saison_id/2026/plus/1`;
    let fb = teamUrl.replace(/\/spielplan\//, '/kader/').replace(/\/startseite\//, '/kader/').replace(/\/saison_id\/\d+/, '');
    return `https://www.transfermarkt.com${fb}/saison_id/2026/plus/1`;
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

      // Fast-Mode Nationality Logic
      if (mode === 'worldcup') {
        // In World Cup mode, the team name IS the nationality
        p.Nationality = teamName;
      } else {
        // Fallback to the flag image title on the squad list
        const flag = row.querySelector('img.flaggenrahmen');
        if (flag && flag.title) p.Nationality = flag.title;
      }

      const zTds = row.querySelectorAll('td.zentriert');
      zTds.forEach(td => {
        const txt = td.textContent.trim();
        if (/^\d{2}\/\d{2}\/\d{4}/.test(txt)) p.Birthdate = txt.split('(')[0].trim().split('/').reverse().join('-');
        if (/^\d[,.]?\d+m$/.test(txt)) p.Height = Math.round(parseFloat(txt.replace('m', '').replace(',', '.')) * 100);
        if (['right', 'left', 'both'].includes(txt.toLowerCase())) p.PreferredFoot = txt.charAt(0).toUpperCase() + txt.slice(1);
      });
      
      // Default foot if not found in squad list
      if (!p.PreferredFoot) p.PreferredFoot = Math.random() < 0.15 ? 'Left' : 'Right';

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

  log("Initiating web extraction protocol...");
  const scrapedTeams = await getTeams();
  const teamEntries = Object.entries(scrapedTeams);
  if (!teamEntries.length) throw new Error("No teams found. Ensure mode matches URL.");
  
  log(`Detected ${teamEntries.length} target teams.`);
  let playerIdCounter = 200000; 
  let teamIdCounter = 1001;

  for (let i = 0; i < teamEntries.length; i++) {
    if (!isRunning) break;
    const [teamName, teamUrl] = teamEntries[i];
    log(`Scraping Squad List: ${teamName}...`);
    
    const squadHtml = await safeRequest(buildSquadUrl(teamUrl));
    if (!squadHtml) {
      state.errorTeams[teamName] = teamUrl;
      log(`⚠️ Failed to fetch squad list for ${teamName}`);
      continue;
    }

    const players = parseSquadList(squadHtml, teamName);
    
    if (players.length) {
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

          const teamProgress = (i / teamEntries.length) * 100;
          const playerProgress = ((j + 1) / players.length) * (100 / teamEntries.length);
          onProgress(Math.round(teamProgress + playerProgress));
        }
      } else {
        // Fast Mode: Just assign IDs, cleanup, and bump progress
        players.forEach(p => { 
          p.playerid = playerIdCounter++; 
          delete p.ProfileUrl;
        });
        onProgress(Math.round(((i + 1) / teamEntries.length) * 100));
      }

      state.players.push(...players);
      state.successfulTeams.add(teamName);
      state.teams.push({ teamid: teamIdCounter++, teamname: teamName });
      log(`✓ Locked ${players.length} players for ${teamName}`);
    } else {
      state.errorTeams[teamName] = teamUrl;
      log(`⚠️ Missing data for ${teamName}`);
    }
  }

  return { result: state, stop };
}