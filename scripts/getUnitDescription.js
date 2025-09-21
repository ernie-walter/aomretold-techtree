// =======================
// Description Loader
// =======================

const stringTableUrl = 'gamefiles/string_table.txt';
let descriptionMapCache = null;

/**
 * Normalize any name for consistent lookup
 * Converts to uppercase, spaces/hyphens -> underscores, strips other chars
 */
function normalizeName(raw) {
  return raw
    .toLowerCase()              // hand_axe
    .replace(/_/g, ' ')         // hand axe
    .replace(/\b\w/g, c => c.toUpperCase()); // Hand Axe
}

function removePrefix(key) {
  return key.replace(/^(UNIT|TECH)_/, '');
}


/**
 * Load the string table and prepare a map of all unit/tech descriptions
 * Keys are like "UNIT_HAND_AXE" or "TECH_HUSBANDRY"
 */
async function prepareDescriptionMap() {
    if (descriptionMapCache) return descriptionMapCache;

    const response = await fetch(stringTableUrl);
    if (!response.ok) throw new Error("Failed to fetch string table");

    const text = await response.text();
    const lines = text.split(/\r?\n/); // handle \r\n or \n

    const descriptionMap = {};
    const regex = /ID\s*=\s*"STR_(UNIT|TECH)_([^"]+)_LR"\s*;\s*Str\s*=\s*"([^"]+)"/

    for (const line of lines) {
        const match = line.match(regex);
        if (match) {
            const type = match[1];            // UNIT or TECH
            const rawName = match[2];         // raw string table name
            const descriptionText = match[3]; // text

            const name = normalizeName(rawName);
            descriptionMap[`${type}_${name}`] = descriptionText;
        }
    }

    // Debug: log all loaded keys

    descriptionMapCache = descriptionMap;
    return descriptionMap;
}

/**
 * Merge descriptions into unitDataMap
 * Adds description property to each unit/tech if a match is found
 */
async function mergeDescriptionIntoUnitData(unitDataMap) {
    const descriptionMap = await prepareDescriptionMap();

    for (const [name, data] of Object.entries(unitDataMap)) {
        const lookupName = removePrefix(name);
        // Try UNIT first
        let key = `UNIT_${lookupName}`;
        if (descriptionMap[key]) {
            data.description = descriptionMap[key];
            continue;
        }

        // Then TECH
        key = `TECH_${lookupName}`;
        if (descriptionMap[key]) {
            data.description = descriptionMap[key];
        }
    }
}

