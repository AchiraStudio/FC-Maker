// src/pages/MultiNationGenerator.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, Flag, Users, Sliders, CheckSquare, Square } from 'lucide-react';
import { makeplayers } from '../utils/rm26/smtools.js';

// Available nations with their display name and internal name (used in templates)
const AVAILABLE_NATIONS = [
  { code: "Afghanistan", name: "Afghanistan" },
  { code: "Albania", name: "Albania" },
  { code: "Algeria", name: "Algeria" },
  { code: "American Samoa", name: "American Samoa" },
  { code: "Andorra", name: "Andorra" },
  { code: "Angola", name: "Angola" },
  { code: "Anguilla", name: "Anguilla" },
  { code: "Antigua and Barbuda", name: "Antigua and Barbuda" },
  { code: "Argentina", name: "Argentina" },
  { code: "Armenia", name: "Armenia" },
  { code: "Aruba", name: "Aruba" },
  { code: "Australia", name: "Australia" },
  { code: "Austria", name: "Austria" },
  { code: "Azerbaijan", name: "Azerbaijan" },
  { code: "Bahamas", name: "Bahamas" },
  { code: "Bahrain", name: "Bahrain" },
  { code: "Bangladesh", name: "Bangladesh" },
  { code: "Barbados", name: "Barbados" },
  { code: "Belarus", name: "Belarus" },
  { code: "Belgium", name: "Belgium" },
  { code: "Belize", name: "Belize" },
  { code: "Benin", name: "Benin" },
  { code: "Bermuda", name: "Bermuda" },
  { code: "Bhutan", name: "Bhutan" },
  { code: "Bolivia", name: "Bolivia" },
  { code: "Bosnia and Herzegovina", name: "Bosnia and Herzegovina" },
  { code: "Botswana", name: "Botswana" },
  { code: "Brazil", name: "Brazil" },
  { code: "British Virgin Islands", name: "British Virgin Islands" },
  { code: "Brunei Darussalam", name: "Brunei Darussalam" },
  { code: "Bulgaria", name: "Bulgaria" },
  { code: "Burkina Faso", name: "Burkina Faso" },
  { code: "Burundi", name: "Burundi" },
  { code: "Cambodia", name: "Cambodia" },
  { code: "Cameroon", name: "Cameroon" },
  { code: "Canada", name: "Canada" },
  { code: "Cape Verde", name: "Cape Verde" },
  { code: "Cayman Islands", name: "Cayman Islands" },
  { code: "Central African Republic", name: "Central African Republic" },
  { code: "Chad", name: "Chad" },
  { code: "Chile", name: "Chile" },
  { code: "China", name: "China" },
  { code: "Chinese Taipei", name: "Chinese Taipei" },
  { code: "Colombia", name: "Colombia" },
  { code: "Comoros", name: "Comoros" },
  { code: "Congo", name: "Congo" },
  { code: "Congo DR", name: "Congo DR" },
  { code: "Cook Islands", name: "Cook Islands" },
  { code: "Costa Rica", name: "Costa Rica" },
  { code: "Croatia", name: "Croatia" },
  { code: "Cuba", name: "Cuba" },
  { code: "Curaçao", name: "Curaçao" },
  { code: "Cyprus", name: "Cyprus" },
  { code: "Czechia", name: "Czechia" },
  { code: "Denmark", name: "Denmark" },
  { code: "Djibouti", name: "Djibouti" },
  { code: "Dominica", name: "Dominica" },
  { code: "Dominican Republic", name: "Dominican Republic" },
  { code: "Ecuador", name: "Ecuador" },
  { code: "Egypt", name: "Egypt" },
  { code: "El Salvador", name: "El Salvador" },
  { code: "England", name: "England" },
  { code: "Equatorial Guinea", name: "Equatorial Guinea" },
  { code: "Eritrea", name: "Eritrea" },
  { code: "Estonia", name: "Estonia" },
  { code: "Eswatini", name: "Eswatini" },
  { code: "Ethiopia", name: "Ethiopia" },
  { code: "Faroe Islands", name: "Faroe Islands" },
  { code: "Fiji", name: "Fiji" },
  { code: "Finland", name: "Finland" },
  { code: "France", name: "France" },
  { code: "Gabon", name: "Gabon" },
  { code: "Georgia", name: "Georgia" },
  { code: "Germany", name: "Germany" },
  { code: "Ghana", name: "Ghana" },
  { code: "Gibraltar", name: "Gibraltar" },
  { code: "Greece", name: "Greece" },
  { code: "Greenland", name: "Greenland" },
  { code: "Grenada", name: "Grenada" },
  { code: "Guam", name: "Guam" },
  { code: "Guatemala", name: "Guatemala" },
  { code: "Guinea", name: "Guinea" },
  { code: "Guinea-Bissau", name: "Guinea-Bissau" },
  { code: "Guyana", name: "Guyana" },
  { code: "Haiti", name: "Haiti" },
  { code: "Honduras", name: "Honduras" },
  { code: "Hong Kong", name: "Hong Kong" },
  { code: "Hungary", name: "Hungary" },
  { code: "Iceland", name: "Iceland" },
  { code: "India", name: "India" },
  { code: "Indonesia", name: "Indonesia" },
  { code: "Iran", name: "Iran" },
  { code: "Iraq", name: "Iraq" },
  { code: "Ireland", name: "Ireland" },
  { code: "Israel", name: "Israel" },
  { code: "Italy", name: "Italy" },
  { code: "Ivory Coast", name: "Ivory Coast" },
  { code: "Jamaica", name: "Jamaica" },
  { code: "Japan", name: "Japan" },
  { code: "Jordan", name: "Jordan" },
  { code: "Kazakhstan", name: "Kazakhstan" },
  { code: "Kenya", name: "Kenya" },
  { code: "Korea DPR", name: "Korea DPR" },
  { code: "Korea Republic", name: "Korea Republic" },
  { code: "Kosovo", name: "Kosovo" },
  { code: "Kuwait", name: "Kuwait" },
  { code: "Kyrgyzstan", name: "Kyrgyzstan" },
  { code: "Laos", name: "Laos" },
  { code: "Latvia", name: "Latvia" },
  { code: "Lebanon", name: "Lebanon" },
  { code: "Lesotho", name: "Lesotho" },
  { code: "Liberia", name: "Liberia" },
  { code: "Libya", name: "Libya" },
  { code: "Liechtenstein", name: "Liechtenstein" },
  { code: "Lithuania", name: "Lithuania" },
  { code: "Luxembourg", name: "Luxembourg" },
  { code: "Macau", name: "Macau" },
  { code: "Madagascar", name: "Madagascar" },
  { code: "Malawi", name: "Malawi" },
  { code: "Malaysia", name: "Malaysia" },
  { code: "Maldives", name: "Maldives" },
  { code: "Mali", name: "Mali" },
  { code: "Malta", name: "Malta" },
  { code: "Mauritania", name: "Mauritania" },
  { code: "Mauritius", name: "Mauritius" },
  { code: "Mexico", name: "Mexico" },
  { code: "Moldova", name: "Moldova" },
  { code: "Mongolia", name: "Mongolia" },
  { code: "Montenegro", name: "Montenegro" },
  { code: "Montserrat", name: "Montserrat" },
  { code: "Morocco", name: "Morocco" },
  { code: "Mozambique", name: "Mozambique" },
  { code: "Myanmar", name: "Myanmar" },
  { code: "Namibia", name: "Namibia" },
  { code: "Nepal", name: "Nepal" },
  { code: "Netherlands", name: "Netherlands" },
  { code: "New Caledonia", name: "New Caledonia" },
  { code: "New Zealand", name: "New Zealand" },
  { code: "Nicaragua", name: "Nicaragua" },
  { code: "Niger", name: "Niger" },
  { code: "Nigeria", name: "Nigeria" },
  { code: "North Macedonia", name: "North Macedonia" },
  { code: "Northern Ireland", name: "Northern Ireland" },
  { code: "Norway", name: "Norway" },
  { code: "Oman", name: "Oman" },
  { code: "Pakistan", name: "Pakistan" },
  { code: "Palestine", name: "Palestine" },
  { code: "Panama", name: "Panama" },
  { code: "Papua New Guinea", name: "Papua New Guinea" },
  { code: "Paraguay", name: "Paraguay" },
  { code: "Peru", name: "Peru" },
  { code: "Philippines", name: "Philippines" },
  { code: "Poland", name: "Poland" },
  { code: "Portugal", name: "Portugal" },
  { code: "Puerto Rico", name: "Puerto Rico" },
  { code: "Qatar", name: "Qatar" },
  { code: "Romania", name: "Romania" },
  { code: "Russia", name: "Russia" },
  { code: "Rwanda", name: "Rwanda" },
  { code: "Saint Lucia", name: "Saint Lucia" },
  { code: "Samoa", name: "Samoa" },
  { code: "San Marino", name: "San Marino" },
  { code: "Saudi Arabia", name: "Saudi Arabia" },
  { code: "Scotland", name: "Scotland" },
  { code: "Senegal", name: "Senegal" },
  { code: "Serbia", name: "Serbia" },
  { code: "Seychelles", name: "Seychelles" },
  { code: "Sierra Leone", name: "Sierra Leone" },
  { code: "Singapore", name: "Singapore" },
  { code: "Slovakia", name: "Slovakia" },
  { code: "Slovenia", name: "Slovenia" },
  { code: "Solomon Islands", name: "Solomon Islands" },
  { code: "Somalia", name: "Somalia" },
  { code: "South Africa", name: "South Africa" },
  { code: "South Sudan", name: "South Sudan" },
  { code: "Spain", name: "Spain" },
  { code: "Sri Lanka", name: "Sri Lanka" },
  { code: "St. Kitts and Nevis", name: "St. Kitts and Nevis" },
  { code: "St. Vincent and the Grenadines", name: "St. Vincent and the Grenadines" },
  { code: "Sudan", name: "Sudan" },
  { code: "Suriname", name: "Suriname" },
  { code: "Sweden", name: "Sweden" },
  { code: "Switzerland", name: "Switzerland" },
  { code: "Syria", name: "Syria" },
  { code: "São Tomé and Príncipe", name: "São Tomé and Príncipe" },
  { code: "Tahiti", name: "Tahiti" },
  { code: "Tajikistan", name: "Tajikistan" },
  { code: "Tanzania", name: "Tanzania" },
  { code: "Thailand", name: "Thailand" },
  { code: "The Gambia", name: "The Gambia" },
  { code: "Timor-Leste", name: "Timor-Leste" },
  { code: "Togo", name: "Togo" },
  { code: "Tonga", name: "Tonga" },
  { code: "Trinidad and Tobago", name: "Trinidad and Tobago" },
  { code: "Tunisia", name: "Tunisia" },
  { code: "Turkey", name: "Turkey" },
  { code: "Turkmenistan", name: "Turkmenistan" },
  { code: "Turks and Caicos Islands", name: "Turks and Caicos Islands" },
  { code: "US Virgin Islands", name: "US Virgin Islands" },
  { code: "Uganda", name: "Uganda" },
  { code: "Ukraine", name: "Ukraine" },
  { code: "United Arab Emirates", name: "United Arab Emirates" },
  { code: "United States", name: "United States" },
  { code: "Uruguay", name: "Uruguay" },
  { code: "Uzbekistan", name: "Uzbekistan" },
  { code: "Vanuatu", name: "Vanuatu" },
  { code: "Venezuela", name: "Venezuela" },
  { code: "Vietnam", name: "Vietnam" },
  { code: "Wales", name: "Wales" },
  { code: "Yemen", name: "Yemen" },
  { code: "Zambia", name: "Zambia" },
  { code: "Zimbabwe", name: "Zimbabwe" },
];

