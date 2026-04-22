export function getinternationalrep(ovr){
    let internationalrep = 1;
    if(ovr>70){internationalrep=2}
    if(ovr>75){internationalrep=3}
    if(ovr>81){internationalrep=4}
    if(ovr>86){internationalrep=5}

    return internationalrep;
}

export function getfoot(foottext){
    switch(foottext){
        case "Right" ||"right" || "r" || "R": 
            return 1;
        case "Left" || "left" || "l" ||"L": 
            return 2;
        default: 
            return 1;
    }
}

export function getweakfoot(weakfoot){
    switch(weakfoot){
        case "Terrible": return 1;
        case "Bad": return 2;
        case "Average": return 3;
        case "Good": return 4;
        case "Excellent": return 5;
        default: 
            return 2;
    }
}

export function getposition(positionstring){
    let pos = positions().find(x=>x.position==positionstring);
    if(pos){return pos.id;}else{return -1;}
}

/**
 * Extracts { day, month, year } from any date input.
 *
 * Supported types:
 *   - JS Date objects
 *   - Excel OLE serial numbers  (e.g. 37314 → Feb 27 2002)
 *   - Any string with separators /, -, or . in these formats:
 *       YYYY/MM/DD  YYYY-MM-DD  YYYY.MM.DD
 *       MM/DD/YYYY  MM-DD-YYYY  DD/MM/YYYY  DD-MM-YYYY
 *       M/D/YYYY    D/M/YYYY    (single-digit variants)
 *
 * Returns { day, month, year } or null on failure.
 */
export function parseBirthdate(rawdate) {
    if (rawdate == null || rawdate === '') return null;

    // --- Case 1: JS Date object ---
    if (rawdate instanceof Date) {
        if (isNaN(rawdate.getTime())) return null;
        return { day: rawdate.getDate(), month: rawdate.getMonth() + 1, year: rawdate.getFullYear() };
    }

    // --- Case 2: Excel OLE date serial number ---
    if (typeof rawdate === 'number') {
        let serial = rawdate;
        // Correct for Excel's phantom Feb 29 1900 leap-year bug
        if (serial > 60) serial -= 1;
        // OLE epoch is Dec 30 1899; JS epoch is Jan 1 1970 (offset 25569 days)
        const d = new Date((serial - 25569) * 86400000);
        if (isNaN(d.getTime())) return null;
        return { day: d.getUTCDate(), month: d.getUTCMonth() + 1, year: d.getUTCFullYear() };
    }

    // --- Case 3: String ---
    if (typeof rawdate === 'string') {
        const s = rawdate.trim();

        // Normalize all separators (/, -, .) to a single dash
        const normalized = s.replace(/[\/\.\-]/g, '-');

        // Split into parts
        const parts = normalized.split('-');
        if (parts.length !== 3) return null;

        const p = parts.map(x => parseInt(x, 10));
        if (p.some(isNaN)) return null;

        const lenP = parts.map(x => x.length);

        // Detect which part holds the 4-digit year
        const yearIdx = lenP.indexOf(4);

        if (yearIdx === 0) {
            // YYYY-MM-DD  or  YYYY-DD-MM
            // Month is always the middle segment for this format in FIFA/football data
            const [y, mo, d] = p;
            if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31)
                return { day: d, month: mo, year: y };
            // Swap DD/MM if first guess was invalid
            if (d >= 1 && d <= 12 && mo >= 1 && mo <= 31)
                return { day: mo, month: d, year: y };
        }

        if (yearIdx === 2) {
            // MM-DD-YYYY  or  DD-MM-YYYY
            const [p0, p1, y] = p;
            // If p0 > 12, it cannot be the month — must be DD-MM-YYYY
            if (p0 > 12 && p1 >= 1 && p1 <= 12)
                return { day: p0, month: p1, year: y };
            // Otherwise default to MM-DD-YYYY (US convention, most common in templates)
            if (p0 >= 1 && p0 <= 12 && p1 >= 1 && p1 <= 31)
                return { day: p1, month: p0, year: y };
            // Last resort: try DD-MM-YYYY
            if (p1 >= 1 && p1 <= 12 && p0 >= 1 && p0 <= 31)
                return { day: p0, month: p1, year: y };
        }
    }

    return null; // Could not parse
}


/**
 * Converts any date input to a FIFA DB birthdate integer.
 * Uses the exact Julian Day Number algorithm from the reference Python script.
 * Falls back to 141428 (Jan 1 1970 in FIFA format) on failure.
 */
export function getfifabirthdateval(rawdate) {
    const dt = parseBirthdate(rawdate);
    if (!dt) return 141428;

    const { day, month, year } = dt;
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    return day
        + Math.floor((153 * m + 2) / 5)
        + y * 365
        + Math.floor(y / 4)
        - Math.floor(y / 100)
        + Math.floor(y / 400)
        - 32045
        - 2299160;
}