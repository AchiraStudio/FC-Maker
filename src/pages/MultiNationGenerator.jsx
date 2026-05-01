// src/pages/MultiNationGenerator.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  female = false,
  namesData = null
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
  let firstName = `Player_${rand(1000,9999)}`;
  let lastName = `Nation_${nation.replace(/[^a-z]/gi, '')}`;

  if (namesData && namesData[nation]) {
    const fnList = namesData[nation].first_names;
    const lnList = namesData[nation].last_names;
    
    if (fnList && fnList.length > 0) {
      firstName = fnList[rand(0, fnList.length - 1)];
      // 15% chance to have a double/compound first name
      if (Math.random() < 0.15 && fnList.length > 1) {
        let secondFirst = fnList[rand(0, fnList.length - 1)];
        let attempts = 0;
        while(secondFirst === firstName && attempts < 5) {
            secondFirst = fnList[rand(0, fnList.length - 1)];
            attempts++;
        }
        if (secondFirst !== firstName) {
            const separator = Math.random() < 0.3 ? '-' : ' ';
            firstName = `${firstName}${separator}${secondFirst}`;
        }
      }
    }
    
    if (lnList && lnList.length > 0) {
      lastName = lnList[rand(0, lnList.length - 1)];
      // 30% chance to have a double/compound last name
      if (Math.random() < 0.30 && lnList.length > 1) {
        let secondLast = lnList[rand(0, lnList.length - 1)];
        let attempts = 0;
        while(secondLast === lastName && attempts < 5) {
            secondLast = lnList[rand(0, lnList.length - 1)];
            attempts++;
        }
        if (secondLast !== lastName) {
            // Some cultures use hyphens, some use spaces
            const separator = Math.random() < 0.25 ? '-' : ' ';
            lastName = `${lastName}${separator}${secondLast}`;
        }
      }
    }
  }
  
  return {
    given: firstName,
    sur: lastName,
    nickname: "",
    jerseyname: lastName,
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
  female,
  namesData
) => {
  const rows = [];
  for (const { nation, count } of nationCounts) {
    for (let i = 0; i < count; i++) {
      rows.push(generatePlayerRow(nation, ovrMin, ovrMax, ageMin, ageMax, positionWeights, footBias, female, namesData));
    }
  }
  return rows;
};

