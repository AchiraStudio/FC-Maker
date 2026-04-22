import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Utility Functions (ported from Python) ───────────────────────────────────

function convertPosition(position) {
  const p = (position || "").trim().toLowerCase();
  if (p.includes("goalkeeper")) return "GK";
  if (p.includes("centre-back") || p.includes("center back")) return "CB";
  if (p.includes("left-back")) return "LB";
  if (p.includes("right-back")) return "RB";
  if (p.includes("defensive midfield")) return "CDM";
  if (p.includes("central midfield")) return "CM";
  if (p.includes("attacking midfield")) return "CAM";
  if (p.includes("left winger")) return "LW";
  if (p.includes("right winger")) return "RW";
  if (p.includes("second striker")) return Math.random() < 0.5 ? "CAM" : "ST";
  if (p.includes("centre-forward") || p.includes("center forward")) return "ST";
  return position;
}

function convertMarketValueToOVR(marketValue) {
  try {
    let valueStr = (marketValue || "").replace("€", "").replace(/,/g, "").trim();
    let multiplier = 1;
    if (valueStr.toLowerCase().includes("k")) {
      valueStr = valueStr.toLowerCase().replace("k", "");
      multiplier = 1000;
    } else if (valueStr.toLowerCase().includes("m")) {
      valueStr = valueStr.toLowerCase().replace("m", "");
      multiplier = 1_000_000;
    }
    let value = parseFloat(valueStr) * multiplier;
    const minValue = 10_000;
    const maxValue = 200_000_000;
    value = Math.max(minValue, Math.min(value, maxValue));
    const logMin = Math.log10(minValue);
    const logMax = Math.log10(maxValue);
    const logValue = Math.log10(value);
    const scaled = 50 + 35 * ((logValue - logMin) / (logMax - logMin));
    let ovr = Math.min(85, Math.max(50, Math.round(scaled)));
    ovr += Math.floor(Math.random() * 5) - 2;
    return Math.min(85, Math.max(50, ovr));
  } catch {
    return 50 + Math.floor(Math.random() * 15);
  }
}

function processPlayerNames(fullName) {
  const parts = fullName.trim().split(/\s+/);
  let firstName = "", lastName = "";
  if (parts.length === 1) {
    firstName = parts[0]; lastName = "";
  } else if (parts.length === 2) {
    firstName = parts[0]; lastName = parts[1];
  } else if (parts.length === 3) {
    if (Math.random() < 0.5) { firstName = parts[0]; lastName = parts.slice(1).join(" "); }
    else { firstName = parts.slice(0, 2).join(" "); lastName = parts[2]; }
  } else {
    firstName = parts.slice(0, 2).join(" ");
    lastName = parts.slice(2).join(" ");
  }
  const variants = [];
  if (firstName) variants.push(firstName);
  if (lastName) { variants.push(lastName); if (firstName) variants.push(`${firstName[0]}. ${lastName}`); }
  variants.push(fullName);
  const jerseyName = variants[Math.floor(Math.random() * variants.length)] || fullName;
  return { firstName, lastName, jerseyName };
}

function parseDate(text) {
  // Format from actual TM HTML: "18/01/1997 (29)" → DD/MM/YYYY
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return "";
  try {
    const [, dd, mm, yyyy] = match;
    // Reorder to YYYY-MM-DD
    return `${yyyy}-${mm}-${dd}`;
  } catch { return ""; }
}

function parseHeight(text) {
  // Handles both "1,92m" (European) and "1.92m" (dot)
  try {
    const normalized = text.replace("m", "").replace(",", ".").trim();
    const h = parseFloat(normalized);
    return isNaN(h) ? "" : Math.round(h * 100);
  } catch { return ""; }
}

// ─── Squad URL Builder ────────────────────────────────────────────────────────
// TM team href examples:
//   /indonesia/startseite/verein/13958
//   /australia/spielplan/verein/4153/saison_id/2023
// Target: /indonesia/kader/verein/13958/saison_id/2026/plus/1

