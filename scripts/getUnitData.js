// Big function to fetch unit data
import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";

async function getUnitData(unitName) {
  const response = await fetch("https://raw.githubusercontent.com/ernie-walter/aomretold-techtree/main/gamefiles/proto.xml");
  const xmlString = await response.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "#text"
  });
  const jsonObj = parser.parse(xmlString);

  const units = jsonObj.proto.unit;
  if (!units) return null;

  const unitArray = Array.isArray(units) ? units : [units];
  const unit = unitArray.find(u => u.name === unitName);
  if (!unit) return null;

  // --- Category ---
  let rawTypes = [];
  if (unit.unittype) {
    rawTypes = Array.isArray(unit.unittype) ? unit.unittype.map(t => t["#text"] || t) : [unit.unittype["#text"] || unit.unittype];
  }
  let category = "Unknown";
  if (rawTypes.includes("Hero")) category = "Hero";
  else if (rawTypes.includes("MythUnit")) category = "Myth Unit";
  else if (rawTypes.includes("Building")) category = "Building";
  else if (rawTypes.some(t => ["Unit", "MilitaryUnit", "Civilian"].includes(t))) category = "Unit";

  // --- Cost ---
  const cost = {};
  if (unit.cost) {
    const costArray = Array.isArray(unit.cost) ? unit.cost : [unit.cost];
    costArray.forEach(c => {
      const type = c.resourcetype || c["@_resourcetype"];
      cost[type] = c["#text"];
    });
  }

  // --- Armor ---
  const armor = {};
  if (unit.armor) {
    const armorArray = Array.isArray(unit.armor) ? unit.armor : [unit.armor];
    armorArray.forEach(a => armor[a.type] = a.value);
  }

  // --- Attacks ---
  const extractAttack = (actionName) => {
    if (!unit.protoaction) return null;
    const actions = Array.isArray(unit.protoaction) ? unit.protoaction : [unit.protoaction];
    const action = actions.find(a => a.name === actionName);
    if (!action) return null;

    const attack = { rof: action.rof, damage: {}, bonus: {} };

    if (action.damage) {
      const dmgArray = Array.isArray(action.damage) ? action.damage : [action.damage];
      dmgArray.forEach(d => attack.damage[d.type] = d["#text"]);
    }

    if (action.damagebonus) {
      const bonusArray = Array.isArray(action.damagebonus) ? action.damagebonus : [action.damagebonus];
      bonusArray.forEach(b => attack.bonus[b.type] = b["#text"]);
    }

    return attack;
  };

  return {
    name: unitName,
    icon: unit.icon,
    category,
    cost,
    armor,
    population: unit.populationcount,
    maxVelocity: unit.maxvelocity,
    handAttack: extractAttack("HandAttack"),
    rangedAttack: extractAttack("RangedAttack")
  };
}

// Example usage in Node.js
(async () => {
  const data = await getUnitData("House");
  console.log(data);
})();