// Position groups with their internal IDs (as used by Roster Maker)
const POSITION_GROUPS = [
  { label: "Goalkeeper (GK)",   positions: ["GK"], weightKey: "gk" },
  { label: "Defender (CB/LB/RB)", positions: ["CB","LB","RB"], weightKey: "def" },
  { label: "Midfielder (CDM/CM/CAM)", positions: ["CDM","CM","CAM"], weightKey: "mid" },
  { label: "Winger (LW/RW)",     positions: ["LW","RW"], weightKey: "wing" },
  { label: "Striker (ST/CF)",    positions: ["ST","CF"], weightKey: "att" },
];

// Helper: weighted random selection
const weightedRandom = (options, weights) => {
  const total = weights.reduce((a,b) => a+b, 0);
  let r = Math.random() * total;
  let acc = 0;
  for (let i = 0; i < options.length; i++) {
    acc += weights[i];
    if (r < acc) return options[i];
  }
  return options[0];
};

// Generate a random integer between min and max (inclusive)
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate a single player template row
const generatePlayerRow = (
  nation,
  ovrMin, ovrMax,
  ageMin, ageMax,
  positionWeights, // object with keys: gk, def, mid, wing, att
  footBias = 0.8, // probability of right foot
  female = false
) => {
  // 1. Overall rating
  const ovr = rand(ovrMin, ovrMax);
  
  // 2. Age and birthdate
  const age = rand(ageMin, ageMax);
  const currentYear = 2026;
  const birthYear = currentYear - age;
  const birthMonth = rand(1, 12);
  const birthDay = rand(1, 28);
  const birthdate = `${birthYear}-${String(birthMonth).padStart(2,'0')}-${String(birthDay).padStart(2,'0')}`;
  
  // 3. Position selection based on weights
  const positionPool = [];
  const weightValues = [];
  for (const group of POSITION_GROUPS) {
    for (const pos of group.positions) {
      positionPool.push(pos);
      weightValues.push(positionWeights[group.weightKey]);
    }
  }
  const primaryPos = weightedRandom(positionPool, weightValues);
  
  // 4. Secondary positions (optional)
  let secondaryPos = null;
  if (Math.random() < 0.4) {
    const otherPositions = positionPool.filter(p => p !== primaryPos);
    if (otherPositions.length) {
      secondaryPos = otherPositions[Math.floor(Math.random() * otherPositions.length)];
    }
  }
  let tertiaryPos = null;
  if (Math.random() < 0.2 && secondaryPos) {
    const remaining = positionPool.filter(p => p !== primaryPos && p !== secondaryPos);
    if (remaining.length) tertiaryPos = remaining[Math.floor(Math.random() * remaining.length)];
  }
  
  // 5. Foot and weak foot
  const foot = Math.random() < footBias ? "Right" : "Left";
  const weakFootValue = rand(1, 5);
  const weakFootText = ["Terrible","Bad","Average","Good","Excellent"][weakFootValue - 1];
  
  // 6. Height and weight (realistic ranges)
  let height = 180;
  let weight = 75;
  if (primaryPos === "GK") {
    height = rand(185, 198);
    weight = rand(80, 95);
  } else if (primaryPos === "CB") {
    height = rand(183, 195);
    weight = rand(78, 90);
  } else if (primaryPos === "ST") {
    height = rand(178, 190);
    weight = rand(73, 85);
  } else {
    height = rand(168, 185);
    weight = rand(65, 80);
  }
  
  // 7. First and last name from predefined lists (we'll use placeholder names)
  // To keep it simple, we'll use generic names; users can edit later.
  const firstName = `Player_${rand(1000,9999)}`;
  const lastName = `Nation_${nation.replace(/[^a-z]/gi, '')}`;
  
  return {
    given: firstName,
    sur: lastName,
    nickname: "",
    jerseyname: "",
    birthdate,
    height,
    weight,
    foot,
    weakfoot: weakFootText,
    ovr,
    pos1: primaryPos,
    pos2: secondaryPos || "",
    pos3: tertiaryPos || "",
    nat: nation,
    gender: female ? "Female" : "Male"
  };
};

