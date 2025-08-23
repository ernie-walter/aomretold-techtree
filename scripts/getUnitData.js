// getUnitData function to fetch unit data from XML file

// uncomment this to use the getUnitData function in a Node.js environment
// import fetch from "node-fetch"; 
// import { XMLParser } from "fast-xml-parser";

async function getUnitData(unitName) {
  const response = await fetch("https://raw.githubusercontent.com/ernie-walter/aomretold-techtree/main/gamefiles/proto.xml");
  const xmlString = await response.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  const unit = xmlDoc.querySelector(`unit[name="${unitName}"]`);
  if (!unit) {
    // console.error(`Unit "${unitName}" not found`);
    return null;
  }

  // Determine category
  const rawTypes = Array.from(unit.querySelectorAll("unittype")).map(u => u.textContent.trim());
  let category = "Unknown";
  if (rawTypes.includes("Hero")) category = "Hero";
  else if (rawTypes.includes("MythUnit")) category = "Myth Unit";
  else if (rawTypes.includes("Building")) category = "Building";
  else if (rawTypes.includes("Unit") || rawTypes.includes("MilitaryUnit") || rawTypes.includes("Civilian")) {
    category = "Unit";
  }

  // Costs
  const cost = {};
  unit.querySelectorAll("cost").forEach(c => {
    cost[c.getAttribute("resourcetype")] = c.textContent.trim();
  });

  // Armor
  const armor = {};
  unit.querySelectorAll("armor").forEach(a => {
    armor[a.getAttribute("type")] = a.getAttribute("value");
  });

  // Attacks
  const extractAttack = (actionName) => {
    const action = Array.from(unit.querySelectorAll("protoaction"))
      .find(a => a.querySelector("name")?.textContent.trim() === actionName);
    if (!action) return null;

    const attack = { rof: action.querySelector("rof")?.textContent, damage: {}, bonus: {} };
    action.querySelectorAll("damage").forEach(d => attack.damage[d.getAttribute("type")] = d.textContent);
    action.querySelectorAll("damagebonus").forEach(d => attack.bonus[d.getAttribute("type")] = d.textContent);
    return attack;
  };

  return {
    name: unitName,
    icon: unit.querySelector("icon")?.textContent.trim(),
    category,
    cost,
    armor,
    population: unit.querySelector("populationcount")?.textContent,
    maxVelocity: unit.querySelector("maxvelocity")?.textContent,
    handAttack: extractAttack("HandAttack"),
    rangedAttack: extractAttack("RangedAttack")
  };
}