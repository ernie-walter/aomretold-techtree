const stringTableUrl = '../gamefiles/string_table.txt';

/*
 * Prepares a hero LR map from the TXT file
 */
async function prepareLRMap() {
    const response = await fetch(stringTableUrl);
    if (!response.ok) throw new Error("Failed to fetch string table");

    const text = await response.text();
    const lines = text.split('\n');

    const LRMap = {};
    for (const line of lines) {
        const match = line.match(/ID\s*=\s*"STR_UNIT_(.+?)_LR"\s*;\s*Str\s*=\s*"([^"]+)"/);
        if (match) {
            const name = match[1]; // uppercase
            const lrString = match[2];
            LRMap[name] = lrString;
        }
    }
    return LRMap;
}

/**
 * Merge _LR strings into unitDataMap
 */
async function mergeLRIntoUnitData(unitDataMap) {
    const LRMap = await prepareLRMap();

    for (const [unitName, data] of Object.entries(unitDataMap)) {
        const lookupName = (data.displayName || unitName).toUpperCase();
        if (heroLRMap[lookupName]) {
            data._LR = heroLRMap[lookupName]; // add _LR field to unit object
        }
    }
}
