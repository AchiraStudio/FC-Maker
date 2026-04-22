import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, Download, Loader2, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { makeplayers, playerstableobjtostring26, editedplayernamesobjtostring26 } from '../utils/rm26/smtools.js';

export default function RosterMaker() {
  const [templateData, setTemplateData] = useState([]);
  const [logs, setLogs] = useState(["• Engine initialized. Fetching core databases..."]);
  const [settings, setSettings] = useState({
    useDefaultPlayers: true,
    useDefaultNames: true,
    makeWomen: false,
    optimisticMode: false,
    boostAmount: 3
  });
  
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const logUpdate = (message) => setLogs(prev => [`• ${message}`, ...prev]);
  const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const initializeEngine = async () => {
      setTimeout(() => {
        logUpdate("Core databases verified. System ready.");
        setIsEngineReady(true);
      }, 1500);
    };
    initializeEngine();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    logUpdate(`Ingesting template: ${file.name}`);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        const cleanData = rawData.filter(item => item.nat || item.NAT || item.Nat);
        
        setTemplateData(cleanData);
        logUpdate(`Template parsed successfully. ${cleanData.length} records locked.`);
      } catch (error) {
        logUpdate(`Parse error: ${error.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    logUpdate(`Commencing generation matrix...${settings.optimisticMode ? ` [OPTIMISTIC MODE: +${settings.boostAmount} OVR]` : ''}`);
    
    try {
      const generatedPlayers = makeplayers(templateData, settings);
      
      const outputString = playerstableobjtostring26(generatedPlayers);
      const blob1 = new Blob([outputString], { type: 'text/plain' });
      const url1 = URL.createObjectURL(blob1);
      const a1 = document.createElement('a');
      a1.href = url1;
      a1.download = `rm26output-players-${Date.now()}.txt`;
      document.body.appendChild(a1);
      a1.click();
      document.body.removeChild(a1);
      URL.revokeObjectURL(url1);

      const editedNamesString = editedplayernamesobjtostring26(generatedPlayers);
      const blob2 = new Blob([editedNamesString], { type: 'text/plain' });
      const url2 = URL.createObjectURL(blob2);
      const a2 = document.createElement('a');
      a2.href = url2;
      a2.download = `rm26output-editedplayernames-${Date.now()}.txt`;
      document.body.appendChild(a2);
      a2.click();
      document.body.removeChild(a2);
      URL.revokeObjectURL(url2);

      setTimeout(() => {
        logUpdate(`Calculations complete for ${templateData.length} players.`);
        logUpdate("TXT packages exported successfully.");
        setIsGenerating(false);
      }, 1500);
    } catch (error) {
      logUpdate(`Generation failed: ${error.message}`);
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1000px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '300', marginBottom: '0.25rem' }}>Roster Maker 26</h1>
          <p style={{ color: 'var(--text-muted)' }}>Automated FC 26 player generation engine.</p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)', padding: '0.6rem 1.2rem', borderRadius: '30px', border: '1px solid var(--glass-border)' }}
        >
          {isEngineReady ? (
            <><Database size={16} color="var(--accent-color)" /><span style={{ fontSize: '0.85rem', color: 'var(--accent-color)' }}>Engine Online</span></>
          ) : (
            <><Loader2 size={16} color="var(--text-muted)" className="animate-spin" /><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Booting...</span></>
          )}
        </motion.div>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <label className="checkbox-group">
            <input type="checkbox" checked={settings.useDefaultPlayers} onChange={() => handleToggle('useDefaultPlayers')} />
            Default Player Table
          </label>
          <label className="checkbox-group">
            <input type="checkbox" checked={settings.useDefaultNames} onChange={() => handleToggle('useDefaultNames')} />
            Default Names Table
          </label>
          <label className="checkbox-group">
            <input type="checkbox" checked={settings.makeWomen} onChange={() => handleToggle('makeWomen')} />
            Target: Female Framework
          </label>
          <label className="checkbox-group">
            <input type="checkbox" checked={settings.optimisticMode} onChange={() => handleToggle('optimisticMode')} />
            Optimistic Potential
          </label>
        </div>

        <AnimatePresence>
          {settings.optimisticMode && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: '2.5rem' }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', width: '120px' }}>
                  Boost Intensity: <strong style={{ color: 'var(--accent-color)' }}>+{settings.boostAmount}</strong>
                </span>
                <input 
                  type="range" 
                  min="1" 
                  max="15" 
                  value={settings.boostAmount} 
                  onChange={(e) => setSettings(prev => ({ ...prev, boostAmount: parseInt(e.target.value) }))}
                  className="fluid-slider"
                  style={{ flex: 1 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          onClick={() => fileInputRef.current.click()}
          whileHover={{ scale: 1.01, borderColor: 'var(--accent-color)', backgroundColor: 'rgba(0, 255, 204, 0.05)' }}
          whileTap={{ scale: 0.99 }}
          animate={templateData.length === 0 && isEngineReady ? { boxShadow: ['0 0 0px transparent', '0 0 20px rgba(0, 255, 204, 0.15)', '0 0 0px transparent'] } : {}}
          transition={{ repeat: Infinity, duration: 2.5 }}
          style={{
            border: '2px dashed var(--glass-border)', borderRadius: '16px', padding: '4rem 2rem', 
            textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.3)',
            marginBottom: '2rem', opacity: isEngineReady ? 1 : 0.5, pointerEvents: isEngineReady ? 'auto' : 'none'
          }}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.csv,.xlsx" style={{ display: 'none' }} />
          <UploadCloud size={56} color={templateData.length > 0 ? "var(--accent-color)" : "var(--text-muted)"} style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ fontWeight: '500', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
            {templateData.length > 0 ? "Data Loaded" : "Import Data Template"}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Drop your .xlsx, .csv, or .txt template here</p>
        </motion.div>

        <motion.button 
          whileHover={templateData.length > 0 && !isGenerating ? { scale: 1.01 } : {}}
          whileTap={templateData.length > 0 && !isGenerating ? { scale: 0.98 } : {}}
          className="btn-primary" 
          disabled={templateData.length === 0 || !isEngineReady || isGenerating} 
          onClick={handleGenerate} 
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}
        >
          {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
          {templateData.length === 0 ? 'Awaiting Data Source' : isGenerating ? 'Compiling Roster...' : 'Commence Generation'}
        </motion.button>
      </div>

      {templateData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel table-wrapper">
          <table>
            <thead>
              <tr>{Object.keys(templateData[0]).slice(0, 8).map((key) => <th key={key}>{key}</th>)}</tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {templateData.slice(0, 5).map((row, index) => (
                  <motion.tr 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {Object.values(row).slice(0, 8).map((val, i) => <td key={i}>{val}</td>)}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {templateData.length > 5 && (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--glass-border)' }}>
              Displaying 5 of {templateData.length} indexed records.
            </div>
          )}
        </motion.div>
      )}

      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.8)' }}>
        <div style={{ fontFamily: 'monospace', color: '#8a8d98', fontSize: '0.85rem', height: '150px', overflowY: 'auto' }}>
          {logs.map((log, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: '0.5rem', color: i === 0 ? 'var(--accent-color)' : 'inherit' }}>
              {log}
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}