export default function MultiNationGenerator() {
  const [namesData, setNamesData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetch('/data/nations.json')
      .then(res => res.json())
      .then(data => {
        setNamesData(data);
      })
      .catch(err => console.error("Failed to load nations data:", err));
  }, []);

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
  const [logs, setLogs] = useState(["• Ready. Select nations, adjust settings, then generate."]);
  
  const logUpdate = (msg) => setLogs(prev => [`• ${msg}`, ...prev]);
  
  // Total number of players (sum of counts)
  const totalPlayers = useMemo(() => nationCounts.reduce((sum, nc) => sum + nc.count, 0), [nationCounts]);
  
  const updateNationCountByName = (nationCode, count) => {
    setNationCounts(prev => prev.map(nc => nc.nation === nationCode ? { ...nc, count: Math.max(0, count) } : nc));
  };
  
  // Reset all counts to zero
  const clearAll = () => {
    setNationCounts(nationCounts.map(nc => ({ ...nc, count: 0 })));
    logUpdate("Cleared all nation counts.");
  };

  const addOneToVisible = () => {
    const visibleCodes = new Set(filteredNations.map(n => n.code));
    setNationCounts(prev => prev.map(nc => 
      visibleCodes.has(nc.nation) ? { ...nc, count: nc.count + 1 } : nc
    ));
    logUpdate(`Added 1 player to ${visibleCodes.size} filtered nations.`);
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
        makeWomen,
        namesData
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
      const { playerstableobjtostring26Bytes, editedplayernamesobjtostring26Bytes } = await import('../utils/rm26/smtools.js');
      const bytes1 = playerstableobjtostring26Bytes(generatedPlayers);
      const blob1 = new Blob([bytes1], { type: 'application/octet-stream' });
      const url1 = URL.createObjectURL(blob1);
      const a1 = document.createElement('a');
      a1.href = url1;
      a1.download = `multi-nation-players-${Date.now()}.txt`;
      document.body.appendChild(a1);
      a1.click();
      document.body.removeChild(a1);
      URL.revokeObjectURL(url1);
      
      const bytes2 = editedplayernamesobjtostring26Bytes(generatedPlayers);
      const blob2 = new Blob([bytes2], { type: 'application/octet-stream' });
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

  const filteredNations = useMemo(() => {
    if (!searchQuery) return AVAILABLE_NATIONS;
    const lowerQ = searchQuery.toLowerCase();
    return AVAILABLE_NATIONS.filter(n => n.name.toLowerCase().includes(lowerQ) || n.code.toLowerCase().includes(lowerQ));
  }, [searchQuery]);

  const getCountForNation = (code) => {
    const nc = nationCounts.find(n => n.nation === code);
    return nc ? nc.count : 0;
  };
  
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Multi‑Nation Generator</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Generate realistic players from over 200 nations with dynamically fetched native names.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }}>
        {/* Left panel: Nation Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Search and Bulk Actions */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: '1rem', zIndex: 10 }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <input
                type="text"
                placeholder="Search nations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={addOneToVisible} className="btn-primary" style={{ padding: '0.6rem 1rem' }}>
                <Users size={16} style={{ marginRight: '6px', display: 'inline-block' }} />
                +1 to Visible
              </button>
              <button onClick={clearAll} style={{ padding: '0.6rem 1rem', background: 'rgba(255,100,100,0.15)', border: '1px solid rgba(255,100,100,0.4)', borderRadius: '8px', color: '#ff6464', cursor: 'pointer', fontWeight: '600' }}>
                Clear All
              </button>
            </div>
          </div>

          {/* Grid of Nations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <AnimatePresence>
              {filteredNations.map((nation) => {
                const count = getCountForNation(nation.code);
                const isActive = count > 0;
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={nation.code}
                    className="glass-panel"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      border: isActive ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.05)',
                      background: isActive ? 'rgba(var(--accent-color-rgb), 0.1)' : 'rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                        {nation.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={nation.name}>{nation.name}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.25rem' }}>
                      <button 
                        onClick={() => updateNationCountByName(nation.code, count - 1)}
                        style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={count}
                        onChange={(e) => updateNationCountByName(nation.code, parseInt(e.target.value) || 0)}
                        style={{ width: '50px', textAlign: 'center', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', outline: 'none' }}
                      />
                      <button 
                        onClick={() => updateNationCountByName(nation.code, count + 1)}
                        style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(var(--accent-color-rgb), 0.3)', border: '1px solid var(--accent-color)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        +
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filteredNations.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
                No nations found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
        
        {/* Right panel: Settings & Generate (Sticky) */}
        <div style={{ position: 'sticky', top: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              <Sliders size={20} /> Settings
            </h3>
            
            {/* OVR Range */}
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>OVR Range ({ovrMin} - {ovrMax})</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input type="range" min="30" max="99" value={ovrMin} onChange={(e) => setOvrMin(parseInt(e.target.value))} style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '8px' }}>
                <input type="range" min="30" max="99" value={ovrMax} onChange={(e) => setOvrMax(parseInt(e.target.value))} style={{ flex: 1 }} />
              </div>
            </div>
            
            {/* Age Range */}
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>Age Range ({ageMin} - {ageMax})</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input type="range" min="15" max="40" value={ageMin} onChange={(e) => setAgeMin(parseInt(e.target.value))} style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '8px' }}>
                <input type="range" min="15" max="45" value={ageMax} onChange={(e) => setAgeMax(parseInt(e.target.value))} style={{ flex: 1 }} />
              </div>
            </div>
            
            {/* Position Distribution */}
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>Position Weights</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                {POSITION_GROUPS.map(group => (
                  <React.Fragment key={group.weightKey}>
                    <span style={{ fontSize: '0.85rem' }}>{group.label}</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={positionWeights[group.weightKey]}
                      onChange={(e) => updateWeight(group.weightKey, parseFloat(e.target.value))}
                      style={{ width: '120px' }}
                    />
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {/* Foot Bias */}
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>Right‑foot bias ({(footBias * 100).toFixed(0)}%)</label>
              <input type="range" min="0.5" max="1" step="0.01" value={footBias} onChange={(e) => setFootBias(parseFloat(e.target.value))} style={{ width: '100%' }} />
            </div>
            
            {/* Checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <label className="checkbox-group" style={{ cursor: 'pointer', padding: '0.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <input type="checkbox" checked={makeWomen} onChange={() => setMakeWomen(!makeWomen)} />
                <span style={{ marginLeft: '8px' }}>Female Players</span>
              </label>
              <label className="checkbox-group" style={{ cursor: 'pointer', padding: '0.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <input type="checkbox" checked={optimisticMode} onChange={() => setOptimisticMode(!optimisticMode)} />
                <span style={{ marginLeft: '8px' }}>Optimistic Potential</span>
              </label>
            </div>
            
            <AnimatePresence>
              {optimisticMode && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(var(--accent-color-rgb), 0.3)' }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>Boost: +{boostAmount}</span>
                  <input type="range" min="1" max="15" value={boostAmount} onChange={(e) => setBoostAmount(parseInt(e.target.value))} style={{ flex: 1 }} />
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total Players:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-color)' }}>{totalPlayers}</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary"
                disabled={isGenerating || totalPlayers === 0}
                onClick={generatePlayers}
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(var(--accent-color-rgb), 0.4)' }}
              >
                {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
                {isGenerating ? `Generating...` : `Download (${totalPlayers})`}
              </motion.button>
            </div>
          </div>

          {/* Logs */}
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(10,12,16,0.8)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Activity Log</h4>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#a0a5b5', fontSize: '0.8rem', height: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ color: log.includes('✅') ? '#4ade80' : log.includes('❌') ? '#f87171' : 'inherit' }}>
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}