// Helper to generate multiple players
const generateTemplateData = (
  nationCounts, // array of {nation, count}
  ovrMin, ovrMax,
  ageMin, ageMax,
  positionWeights,
  footBias,
  female
) => {
  const rows = [];
  for (const { nation, count } of nationCounts) {
    for (let i = 0; i < count; i++) {
      rows.push(generatePlayerRow(nation, ovrMin, ovrMax, ageMin, ageMax, positionWeights, footBias, female));
    }
  }
  return rows;
};

export default function MultiNationGenerator() {
  // Selected nations and counts
  const [nationCounts, setNationCounts] = useState(
    AVAILABLE_NATIONS.map(n => ({ nation: n.code, count: 0 }))
  );
  
  // Global settings
  const [ovrMin, setOvrMin] = useState(60);
  const [ovrMax, setOvrMax] = useState(85);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(30);
  const [footBias, setFootBias] = useState(0.8); // right foot bias
  const [makeWomen, setMakeWomen] = useState(false);
  const [optimisticMode, setOptimisticMode] = useState(false);
  const [boostAmount, setBoostAmount] = useState(3);
  const [positionWeights, setPositionWeights] = useState({
    gk: 0.05,
    def: 0.30,
    mid: 0.35,
    wing: 0.15,
    att: 0.15,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState(["• Ready. Select nations, set counts, adjust settings, then generate."]);
  
  const logUpdate = (msg) => setLogs(prev => [`• ${msg}`, ...prev]);
  
  // Total number of players (sum of counts)
  const totalPlayers = useMemo(() => nationCounts.reduce((sum, nc) => sum + nc.count, 0), [nationCounts]);
  
  // Update a nation's count
  const updateNationCount = (index, count) => {
    const newCounts = [...nationCounts];
    newCounts[index].count = Math.max(0, count);
    setNationCounts(newCounts);
  };
  
  // Select all nations with a default count (e.g., 5 each)
  const selectAll = (count = 10) => {
    setNationCounts(nationCounts.map(nc => ({ ...nc, count })));
    logUpdate(`Set all nations to ${count} players each.`);
  };
  
  // Reset all counts to zero
  const resetCounts = () => {
    setNationCounts(nationCounts.map(nc => ({ ...nc, count: 0 })));
    logUpdate("Cleared all nation counts.");
  };
  
  // Update position weight
  const updateWeight = (key, value) => {
    const newWeights = { ...positionWeights, [key]: value };
    // Normalize to sum 1
    const sum = Object.values(newWeights).reduce((a,b) => a+b, 0);
    if (Math.abs(sum - 1) > 0.001) {
      const factor = 1 / sum;
      for (let k in newWeights) newWeights[k] = newWeights[k] * factor;
    }
    setPositionWeights(newWeights);
  };
  
  const generatePlayers = async () => {
    if (totalPlayers === 0) {
      logUpdate("❌ Please select at least one player to generate.");
      return;
    }
    
    setIsGenerating(true);
    logUpdate(`Generating ${totalPlayers} players...`);
    logUpdate(`OVR range: ${ovrMin}-${ovrMax}, Age: ${ageMin}-${ageMax}`);
    if (optimisticMode) logUpdate(`Optimistic mode ON (boost +${boostAmount} OVR)`);
    if (makeWomen) logUpdate(`Female targets enabled`);
    
    try {
      // Build template data from selected nations and counts
      const nationCountsArray = nationCounts.filter(nc => nc.count > 0).map(nc => ({ nation: nc.nation, count: nc.count }));
      const templateData = generateTemplateData(
        nationCountsArray,
        ovrMin, ovrMax,
        ageMin, ageMax,
        positionWeights,
        footBias,
        makeWomen
      );
      
      // Call makeplayers with settings
      const settings = {
        useDefaultPlayers: true,
        useDefaultNames: true,
        makeWomen: makeWomen,
        optimisticMode: optimisticMode,
        boostAmount: boostAmount
      };
      
      const generatedPlayers = makeplayers(templateData, settings);
      
      // Import the output formatters from smtools.js (they are also exported)
      const { playerstableobjtostring26, editedplayernamesobjtostring26 } = await import('../utils/rm26/smtools.js');
      const outputString = playerstableobjtostring26(generatedPlayers);
      const blob1 = new Blob([outputString], { type: 'text/plain;charset=utf-8' });
      const url1 = URL.createObjectURL(blob1);
      const a1 = document.createElement('a');
      a1.href = url1;
      a1.download = `multi-nation-players-${Date.now()}.txt`;
      document.body.appendChild(a1);
      a1.click();
      document.body.removeChild(a1);
      URL.revokeObjectURL(url1);
      
      const editedNamesString = editedplayernamesobjtostring26(generatedPlayers);
      const blob2 = new Blob([editedNamesString], { type: 'text/plain;charset=utf-8' });
      const url2 = URL.createObjectURL(blob2);
      const a2 = document.createElement('a');
      a2.href = url2;
      a2.download = `multi-nation-names-${Date.now()}.txt`;
      document.body.appendChild(a2);
      a2.click();
      document.body.removeChild(a2);
      URL.revokeObjectURL(url2);
      
      logUpdate(`✅ Generated ${totalPlayers} players successfully.`);
    } catch (error) {
      logUpdate(`❌ Generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div style={{ maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '300', marginBottom: '0.25rem' }}>Multi‑Nation Generator</h1>
        <p style={{ color: 'var(--text-muted)' }}>Generate players from multiple nations with full control over OVR, age, position distribution, and more.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left panel: Nation selection */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flag size={18} /> Nations
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => selectAll(10)} className="btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Select All (10)</button>
              <button onClick={resetCounts} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: 'rgba(255,100,100,0.2)', border: '1px solid #ff6464', borderRadius: '6px', color: '#ff6464', cursor: 'pointer' }}>Clear</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {nationCounts.map((nc, idx) => (
              <div key={nc.nation} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ width: '100px', fontSize: '0.9rem' }}>{nc.nation}</span>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={nc.count}
                  onChange={(e) => updateNationCount(idx, parseInt(e.target.value) || 0)}
                  style={{ width: '80px', ...inputStyle }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>players</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--accent-color)', fontWeight: 'bold' }}>
            Total: {totalPlayers} players
          </div>
        </div>
        
        {/* Right panel: Settings */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} /> Player Attributes
          </h3>
          
          {/* OVR Range */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>OVR Range</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="range" min="30" max="99" value={ovrMin} onChange={(e) => setOvrMin(parseInt(e.target.value))} style={{ flex: 1 }} />
              <span style={{ minWidth: '60px' }}>{ovrMin} - {ovrMax}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '4px' }}>
              <input type="range" min="30" max="99" value={ovrMax} onChange={(e) => setOvrMax(parseInt(e.target.value))} style={{ flex: 1 }} />
            </div>
          </div>
          
          {/* Age Range */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Age Range</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="range" min="15" max="40" value={ageMin} onChange={(e) => setAgeMin(parseInt(e.target.value))} style={{ flex: 1 }} />
              <span style={{ minWidth: '60px' }}>{ageMin} - {ageMax}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '4px' }}>
              <input type="range" min="15" max="45" value={ageMax} onChange={(e) => setAgeMax(parseInt(e.target.value))} style={{ flex: 1 }} />
            </div>
          </div>
          
          {/* Position Distribution */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Position Distribution (weights)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center' }}>
              {POSITION_GROUPS.map(group => (
                <React.Fragment key={group.weightKey}>
                  <span style={{ fontSize: '0.8rem' }}>{group.label}</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={positionWeights[group.weightKey]}
                    onChange={(e) => updateWeight(group.weightKey, parseFloat(e.target.value))}
                    style={{ width: '150px' }}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Foot Bias */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Right‑foot bias</label>
            <input type="range" min="0.5" max="1" step="0.01" value={footBias} onChange={(e) => setFootBias(parseFloat(e.target.value))} style={{ width: '100%' }} />
          </div>
          
          {/* Checkboxes */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <label className="checkbox-group">
              <input type="checkbox" checked={makeWomen} onChange={() => setMakeWomen(!makeWomen)} />
              Female Players
            </label>
            <label className="checkbox-group">
              <input type="checkbox" checked={optimisticMode} onChange={() => setOptimisticMode(!optimisticMode)} />
              Optimistic Potential (+{boostAmount} OVR)
            </label>
          </div>
          
          {optimisticMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.8rem' }}>Boost: +</span>
              <input type="range" min="1" max="15" value={boostAmount} onChange={(e) => setBoostAmount(parseInt(e.target.value))} style={{ flex: 1 }} />
              <span>{boostAmount}</span>
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
            disabled={isGenerating || totalPlayers === 0}
            onClick={generatePlayers}
            style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {isGenerating ? `Generating ${totalPlayers} players...` : `Generate ${totalPlayers} Players`}
          </motion.button>
        </div>
      </div>
      
      {/* Logs */}
      <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.8)' }}>
        <div style={{ fontFamily: 'monospace', color: '#8a8d98', fontSize: '0.85rem', height: '150px', overflowY: 'auto' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: '0.5rem', color: log.includes('✅') ? 'var(--accent-color)' : log.includes('❌') ? '#ff6464' : 'inherit' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '0.5rem 0.75rem',
  background: 'rgba(0,0,0,0.2)',
  border: '1px solid var(--glass-border)',
  borderRadius: '6px',
  color: '#fff',
  fontFamily: "'Poppins', sans-serif",
  fontSize: '0.85rem'
};