function buildSquadUrl(teamHref) {
  // Strip everything after verein/NNNN, then rebuild cleanly
  const match = teamHref.match(/^(\/[^/]+)\/[^/]+\/verein\/(\d+)/);
  if (match) {
    const [, slug, id] = match;
    return `https://www.transfermarkt.com${slug}/kader/verein/${id}/saison_id/2026/plus/1`;
  }
  // Fallback: replace whatever segment is before /verein with "kader", inject saison_id
  const fallback = teamHref
    .replace(/\/spielplan\//, "/kader/")
    .replace(/\/startseite\//, "/kader/")
    .replace(/\/saison_id\/\d+/, "");
  return `https://www.transfermarkt.com${fallback}/saison_id/2026/plus/1`;
}

// ─── Scraping Engine (runs in async generator pattern) ───────────────────────

async function fetchPage(url, log) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
      
      // Map the full URL to the local Vite proxy
      let proxyUrl = url;
      if (url.startsWith("https://www.transfermarkt.com")) {
        proxyUrl = url.replace("https://www.transfermarkt.com", "/tm");
      }
      
      const res = await fetch(proxyUrl);
      if (!res.ok) { log(`⚠️ HTTP ${res.status} for ${url} (attempt ${attempt + 1})`); continue; }
      
      const text = await res.text();
      
      if (text.includes("Checking your browser") || text.includes("cf-browser-verification")) { 
        log(`⚠️ Cloudflare detected, retrying...`); 
        await new Promise(r => setTimeout(r, 4000)); 
        continue; 
      }
      return text;
    } catch (e) { 
      log(`⚠️ Request failed: ${e.message}`); 
    }
  }
  return null;
}

function parseTeamsWorldCup(html) {
  const teams = {};
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const matchBox = doc.querySelector(".box.pokalWettbewerbSpieltagsbox") ||
    [...doc.querySelectorAll(".box.pokalWettbewerbSpieltagsbox")].at(-1);
  if (!matchBox) return teams;
  matchBox.querySelectorAll("tr.begegnungZeile").forEach(row => {
    ["heim", "gast"].forEach(side => {
      const span = row.querySelector(`.verein-${side} .vereinsname a`);
      if (span) {
        const name = span.getAttribute("title")?.trim();
        const href = span.getAttribute("href")?.trim();
        if (name && href) teams[name] = href;
      }
    });
  });
  return teams;
}

function parseTeamsCup(html) {
  const teams = {};
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll(".large-6.columns, .large-12.columns").forEach(col => {
    const tbody = col.querySelector("table.items tbody");
    if (!tbody) return;
    [...tbody.querySelectorAll("tr")].slice(0, 4).forEach(row => {
      const a = row.querySelector("td.no-border-links.hauptlink a");
      if (a) {
        const name = a.getAttribute("title")?.trim();
        const href = a.getAttribute("href")?.trim();
        if (name && href) teams[name] = href;
      }
    });
  });
  return teams;
}

