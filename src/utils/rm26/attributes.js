import { randbetween, returninrange } from './smtools.js';
import { transfervaluestoovr, positions, nations } from './resources.js';

// ─────────────────────────────────────────────────────────────────────────────
// POSITION PROFILES
// Each position defines:
//   key    → the attributes that matter most (boosted during init)
//   minor  → attributes that matter somewhat
//   dump   → attributes that are nearly irrelevant (get low base values)
// ─────────────────────────────────────────────────────────────────────────────
const POSITION_PROFILES = {
    // GK
    0: {
        key:   ['reactions','gkdiving','gkreflexes','gkhandling','gkpositioning'],
        minor: ['gkkicking','composure'],
        dump:  ['finishing','longshots','crossing','dribbling','shotpower','headingaccuracy',
                'volleys','agility','acceleration','sprintspeed','stamina','jumping',
                'strength','aggression','positioning','vision','interceptions',
                'standingtackle','slidingtackle','defensiveawareness']
    },
    // RB / LB (fullbacks) — asn 2 / 3 map here
    2: {
        key:   ['crossing','defensiveawareness','standingtackle','slidingtackle',
                'interceptions','reactions','sprintspeed','acceleration'],
        minor: ['shortpassing','dribbling','ballcontrol','stamina'],
        dump:  ['finishing','longshots','shotpower','gkdiving','gkreflexes',
                'gkhandling','gkpositioning','gkkicking','volleys','longpassing','vision']
    },
    // CB
    5: {
        key:   ['defensiveawareness','standingtackle','slidingtackle','interceptions',
                'headingaccuracy','strength','jumping','aggression'],
        minor: ['shortpassing','ballcontrol','reactions','sprintspeed'],
        dump:  ['finishing','crossing','dribbling','longshots','shotpower','volleys',
                'acceleration','agility','stamina','vision','positioning',
                'gkdiving','gkreflexes','gkhandling','gkpositioning','gkkicking']
    },
    // CDM
    10: {
        key:   ['defensiveawareness','standingtackle','interceptions','shortpassing',
                'longpassing','ballcontrol','reactions'],
        minor: ['slidingtackle','vision','stamina','strength','aggression'],
        dump:  ['finishing','crossing','longshots','shotpower','volleys','acceleration',
                'sprintspeed','agility','positioning',
                'gkdiving','gkreflexes','gkhandling','gkpositioning','gkkicking']
    },
    // RM / LM (wide midfielders)
    12: {
        key:   ['crossing','dribbling','ballcontrol','shortpassing','sprintspeed',
                'acceleration','stamina','reactions'],
        minor: ['finishing','longpassing','positioning','vision','agility'],
        dump:  ['defensiveawareness','standingtackle','slidingtackle','interceptions',
                'headingaccuracy','strength','jumping','aggression',
                'gkdiving','gkreflexes','gkhandling','gkpositioning','gkkicking']
    },
    // CM
    14: {
        key:   ['shortpassing','longpassing','ballcontrol','vision','reactions','stamina'],
        minor: ['dribbling','finishing','interceptions','positioning','strength'],
        dump:  ['crossing','longshots','shotpower','volleys','sprintspeed','acceleration',
                'agility','heading','jumping','aggression',
                'gkdiving','gkreflexes','gkhandling','gkpositioning','gkkicking']
    },
    // CAM
    18: {
        key:   ['shortpassing','vision','ballcontrol','dribbling','finishing','reactions'],
        minor: ['longpassing','longshots','positioning','agility','acceleration'],
        dump:  ['defensiveawareness','standingtackle','slidingtackle','interceptions',
                'heading','jumping','strength','aggression',
                'gkdiving','gkreflexes','gkhandling','gkpositioning','gkkicking']
    },
    // CF
    21: {
        key:   ['finishing','dribbling','ballcontrol','positioning','reactions','shortpassing'],
        minor: ['shotpower','longshots','acceleration','sprintspeed','vision'],
        dump:  ['defensiveawareness','standingtackle','slidingtackle','interceptions',
                'jumping','strength','aggression','crossing',
                'gkdiving','gkreflexes','gkhandling','gkpositioning','gkkicking']
    },
    // RW / LW
    23: {
        key:   ['dribbling','ballcontrol','finishing','acceleration','sprintspeed',
                'agility','reactions','positioning'],
        minor: ['crossing','shortpassing','longshots','vision'],
        dump:  ['defensiveawareness','standingtackle','slidingtackle','interceptions',
                'heading','jumping','strength','aggression',
                'gkdiving','gkreflexes','gkhandling','gkpositioning','gkkicking']
    },
    // ST
    25: {
        key:   ['finishing','positioning','reactions','shotpower','ballcontrol',
                'headingaccuracy','sprintspeed','acceleration'],
        minor: ['dribbling','shortpassing','volleys','longshots','strength'],
        dump:  ['defensiveawareness','standingtackle','slidingtackle','interceptions',
                'crossing','longpassing','agility','vision',
                'gkdiving','gkreflexes','gkhandling','gkpositioning','gkkicking']
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// ALL ATTRIBUTE KEYS (used for full init)
// ─────────────────────────────────────────────────────────────────────────────
const ALL_ATTRS = [
    'curve','agility','positioning','standingtackle','longpassing','penalties',
    'longshots','gkdiving','interceptions','crossing','gkreflexes','reactions',
    'composure','vision','finishing','dribbling','slidingtackle','sprintspeed',
    'strength','ballcontrol','shotpower','balance','gkkicking','shortpassing',
    'freekickaccuracy','aggression','acceleration','headingaccuracy','gkhandling',
    'jumping','stamina','gkpositioning','defensiveawareness','volleys'
];

// ─────────────────────────────────────────────────────────────────────────────
// CORE VALUE GENERATORS
// ─────────────────────────────────────────────────────────────────────────────

/** Base value for a KEY attribute — tightly clustered around OVR */
function keyval(ovr) {
    const lo = Math.round(ovr * 0.92);
    const hi = Math.round(ovr * 1.08);
    return returninrange(1, 99, randbetween(lo, hi));
}

/** Base value for a MINOR attribute — slightly below OVR */
function minorval(ovr) {
    const lo = Math.round(ovr * 0.78);
    const hi = Math.round(ovr * 0.96);
    return returninrange(1, 99, randbetween(lo, hi));
}

/** Base value for a DUMP attribute — considerably lower */
function dumpval(ovr) {
    const lo = Math.round(ovr * 0.40);
    const hi = Math.round(ovr * 0.68);
    return returninrange(1, 99, randbetween(lo, hi));
}

/** Legacy: flat base used for GK initial population before position adjustment */
export function baseval(ovr) {
    let lo = 20, hi = 39;
    if (ovr < 59) { lo = 15; hi = 35; }
    if (ovr < 49) { lo = 10; hi = 25; }
    if (ovr < 39) { lo = 5;  hi = 15; }
    if (ovr < 29) { lo = 1;  hi = 10; }
    if (ovr < 19) { lo = 1;  hi = 8; }
    if (ovr < 9)  { lo = 1;  hi = 5; }
    return returninrange(1, 99, randbetween(lo, hi));
}

export function basefieldval(ovr) {
    let lo = 40, hi = 60;
    if (ovr < 69) { lo = 38; hi = 48; }
    if (ovr < 59) { lo = 28; hi = 38; }
    if (ovr < 49) { lo = 18; hi = 28; }
    if (ovr < 39) { lo = 13; hi = 23; }
    if (ovr < 29) { lo = 8;  hi = 12; }
    if (ovr < 19) { lo = 5;  hi = 9; }
    if (ovr < 9)  { lo = 1;  hi = 5; }
    return returninrange(1, 99, randbetween(lo, hi));
}

export function getwideplayerphysicalskills(ovr) {
    const lo = Math.round(ovr * 0.975);
    const hi = Math.round(ovr * 1.250);
    return returninrange(1, 99, randbetween(lo, hi));
}

export function getattributevalue(ovr) {
    const lo = Math.round(ovr * 0.90);
    const hi = Math.round(ovr * 1.05);
    return returninrange(1, 99, randbetween(lo, hi));
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART INITIAL ATTRIBUTE GENERATION
// Instead of flat-random for all attrs, we use the position profile to set
// realistic starting values.  GKs need special treatment because their key
// attrs are completely separate from outfield attrs.
// ─────────────────────────────────────────────────────────────────────────────

export function setinitialatttributes(ovr, mappedPos) {
    const profile = POSITION_PROFILES[mappedPos] ?? POSITION_PROFILES[14]; // default CM

    const attrs = {};
    for (const attr of ALL_ATTRS) {
        if (profile.key.includes(attr)) {
            attrs[attr] = keyval(ovr);
        } else if (profile.dump.includes(attr)) {
            attrs[attr] = dumpval(ovr);
        } else {
            attrs[attr] = minorval(ovr); // minor or unspecified
        }
    }
    return attrs;
}

// ─────────────────────────────────────────────────────────────────────────────
// GK ADJUSTMENT — ensures GK attrs are strong; field attrs are weak
// ─────────────────────────────────────────────────────────────────────────────
export function gkadjustment(pos1, pos2, pos3, pos4, ovr, attr) {
    const isGK = (pos1 === 0 || pos2 === 0 || pos3 === 0 || pos4 === 0);
    if (isGK) {
        attr.reactions      = getattributevalue(ovr);
        attr.gkdiving       = getattributevalue(ovr);
        attr.gkreflexes     = getattributevalue(ovr);
        attr.gkhandling     = getattributevalue(ovr);
        attr.gkpositioning  = getattributevalue(ovr);
        attr.gkkicking      = minorval(ovr);
        attr.composure      = minorval(ovr);
    }
    return attr;
}

// ─────────────────────────────────────────────────────────────────────────────
// PER-POSITION ATTRIBUTE BOOST
// Takes the best of the existing value and a freshly-rolled key value,
// ensuring positional relevance without completely overwriting good values.
// ─────────────────────────────────────────────────────────────────────────────
export function getattributesforpos(pos, ovr, attr) {
    const mapped = setmap(pos);
    const profile = POSITION_PROFILES[mapped];
    if (!profile) return attr;

    for (const a of profile.key) {
        if (attr[a] !== undefined) {
            attr[a] = Math.max(attr[a], keyval(ovr));
        }
    }
    for (const a of profile.minor) {
        if (attr[a] !== undefined) {
            attr[a] = Math.max(attr[a], minorval(ovr));
        }
    }
    return attr;
}

// ─────────────────────────────────────────────────────────────────────────────
// POSITION MAPPING — collapses similar positions into archetype buckets
// ─────────────────────────────────────────────────────────────────────────────
export function setmap(pos) {
    const positionMapping = {
        1: 5, 4: 5, 6: 5,          // CB variants → 5
        8: 2,                       // RB → 2
        7: 3,                       // LB → 3 (same profile as RB)
        9: 10, 11: 10,              // DM variants → CDM 10
        16: 12,                     // LM → RM bucket 12
        14: 14, 15: 14,             // CM variants → 14
        17: 18, 19: 18,             // AM variants → CAM 18
        20: 21, 22: 21,             // CF variants → 21
        27: 23,                     // LW → RW bucket 23
        24: 25, 26: 25,             // ST variants → 25
    };
    // LB (3) has its own profile matching RB (2) — merge them
    const mapped = positionMapping[pos] ?? pos;
    return mapped === 3 ? 2 : mapped;
}

// ─────────────────────────────────────────────────────────────────────────────
// OVR CALCULATION — position-specific weighted formulas
// Weights are tuned so that a player's key attributes dominate the score.
// All weight sets sum to exactly 1.00.
// ─────────────────────────────────────────────────────────────────────────────
export function calculateovr(pos1, attr) {
    const pos = setmap(pos1);
    switch (pos) {
        case 0: // GK
            return Math.round(
                attr.gkdiving       * 0.22 +
                attr.gkreflexes     * 0.22 +
                attr.gkhandling     * 0.20 +
                attr.gkpositioning  * 0.20 +
                attr.reactions      * 0.12 +
                attr.gkkicking      * 0.04
            );
        case 2: // RB / LB
            return Math.round(
                attr.defensiveawareness * 0.15 +
                attr.standingtackle     * 0.12 +
                attr.slidingtackle      * 0.10 +
                attr.interceptions      * 0.12 +
                attr.crossing           * 0.11 +
                attr.reactions          * 0.09 +
                attr.sprintspeed        * 0.08 +
                attr.acceleration       * 0.06 +
                attr.shortpassing       * 0.08 +
                attr.stamina            * 0.05 +
                attr.ballcontrol        * 0.04
            );
        case 5: // CB
            return Math.round(
                attr.defensiveawareness * 0.18 +
                attr.standingtackle     * 0.16 +
                attr.interceptions      * 0.14 +
                attr.slidingtackle      * 0.10 +
                attr.headingaccuracy    * 0.10 +
                attr.strength           * 0.09 +
                attr.jumping            * 0.06 +
                attr.aggression         * 0.07 +
                attr.reactions          * 0.06 +
                attr.shortpassing       * 0.04
            );
        case 10: // CDM
            return Math.round(
                attr.defensiveawareness * 0.14 +
                attr.standingtackle     * 0.12 +
                attr.interceptions      * 0.13 +
                attr.shortpassing       * 0.14 +
                attr.longpassing        * 0.10 +
                attr.ballcontrol        * 0.10 +
                attr.reactions          * 0.08 +
                attr.vision             * 0.06 +
                attr.stamina            * 0.06 +
                attr.strength           * 0.04 +
                attr.aggression         * 0.03
            );
        case 12: // RM / LM
            return Math.round(
                attr.dribbling    * 0.14 +
                attr.crossing     * 0.12 +
                attr.ballcontrol  * 0.12 +
                attr.shortpassing * 0.10 +
                attr.sprintspeed  * 0.09 +
                attr.acceleration * 0.08 +
                attr.stamina      * 0.08 +
                attr.reactions    * 0.08 +
                attr.finishing    * 0.07 +
                attr.positioning  * 0.06 +
                attr.vision       * 0.06
            );
        case 14: // CM
            return Math.round(
                attr.shortpassing   * 0.17 +
                attr.ballcontrol    * 0.14 +
                attr.longpassing    * 0.13 +
                attr.vision         * 0.13 +
                attr.reactions      * 0.09 +
                attr.stamina        * 0.08 +
                attr.dribbling      * 0.07 +
                attr.interceptions  * 0.07 +
                attr.finishing      * 0.05 +
                attr.longshots      * 0.04 +
                attr.strength       * 0.03
            );
        case 18: // CAM
            return Math.round(
                attr.vision         * 0.15 +
                attr.shortpassing   * 0.15 +
                attr.ballcontrol    * 0.14 +
                attr.dribbling      * 0.13 +
                attr.finishing      * 0.10 +
                attr.reactions      * 0.09 +
                attr.positioning    * 0.09 +
                attr.longshots      * 0.05 +
                attr.agility        * 0.05 +
                attr.acceleration   * 0.05
            );
        case 21: // CF
            return Math.round(
                attr.finishing      * 0.14 +
                attr.dribbling      * 0.13 +
                attr.ballcontrol    * 0.13 +
                attr.positioning    * 0.13 +
                attr.reactions      * 0.10 +
                attr.shortpassing   * 0.09 +
                attr.vision         * 0.08 +
                attr.shotpower      * 0.06 +
                attr.longshots      * 0.05 +
                attr.acceleration   * 0.05 +
                attr.sprintspeed    * 0.04
            );
        case 23: // RW / LW
            return Math.round(
                attr.dribbling      * 0.16 +
                attr.ballcontrol    * 0.13 +
                attr.finishing      * 0.11 +
                attr.acceleration   * 0.10 +
                attr.sprintspeed    * 0.09 +
                attr.positioning    * 0.09 +
                attr.agility        * 0.07 +
                attr.crossing       * 0.07 +
                attr.reactions      * 0.07 +
                attr.shortpassing   * 0.07 +
                attr.vision         * 0.04
            );
        case 25: // ST
            return Math.round(
                attr.finishing          * 0.19 +
                attr.positioning        * 0.14 +
                attr.reactions          * 0.10 +
                attr.shotpower          * 0.10 +
                attr.ballcontrol        * 0.09 +
                attr.headingaccuracy    * 0.08 +
                attr.sprintspeed        * 0.07 +
                attr.acceleration       * 0.06 +
                attr.dribbling          * 0.06 +
                attr.strength           * 0.05 +
                attr.volleys            * 0.03 +
                attr.shortpassing       * 0.03
            );
        default: // Fallback to CM
            return Math.round(
                attr.shortpassing   * 0.17 +
                attr.ballcontrol    * 0.14 +
                attr.longpassing    * 0.13 +
                attr.vision         * 0.13 +
                attr.reactions      * 0.09 +
                attr.stamina        * 0.08 +
                attr.dribbling      * 0.07 +
                attr.interceptions  * 0.07 +
                attr.finishing      * 0.05 +
                attr.longshots      * 0.04 +
                attr.strength       * 0.03
            );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ATTRIBUTES BY POSITION — which attrs to nudge during rectification
// ─────────────────────────────────────────────────────────────────────────────
export function attributesbyposition(pos1) {
    const pos = setmap(pos1);
    const profile = POSITION_PROFILES[pos] ?? POSITION_PROFILES[14];
    // Return key attrs first (they have the most OVR leverage), then minor
    return [...(profile.key ?? []), ...(profile.minor ?? [])];
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE ATTR ADJUST — used by rectifyovr
// Picks from key attrs preferentially so the OVR converges faster
// ─────────────────────────────────────────────────────────────────────────────
export function adjustsingleattrval(attr, pos1, mod) {
    const attrs = attributesbyposition(pos1);
    const rndIndex = Math.floor(Math.random() * attrs.length);
    const attrToAdjust = attrs[rndIndex];
    if (attr[attrToAdjust] === undefined) return attr;
    attr[attrToAdjust] = Math.max(1, Math.min(99, attr[attrToAdjust] + mod));
    return attr;
}

// ─────────────────────────────────────────────────────────────────────────────
// RECTIFY OVR — iteratively nudges key attrs until calculated OVR == target
// Uses a smarter two-pass approach:
//   Pass 1: nudge by ±3 to converge quickly
//   Pass 2: nudge by ±1 to land exactly on target
// ─────────────────────────────────────────────────────────────────────────────
export function rectifyovr(pos1, attr, targetovr) {
    // Fast convergence pass
    for (let i = 0; i < 200; i++) {
        const calc = calculateovr(pos1, attr);
        if (calc === targetovr) return attr;
        const delta = calc > targetovr ? -3 : 3;
        attr = adjustsingleattrval(attr, pos1, delta);
    }
    // Fine-tune pass
    for (let i = 0; i < 500; i++) {
        const calc = calculateovr(pos1, attr);
        if (calc === targetovr) return attr;
        const delta = calc > targetovr ? -1 : 1;
        attr = adjustsingleattrval(attr, pos1, delta);
    }
    return attr;
}

// ─────────────────────────────────────────────────────────────────────────────
// STAMINA — position-aware
// ─────────────────────────────────────────────────────────────────────────────
export function calculatestamina(ovr, pos1) {
    const pos = setmap(pos1);
    let base = Math.max(50, Math.round(ovr * 0.85));

    if ([10, 14, 12].includes(pos))  base += 10; // Midfielders
    else if (pos === 2)              base += 8;  // Fullbacks
    else if ([18, 21, 23, 25].includes(pos)) base += 5; // Attackers
    else if ([3, 5].includes(pos))   base += 2;  // CBs
    else if (pos === 0)              base = Math.max(30, Math.round(ovr * 0.5)); // GK

    const lo = Math.max(pos === 0 ? 30 : 50, base - 5);
    const hi = Math.min(99, base + 5);
    return returninrange(pos === 0 ? 30 : 50, 99, randbetween(lo, hi));
}

// ─────────────────────────────────────────────────────────────────────────────
// POTENTIAL
// ─────────────────────────────────────────────────────────────────────────────
export function getpotential(age, ovr, pos1, pos2, pos3, pos4, nationname) {
    const CAP_AGE = 30;
    const isGK = (pos1 === 0 || pos2 === 0 || pos3 === 0 || pos4 === 0);
    let functionalAge = isGK ? age - 1 : age;
    if (functionalAge < 15) functionalAge = 15;

    let rawBoost = 0;
    if      (functionalAge <= 15) rawBoost = randbetween(18, 20);
    else if (functionalAge === 16) rawBoost = randbetween(16, 18);
    else if (functionalAge === 17) rawBoost = randbetween(13, 16);
    else if (functionalAge === 18) rawBoost = randbetween(10, 13);
    else if (functionalAge >= CAP_AGE) rawBoost = 0;
    else rawBoost = CAP_AGE - functionalAge;

    let eliteBonus = 0;
    if (functionalAge >= 24 && functionalAge < CAP_AGE && ovr >= 78) {
        const eliteFactor = Math.min(1, (ovr - 78) / 13);
        eliteBonus = returninrange(3, 5, Math.round(eliteFactor * 5));
    }

    const EUROPEAN_NATION_IDS = new Set([
        1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
        21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,
        40,41,42,43,44,45,46,47,48,49,50,51,208,219,205
    ]);
    const SOUTH_AMERICA_IDS = new Set([52,53,54,55,56,57,58,59,60,61]);
    const NORTH_AMERICA_IDS = new Set([70,72,73,76,78,79,80,81,82,83,86,87,88,95,207]);
    const AFRICA_IDS = new Set([
        97,98,99,100,101,102,103,104,105,106,107,108,109,110,
        111,112,113,114,115,116,117,118,119,120,121,122,123,124,
        125,126,127,128,129,130,131,132,133,134,135,136,137,138,
        139,140,141,142,143,144,145,146,147,148,214,218
    ]);

    let nationid = 0;
    if (nationname) {
        const nationRecord = nations().find(n => n.nation.toLowerCase() === nationname.toLowerCase());
        if (nationRecord) nationid = nationRecord.nationid;
    }

    let regionMultiplier, fullBoostChance, dampedRetention;
    if (EUROPEAN_NATION_IDS.has(nationid)) {
        regionMultiplier = 1.0; fullBoostChance = 35; dampedRetention = 0.60;
    } else if (SOUTH_AMERICA_IDS.has(nationid)) {
        regionMultiplier = 0.85; fullBoostChance = 25; dampedRetention = 0.55;
    } else if (NORTH_AMERICA_IDS.has(nationid)) {
        regionMultiplier = 0.80; fullBoostChance = 20; dampedRetention = 0.50;
    } else if (AFRICA_IDS.has(nationid)) {
        regionMultiplier = 0.75; fullBoostChance = 15; dampedRetention = 0.45;
    } else {
        regionMultiplier = 0.70; fullBoostChance = 10; dampedRetention = 0.40;
    }

    const rarityRoll = randbetween(1, 100);
    const boostMultiplier = (rarityRoll <= fullBoostChance) ? 1.0 : dampedRetention;
    const finalBoost = Math.round(rawBoost * regionMultiplier * boostMultiplier) + eliteBonus;

    return returninrange(ovr, 99, ovr + finalBoost);
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export function getovrfromtemplate(ovr, transfervalue) {
    if (ovr) return ovr;
    const record = transfervaluestoovr().find(x => x.transfervalue === transfervalue);
    if (!record) return randbetween(60, 70); // safe fallback if transfervalue unmatched
    return randbetween(record.lo, record.hi);
}

export function getpositionid(pos, primary) {
    const position = positions().find(x => x.position === pos);
    if (position) return position.id;
    return primary ? 14 : -1;
}

export function getbodytype(height) {
    if (height <= 170) return 8;
    if (height >= 185) return 5;
    return 2;
}