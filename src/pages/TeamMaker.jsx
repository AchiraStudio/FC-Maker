// /────────────────────── src/pages/TeamMaker.jsx ───────────────────────/

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Download, Loader2, Play, StopCircle, Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import { runScraper } from '../utils/tm/scraper';
import { processData } from '../utils/tm/processor';
import { templates } from '../utils/tm/templates';

const MODES = [
  { id: "league", label: "League", icon: "📊" },
  { id: "worldcup", label: "World Cup", icon: "🌍" },
  { id: "cup", label: "Cup Competition", icon: "🏆" },
];

export default function TeamMaker() {
  // Step 1 State
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState("league");
  const [deepFetch, setDeepFetch] = useState(false);
  const [startTeamId, setStartTeamId] = useState("1001");
  const [startPlayerId, setStartPlayerId] = useState("200000");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [scrapeLogs, setScrapeLogs] = useState(["• Scraper module initialized. Awaiting URL."]);
  const [rawScrapeData, setRawScrapeData] = useState(null);
  
  // Step 2 State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processLogs, setProcessLogs] = useState(["• Processor module initialized. Awaiting Step 1 data."]);
  const [finalDbData, setFinalDbData] = useState(null);

  const fileInputRef = useRef(null);
  const scraperControl = useRef(null);
  const scrapeLogEndRef = useRef(null);
  const processLogEndRef = useRef(null);

  const logScrape = (msg) => setScrapeLogs(prev => [...prev, `• ${msg}`]);
  const logProcess = (msg) => setProcessLogs(prev => [...prev, `• ${msg}`]);

  // Auto-scroll logs
  useEffect(() => {
    if (scrapeLogEndRef.current) scrapeLogEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [scrapeLogs]);
  useEffect(() => {
    if (processLogEndRef.current) processLogEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [processLogs]);

  // ==========================================
  // STEP 1: EXTRACTION (Scraper)
  // ==========================================
  const handleStartScrape = async () => {
    if (!url.trim()) { logScrape("⚠️ Error: Please enter a Transfermarkt URL."); return; }
    
    const teamId = parseInt(startTeamId, 10) || 1001;
    const playerId = parseInt(startPlayerId, 10) || 200000;
    
    setIsScraping(true);
    setScrapeProgress(0);
    setRawScrapeData(null);
    logScrape(`🚀 Commencing extraction — Mode: ${mode.toUpperCase()} | Deep Fetch: ${deepFetch ? "ON" : "OFF"} | Team ID: ${teamId} | Player ID: ${playerId}`);

    try {
      const scraper = await runScraper(url.trim(), mode, deepFetch, logScrape, setScrapeProgress, teamId, playerId);
      scraperControl.current = scraper.stop;
      
      const { teams, players } = scraper.result;
      if (!teams.length || !players.length) throw new Error("Failed to extract sufficient team or player data.");

      setRawScrapeData({ teams, players });
      setScrapeProgress(100);
      logScrape(`✅ Extraction Complete! ${players.length} players across ${teams.length} teams locked.`);

    } catch (e) {
      logScrape(`❌ Fatal Error: ${e.message}`);
    } finally {
      setIsScraping(false);
    }
  };

  const handleStopScrape = () => {
    if (scraperControl.current) {
      scraperControl.current();
      logScrape("🛑 Process halted by user command.");
      setIsScraping(false);
    }
  };

  const handleDownloadRaw = () => {
    if (!rawScrapeData) return;
    logScrape("💾 Compiling Raw Excel Spreadsheet...");
    const wb = XLSX.utils.book_new();
    const wsTeams = XLSX.utils.json_to_sheet(rawScrapeData.teams);
    const wsPlayers = XLSX.utils.json_to_sheet(rawScrapeData.players);
    XLSX.utils.book_append_sheet(wb, wsTeams, "Teams");
    XLSX.utils.book_append_sheet(wb, wsPlayers, "Players");
    XLSX.writeFile(wb, `TM_Raw_Data_${Date.now()}.xlsx`);
    logScrape("✅ Spreadsheet downloaded successfully!");
  };

  // ==========================================
  // STEP 2: PROCESSING (EA DB Compiler)
  // ==========================================
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    logProcess(`Ingesting raw spreadsheet: ${file.name}`);
  };

  const handleProcessDb = async () => {
    if (!uploadedFile) return;
    setIsProcessing(true);
    setFinalDbData(null);
    logProcess("Matrix active. Parsing spreadsheet tables...");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, { type: 'binary', cellDates: true });
        
        const sheetNames = workbook.SheetNames;
        const teamSheetName = sheetNames.find(s => s.toLowerCase() === 'teams');
        const playerSheetName = sheetNames.find(s => s.toLowerCase() === 'players');
        
        if (!teamSheetName || !playerSheetName) throw new Error("Workbook must contain 'Teams' and 'Players' sheets.");

        const teams = XLSX.utils.sheet_to_json(workbook.Sheets[teamSheetName]);
        const players = XLSX.utils.sheet_to_json(workbook.Sheets[playerSheetName]);
        
        logProcess(`Parsed ${teams.length} teams and ${players.length} players. Aligning templates...`);
        
        setTimeout(() => {
          const processedTables = processData(teams, players, mode === 'worldcup');
          setFinalDbData(processedTables);
          logProcess("✅ DB architecture compiled successfully. Ready for export.");
          setIsProcessing(false);
        }, 800); 

      } catch (error) {
        logProcess(`❌ Processing failed: ${error.message}`);
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleDownloadDb = () => {
    if (!finalDbData) return;
    logProcess("💾 Compiling Master EA Tables...");
    const wb = XLSX.utils.book_new();

    Object.entries(finalDbData).forEach(([tableName, rows]) => {
      if (rows.length === 0) return;
      const dataWithHeaders = [templates[tableName].columns, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(dataWithHeaders);
      XLSX.utils.book_append_sheet(wb, ws, tableName);
    });

    XLSX.writeFile(wb, `EA_Database_Tables_${Date.now()}.xlsx`);
    logProcess("✅ Master Database downloaded successfully!");
  };

  // Shared input style
  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    background: "rgba(0,0,0,0.2)",
    border: "1px solid var(--glass-border)",
    borderRadius: '8px',
    color: "#fff",
    outline: "none",
    fontFamily: "'Poppins', sans-serif",
    fontSize: '0.9rem'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '1100px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '300', marginBottom: '0.25rem' }}>Team Maker Matrix</h1>
          <p style={{ color: 'var(--text-muted)' }}>Automated Transfermarkt extraction and EA database compilation.</p>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)', padding: '0.6rem 1.2rem', borderRadius: '30px', border: '1px solid var(--glass-border)' }}
        >
          <Database size={16} color="var(--accent-color)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)' }}>Pipeline Offline v3.0</span>
        </motion.div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        
        {/* ======================= STEP 1: EXTRACTION ======================= */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '500', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: 'var(--accent-color)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>STEP 1</span>
              Web Extraction
            </h3>
          </div>
          
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
            
            {/* Target URL */}
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>TARGET URL</label>
              <input 
                type="text" value={url} onChange={e => setUrl(e.target.value)} disabled={isScraping}
                placeholder="https://www.transfermarkt.com/..."
                style={inputStyle} 
              />
            </div>

            {/* Scraping Mode */}
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>SCRAPING MODE</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {MODES.map(m => (
                  <motion.button 
                    key={m.id} whileTap={{ scale: 0.95 }} onClick={() => !isScraping && setMode(m.id)}
                    style={{
                      flex: 1, padding: "0.8rem 0.5rem", borderRadius: '8px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                      background: mode === m.id ? "rgba(0,255,204,0.1)" : "rgba(0,0,0,0.2)",
                      border: mode === m.id ? "1px solid var(--accent-color)" : "1px solid var(--glass-border)",
                      color: mode === m.id ? "var(--accent-color)" : "var(--text-muted)", cursor: isScraping ? "not-allowed" : "pointer"
                    }}>
                    <span>{m.icon}</span> <span>{m.label}</span>
                  </motion.button>
                ))}
              </div>
              
              <label className="checkbox-group" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                <input 
                  type="checkbox" 
                  checked={deepFetch} 
                  onChange={() => setDeepFetch(!deepFetch)} 
                  disabled={isScraping} 
                />
                Deep Fetch Profiles (Slower, Accurate Nation/Foot)
              </label>
            </div>

            {/* Starting IDs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
                  START TEAM ID
                </label>
                <input 
                  type="number" value={startTeamId} onChange={e => setStartTeamId(e.target.value)} disabled={isScraping}
                  placeholder="1001"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
                  START PLAYER ID
                </label>
                <input 
                  type="number" value={startPlayerId} onChange={e => setStartPlayerId(e.target.value)} disabled={isScraping}
                  placeholder="200000"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: 'auto' }}>
              <button 
                onClick={handleStartScrape} disabled={isScraping} className="btn-primary"
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isScraping ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                {isScraping ? "EXTRACTING..." : "COMMENCE EXTRACTION"}
              </button>
              <button 
                onClick={handleStopScrape} disabled={!isScraping} className="btn-primary"
                style={{ flex: 1, background: 'transparent', borderColor: isScraping ? '#ff4444' : 'var(--glass-border)', color: isScraping ? '#ff4444' : 'var(--text-muted)' }}>
                <StopCircle size={18} style={{ margin: '0 auto' }} />
              </button>
            </div>

            {/* Progress Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "-1rem" }}>
              <span style={{ color: "#555" }}>{isScraping ? "RUNNING" : "IDLE"}</span>
              <span style={{ color: "var(--accent-color)" }}>{scrapeProgress}%</span>
            </div>
            <div style={{ height: 4, background: "rgba(0,0,0,0.3)", overflow: "hidden", borderRadius: '2px' }}>
              <motion.div animate={{ width: `${scrapeProgress}%` }} transition={{ duration: 0.3 }} style={{ height: "100%", background: "var(--accent-color)" }} />
            </div>

            {/* Download Raw */}
            <AnimatePresence>
              {rawScrapeData && !isScraping && (
                <motion.button 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  onClick={handleDownloadRaw} className="btn-primary"
                  style={{ width: "100%", background: 'var(--accent-color)', color: '#000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Download size={18} /> DOWNLOAD SPREADSHEET
                </motion.button>
              )}
            </AnimatePresence>

            {/* Logs */}
            <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '8px', padding: '1rem', height: '120px', overflowY: 'auto', border: '1px solid var(--glass-border)' }}>
              {scrapeLogs.map((log, i) => (
                <div key={i} style={{ color: log.includes('❌') ? '#ff4444' : log.includes('✅') ? 'var(--accent-color)' : '#8a8d98', fontSize: '0.8rem', marginBottom: '4px', fontFamily: 'monospace' }}>
                  {log}
                </div>
              ))}
              <div ref={scrapeLogEndRef} />
            </div>
          </div>
        </div>

        {/* ======================= STEP 2: PROCESSING ======================= */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '500', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: 'var(--accent-color)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>STEP 2</span>
              Database Compiler
            </h3>
          </div>

          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
            
            {/* File Upload */}
            <motion.div 
              onClick={() => fileInputRef.current.click()}
              whileHover={{ scale: 1.01, borderColor: 'var(--accent-color)', backgroundColor: 'rgba(0, 255, 204, 0.05)' }}
              whileTap={{ scale: 0.99 }}
              style={{
                border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '3rem 1rem', 
                textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.3)',
              }}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls" style={{ display: 'none' }} />
              <UploadCloud size={40} color={uploadedFile ? "var(--accent-color)" : "var(--text-muted)"} style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontWeight: '500', marginBottom: '0.25rem', fontSize: '1rem', color: uploadedFile ? '#fff' : 'inherit' }}>
                {uploadedFile ? uploadedFile.name : "Import Spreadsheet"}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Drop your exported .xlsx from Step 1 here</p>
            </motion.div>

            {/* Process Button */}
            <button 
              onClick={handleProcessDb} disabled={!uploadedFile || isProcessing} className="btn-primary"
              style={{ width: '100%', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
              {isProcessing ? "COMPILING TABLES..." : "PROCESS EA DATABASE"}
            </button>

            {/* Export Final */}
            <AnimatePresence>
              {finalDbData && !isProcessing && (
                <motion.button 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  onClick={handleDownloadDb} className="btn-primary"
                  style={{ width: "100%", background: 'var(--accent-color)', color: '#000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Download size={18} /> EXPORT FINAL TABLES
                </motion.button>
              )}
            </AnimatePresence>

            {/* Logs */}
            <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '8px', padding: '1rem', height: '120px', overflowY: 'auto', border: '1px solid var(--glass-border)' }}>
              {processLogs.map((log, i) => (
                <div key={i} style={{ color: log.includes('❌') ? '#ff4444' : log.includes('✅') ? 'var(--accent-color)' : '#8a8d98', fontSize: '0.8rem', marginBottom: '4px', fontFamily: 'monospace' }}>
                  {log}
                </div>
              ))}
              <div ref={processLogEndRef} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}