function parseSquad(html, nationality) {
  const players = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const table = doc.querySelector("table.items");
  if (!table) return players;
  table.querySelectorAll("tbody tr.odd, tbody tr.even").forEach(row => {
    const player = {
      Nationality: nationality,
      Name: "", Firstname: "", Lastname: "", Jerseyname: "",
      Position: "", Date: "", Height: "", Foot: "", MarketValue: "", OVR: ""
    };

    // ── Name & Position (from inline-table) ──
    const inlineTable = row.querySelector("table.inline-table");
    if (inlineTable) {
      const trs = inlineTable.querySelectorAll("tr");
      const nameA = trs[0]?.querySelector("td.hauptlink a");
      if (nameA) {
        player.Name = nameA.textContent.trim();
        const { firstName, lastName, jerseyName } = processPlayerNames(player.Name);
        player.Firstname = firstName; player.Lastname = lastName; player.Jerseyname = jerseyName;
      }
      const posTd = trs[1]?.querySelector("td");
      if (posTd) player.Position = convertPosition(posTd.textContent.trim());
    }

    // ── Market Value & OVR ──
    const mvA = row.querySelector("td.rechts.hauptlink a");
    if (mvA) {
      player.MarketValue = mvA.textContent.trim();
      player.OVR = convertMarketValueToOVR(player.MarketValue);
    } else {
      player.OVR = 50 + Math.floor(Math.random() * 15);
    }

    // ── Positional td.zentriert parsing ──
    // Column order (ignoring jersey number td which has its own class):
    // [0] = jersey nr (rueckennummer) — skip
    // [1] = inline-table col — skip
    // [2] = birthdate "DD/MM/YYYY (age)"   ← index 0 of zentriert tds
    // [3] = club logo                       ← index 1
    // [4] = height "1,92m"                  ← index 2
    // [5] = foot "right/left/both"          ← index 3
    const zentriertTds = [...row.querySelectorAll("td.zentriert")];

    // Date is always the 1st td.zentriert that matches DD/MM/YYYY
    for (const td of zentriertTds) {
      const text = td.textContent.trim();
      if (/^\d{2}\/\d{2}\/\d{4}/.test(text)) {
        player.Date = parseDate(text);
        break;
      }
    }

    // Height: cell containing "m" with a numeric value like "1,92m" or "1.92m"
    for (const td of zentriertTds) {
      const text = td.textContent.trim();
      if (/^\d[,.]?\d+m$/.test(text)) {
        player.Height = parseHeight(text);
        break;
      }
    }

    // Foot: right / left / both
    for (const td of zentriertTds) {
      const text = td.textContent.trim().toLowerCase();
      if (["right", "left", "both"].includes(text)) {
        player.Foot = text.charAt(0).toUpperCase() + text.slice(1);
        break;
      }
    }

    if (!player.Foot) player.Foot = Math.random() < 0.15 ? "Left" : "Right";
    if (player.Name) players.push(player);
  });
  return players;
}

// ─── Excel Export ─────────────────────────────────────────────────────────────

