// ======= LR Loader =======
const stringTableUrl = '../gamefiles/string_table.txt';
let LRMapCache = null;

/**
 * Prepare a map of all _LR strings (units and techs)
 * Keys are like "UNIT_JASON" or "TECH_HUSBANDRY"
 */
async function prepareLRMap() {
    if (LRMapCache) return LRMapCache;

    const response = await fetch(stringTableUrl);
    if (!response.ok) throw new Error("Failed to fetch string table");

    const text = await response.text();
    const lines = text.split('\n');

    const LRMap = {};
    const regex = /ID\s*=\s*"STR_(UNIT|TECH)_(.+?)_LR"\s*;\s*Str\s*=\s*"([^"]+)"/;

    for (const line of lines) {
        const match = line.match(regex);
        if (match) {
            const type = match[1];    // UNIT or TECH
            const name = match[2];    // e.g. JASON or HUSBANDRY
            const lrString = match[3];
            LRMap[`${type}_${name}`] = lrString;
        }
    }

    LRMapCache = LRMap;
    return LRMap;
}

/**
 * Merge _LR strings into your existing unitDataMap
 * Handles both units and techs
 */
async function mergeLRIntoUnitData(unitDataMap) {
    const LRMap = await prepareLRMap();

    for (const [name, data] of Object.entries(unitDataMap)) {
        
        let lookupName = (name)
            .toUpperCase()
            .replace(/\s+/g, '_'); // handle spaces
        // Try UNIT first
        let key = `UNIT_${lookupName}`;
        if (LRMap[key]) {
            data._LR = LRMap[key];
            continue;
        }

        // Then TECH
        key = `TECH_${lookupName}`;
        if (LRMap[key]) {
            data._LR = LRMap[key];
        }
    }
}