function exportToExcel(players, filename = "transfermarkt_players.xlsx") {
  if (!players.length) return;
  const headers = ["Nationality","Name","Firstname","Lastname","Jerseyname","Position","Date","Height","Foot","MarketValue","OVR"];
  let csv = headers.join(",") + "\n";
  players.forEach(p => {
    csv += headers.map(h => `"${String(p[h] ?? "").replace(/"/g, '""')}"`).join(",") + "\n";
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename.replace(".xlsx", ".csv");
  a.click();
  URL.revokeObjectURL(a.href);
}

// ─── Main Component ───────────────────────────────────────────────────────────

const MODES = [
  { id: "worldcup", label: "World Cup", icon: "🌍" },
  { id: "cup", label: "Cup Competition", icon: "🏆" },
];

export default function TransfermarktScraper() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState("worldcup");
  const [isScraping, setIsScraping] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, text: "Ready" });
  const [logs, setLogs] = useState([]);
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState({ teams: 0, players: 0, skipped: 0 });
  const stopRef = useRef(false);
  const logRef = useRef(null);

  const log = useCallback((msg) => {
    setLogs(prev => [...prev, { msg, time: new Date().toLocaleTimeString() }]);
    setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
  }, []);

  const handleStart = async () => {
    if (!url.trim()) { log("⚠️ Please enter a Transfermarkt URL."); return; }
    stopRef.current = false;
    setIsScraping(true);
    setLogs([]);
    setPlayers([]);
    setStats({ teams: 0, players: 0, skipped: 0 });
    setProgress({ percent: 0, text: "Fetching page..." });

    log(`🚀 Starting scraper — Mode: ${mode === "worldcup" ? "World Cup" : "Cup Competition"}`);
    log(`🔗 URL: ${url.trim()}`);

    try {
      const html = await fetchPage(url.trim(), log);
      if (!html) { log("❌ Failed to fetch main page."); setIsScraping(false); return; }

      const teams = mode === "worldcup" ? parseTeamsWorldCup(html) : parseTeamsCup(html);
      const teamEntries = Object.entries(teams);

      if (!teamEntries.length) {
        log("❌ No teams found. Check URL or mode.");
        setIsScraping(false);
        setProgress({ percent: 0, text: "No teams found" });
        return;
      }

      log(`✅ Found ${teamEntries.length} teams to process.`);
      setStats(s => ({ ...s, teams: teamEntries.length }));

      const allPlayers = [];
      const skippedTeams = {};

      // ── Pass 1: all teams ──
      for (let i = 0; i < teamEntries.length; i++) {
        if (stopRef.current) break;
        const [nationality, teamUrl] = teamEntries[i];
        log(`🌍 Processing ${nationality}...`);
        setProgress({ percent: Math.round((i / teamEntries.length) * 85), text: `Processing ${i + 1}/${teamEntries.length} teams` });

        const squadUrl = buildSquadUrl(teamUrl);
        log(`🔗 ${nationality} → ${squadUrl}`);
        const squadHtml = await fetchPage(squadUrl, log);
        if (!squadHtml) { skippedTeams[nationality] = teamUrl; log(`⚠️ Skipped ${nationality}`); continue; }

        const squadPlayers = parseSquad(squadHtml, nationality);
        if (squadPlayers.length) {
          allPlayers.push(...squadPlayers);
          setPlayers([...allPlayers]);
          setStats(s => ({ ...s, players: allPlayers.length }));
          log(`✅ ${nationality}: Added ${squadPlayers.length} players`);
        } else {
          skippedTeams[nationality] = teamUrl;
          log(`⚠️ ${nationality}: No players found, queued for retry`);
        }
      }

      // ── Retry passes (up to 3) ──
      let retryPass = 1;
      let toRetry = { ...skippedTeams };
      while (!stopRef.current && Object.keys(toRetry).length && retryPass <= 3) {
        const retryEntries = Object.entries(toRetry);
        toRetry = {};
        log(`\n⚡ Retry pass ${retryPass} for ${retryEntries.length} skipped teams`);

        for (const [nationality, teamUrl] of retryEntries) {
          if (stopRef.current) break;
          log(`🔄 Retrying ${nationality}...`);
          const squadUrl = buildSquadUrl(teamUrl);
          const squadHtml = await fetchPage(squadUrl, log);
          if (!squadHtml) { toRetry[nationality] = teamUrl; continue; }
          const squadPlayers = parseSquad(squadHtml, nationality);
          if (squadPlayers.length) {
            allPlayers.push(...squadPlayers);
            setPlayers([...allPlayers]);
            setStats(s => ({ ...s, players: allPlayers.length }));
            log(`✅ ${nationality}: Added ${squadPlayers.length} players (retry ${retryPass})`);
          } else {
            toRetry[nationality] = teamUrl;
          }
        }
        retryPass++;
      }

      const finalSkipped = Object.keys(toRetry).length;
      setStats(s => ({ ...s, skipped: finalSkipped }));
      setProgress({ percent: 100, text: stopRef.current ? "Halted by user" : "Extraction complete" });

      if (allPlayers.length) {
        exportToExcel(allPlayers);
        log(`\n💾 Downloaded ${allPlayers.length} players as CSV`);
      }
      if (finalSkipped) log(`🚫 Could not process: ${Object.keys(toRetry).join(", ")}`);
      log(stopRef.current ? "🛑 Process stopped." : "✅ Process finished successfully.");

    } catch (e) {
      log(`❌ Fatal error: ${e.message}`);
    } finally {
      setIsScraping(false);
    }
  };

  const handleStop = () => {
    stopRef.current = true;
    log("🛑 Stop requested — finishing current team...");
    if (players.length) {
      exportToExcel(players, "transfermarkt_players_partial.csv");
      log(`💾 Saved partial data: ${players.length} players`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8e8", fontFamily: "'IBM Plex Mono', 'Courier New', monospace", padding: "0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #00ff88; border-radius: 2px; }
        input::placeholder { color: #333; }
        input:focus { outline: none !important; border-color: #00ff88 !important; }
        .stat-card { background: rgba(0,255,136,0.04); border: 1px solid rgba(0,255,136,0.12); border-radius: 4px; padding: 1.2rem; text-align: center; }
        .log-line { border-bottom: 1px solid rgba(255,255,255,0.04); padding: 4px 0; display: flex; gap: 12px; }
        .log-time { color: #333; min-width: 70px; font-size: 0.7rem; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "1.5rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: isScraping ? "#00ff88" : "#333", boxShadow: isScraping ? "0 0 8px #00ff88" : "none", transition: "all 0.3s" }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.15em", color: "#00ff88" }}>TRANSFERMARKT SCRAPER</span>
        </div>
        <span style={{ color: "#333", fontSize: "0.75rem" }}>v2.0 // FULL LOGIC PORT</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem", display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "2rem" }}>

        {/* LEFT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Mode */}
          <div>
            <div style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "0.15em", marginBottom: "0.8rem" }}>// SCRAPING MODE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {MODES.map(m => (
                <motion.button key={m.id} whileTap={{ scale: 0.99 }}
                  onClick={() => !isScraping && setMode(m.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "1rem", padding: "0.9rem 1.2rem",
                    background: mode === m.id ? "rgba(0,255,136,0.08)" : "transparent",
                    border: `1px solid ${mode === m.id ? "#00ff88" : "#1a1a1a"}`,
                    borderRadius: "3px", cursor: isScraping ? "not-allowed" : "pointer",
                    color: mode === m.id ? "#00ff88" : "#555", transition: "all 0.2s",
                    fontFamily: "inherit", fontSize: "0.85rem", letterSpacing: "0.05em"
                  }}>
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                  {mode === m.id && <span style={{ marginLeft: "auto", fontSize: "0.6rem", color: "#00ff88" }}>● ACTIVE</span>}
                </motion.button>
              ))}
            </div>
          </div>

          {/* URL */}
          <div>
            <div style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "0.15em", marginBottom: "0.8rem" }}>// TARGET URL</div>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} disabled={isScraping}
              placeholder="https://www.transfermarkt.com/..."
              style={{ width: "100%", padding: "0.9rem 1rem", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "3px", color: "#e8e8e8", fontSize: "0.75rem", fontFamily: "inherit" }} />
          </div>

          {/* Progress */}
          <div>
            <div style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "0.15em", marginBottom: "0.8rem" }}>// PROGRESS</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
              <span style={{ color: "#555" }}>{progress.text}</span>
              <span style={{ color: "#00ff88" }}>{progress.percent}%</span>
            </div>
            <div style={{ height: 3, background: "#111", borderRadius: 2, overflow: "hidden" }}>
              <motion.div animate={{ width: `${progress.percent}%` }} transition={{ duration: 0.4 }}
                style={{ height: "100%", background: "#00ff88", boxShadow: "0 0 8px rgba(0,255,136,0.5)" }} />
            </div>
          </div>

          {/* Stats */}
          <div>
            <div style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "0.15em", marginBottom: "0.8rem" }}>// EXTRACTION STATS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem" }}>
              {[["Teams", stats.teams], ["Players", stats.players], ["Skipped", stats.skipped]].map(([label, val]) => (
                <div key={label} className="stat-card">
                  <div style={{ color: "#00ff88", fontSize: "1.5rem", fontWeight: 600 }}>{val}</div>
                  <div style={{ color: "#444", fontSize: "0.65rem", letterSpacing: "0.1em", marginTop: 2 }}>{label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "0.7rem" }}>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleStart} disabled={isScraping}
              style={{ flex: 2, padding: "1rem", background: isScraping ? "#0a1a0a" : "#00ff88", color: isScraping ? "#00ff88" : "#000", border: `1px solid #00ff88`, borderRadius: "3px", fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 600, cursor: isScraping ? "not-allowed" : "pointer", letterSpacing: "0.1em", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {isScraping ? (
                <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ display: "inline-block" }}>⟳</motion.span> RUNNING</>
              ) : "▶ GENERATE EXCEL"}
            </motion.button>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleStop} disabled={!isScraping}
              style={{ flex: 1, padding: "1rem", background: "transparent", color: isScraping ? "#ff4444" : "#222", border: `1px solid ${isScraping ? "#ff4444" : "#1a1a1a"}`, borderRadius: "3px", fontFamily: "inherit", fontSize: "0.85rem", cursor: isScraping ? "pointer" : "not-allowed", letterSpacing: "0.1em" }}>
              ■ STOP
            </motion.button>
          </div>

        </div>

        {/* RIGHT PANEL — Console + Preview */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Console */}
          <div>
            <div style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "0.15em", marginBottom: "0.8rem", display: "flex", justifyContent: "space-between" }}>
              <span>// CONSOLE OUTPUT</span>
              <span style={{ color: "#1a1a1a" }}>{logs.length} lines</span>
            </div>
            <div ref={logRef} style={{ height: 320, overflowY: "auto", background: "#050505", border: "1px solid #111", borderRadius: "3px", padding: "1rem" }}>
              <AnimatePresence>
                {logs.length === 0 && (
                  <div style={{ color: "#222", fontSize: "0.75rem" }}>Awaiting parameters...</div>
                )}
                {logs.map((entry, i) => (
                  <motion.div key={i} className="log-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <span className="log-time">{entry.time}</span>
                    <span style={{ fontSize: "0.78rem", color: entry.msg.startsWith("✅") ? "#00ff88" : entry.msg.startsWith("⚠️") || entry.msg.startsWith("❌") || entry.msg.startsWith("🛑") ? "#ff6644" : entry.msg.startsWith("💾") ? "#88aaff" : "#888" }}>
                      {entry.msg}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Player Preview Table */}
          <div>
            <div style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "0.15em", marginBottom: "0.8rem", display: "flex", justifyContent: "space-between" }}>
              <span>// PLAYER DATA PREVIEW</span>
              <span style={{ color: "#333" }}>last {Math.min(players.length, 8)} of {players.length}</span>
            </div>
            <div style={{ height: 220, overflowY: "auto", background: "#050505", border: "1px solid #111", borderRadius: "3px" }}>
              {players.length === 0 ? (
                <div style={{ padding: "1rem", color: "#222", fontSize: "0.75rem" }}>No data yet...</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                      {["Nationality", "First/Common", "Pos", "OVR", "Height", "Foot"].map(h => (
                        <th key={h} style={{ padding: "6px 10px", color: "#333", textAlign: "left", fontWeight: 400, letterSpacing: "0.08em" }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {players.slice(-8).map((p, i) => (
                      <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderBottom: "1px solid #0d0d0d" }}>
                        <td style={{ padding: "5px 10px", color: "#555" }}>{p.Nationality}</td>
                        <td style={{ padding: "5px 10px", color: "#aaa" }}>{p.Commonname || `${p.Firstname} ${p.Lastname}`}</td>
                        <td style={{ padding: "5px 10px", color: "#00ff88" }}>{p.Position}</td>
                        <td style={{ padding: "5px 10px", color: p.OVR >= 80 ? "#ffaa00" : p.OVR >= 70 ? "#88aaff" : "#555" }}>{p.OVR}</td>
                        <td style={{ padding: "5px 10px", color: "#555" }}>{p.Height || "—"}</td>
                        <td style={{ padding: "5px 10px", color: "#555" }}>{p.Foot}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #111", padding: "1rem 2.5rem", display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#222" }}>
        <span>FULL LOGIC PORT // VITE PROXY ACTIVATED</span>
        <span>RETRY PASSES: 3 // OVR SCALE: LOG10 50–85 // AUTO-EXPORT: CSV</span>
      </div>
    </div>
  );
}