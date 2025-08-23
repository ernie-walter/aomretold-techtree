// getUnitData function to fetch unit data from XML file
// uncomment this to use the getUnitData function in a Node.js environment
// import fetch from "node-fetch"; 
// import { XMLParser } from "fast-xml-parser";

// Load XML and parse into a Document
async function loadXML(url) {
  const response = await fetch(url);
  const text = await response.text();
  return new DOMParser().parseFromString(text, "application/xml");
}

// Build a merged unit/tech index
async function buildUnitIndex() {
  const protoDoc = await loadXML('https://raw.githubusercontent.com/ernie-walter/aomretold-techtree/main/gamefiles/proto.xml');
  const techtreeDoc = await loadXML('https://raw.githubusercontent.com/ernie-walter/aomretold-techtree/main/gamefiles/techtree.xml');

  const unitIndex = {};

  // Parse nodes: units from proto, units & techs from techtree
  function parseNodes(doc, tags) {
    return tags.flatMap(tag => Array.from(doc.querySelectorAll(tag)));
  }

  const protoNodes = parseNodes(protoDoc, ['unit']);
  const techtreeNodes = parseNodes(techtreeDoc, ['tech']); // include techs here

  [...protoNodes, ...techtreeNodes].forEach(node => {
    const name = node.getAttribute('name');
    if (!name) return;

    unitIndex[name] = { node };
  });

  return unitIndex;
  
}

function getUnitDataFromNode(node) {
  if (!node) return null;

  // Category is already computed in index if desired
  const rawTypes = Array.from(node.querySelectorAll('unittype')).map(u => u.textContent.trim());
  let category = 'Unknown';
  if (rawTypes.includes('Hero')) category = 'Hero';
  else if (rawTypes.includes('MythUnit')) category = 'Myth Unit';
  else if (rawTypes.includes('Building')) category = 'Building';
  else if (rawTypes.includes('Unit') || rawTypes.includes('MilitaryUnit') || rawTypes.includes('Civilian')) category = 'Unit';
  else if (rawTypes.includes('Tech') || node.tagName.toLowerCase() === 'tech') category = 'Techs';

  // Costs
  const cost = {};
  node.querySelectorAll('cost').forEach(c => {
    const res = c.getAttribute('resourcetype');
    cost[res] = c.textContent.trim();
  });

  // Armor
  const armor = {};
  node.querySelectorAll('armor').forEach(a => {
    armor[a.getAttribute('type')] = a.getAttribute('value');
  });

  // Population & Max Velocity
  const population = node.querySelector('populationcount')?.textContent || null;
  const maxVelocity = node.querySelector('maxvelocity')?.textContent || null;

  // Extract attacks
  const extractAttack = (actionName) => {
    const action = Array.from(node.querySelectorAll('protoaction'))
      .find(a => a.querySelector('name')?.textContent.trim() === actionName);
    if (!action) return null;

    const attack = { rof: action.querySelector('rof')?.textContent, damage: {}, bonus: {} };
    action.querySelectorAll('damage').forEach(d => attack.damage[d.getAttribute('type')] = d.textContent);
    action.querySelectorAll('damagebonus').forEach(d => attack.bonus[d.getAttribute('type')] = d.textContent);
    return attack;
  };

  return {
    name: node.getAttribute('name'),
    icon: node.querySelector('icon')?.textContent.trim() || null,
    category,
    cost,
    armor,
    population,
    maxVelocity,
    handAttack: extractAttack('HandAttack'),
    rangedAttack: extractAttack('RangedAttack')
  };
}




// async function getUnitData(unitName) {
//   // const response = await fetch("https://raw.githubusercontent.com/ernie-walter/aomretold-techtree/main/gamefiles/proto.xml");
//   // const xmlString = await response.text();
//   // const parser = new DOMParser();
//   // const xmlDoc = parser.parseFromString(xmlString, "application/xml");

//   const unit = unitIndex.querySelector(`unit[name="${unitName}"]`);
//   if (!unit) {
//     // console.error(`Unit "${unitName}" not found`);
//     return null;
//   }

//   // Determine category
//   const rawTypes = Array.from(unit.querySelectorAll("unittype")).map(u => u.textContent.trim());
//   let category = "Unknown";
//   if (rawTypes.includes("Hero")) category = "Hero";
//   else if (rawTypes.includes("MythUnit")) category = "Myth Unit";
//   else if (rawTypes.includes("Building")) category = "Building";
//   else if (rawTypes.includes("Unit") || rawTypes.includes("MilitaryUnit") || rawTypes.includes("Civilian")) category = "Unit";
//   else if (rawTypes.includes("Tech")) category = "Techs";

//   // Costs
//   const cost = {};
//   unit.querySelectorAll("cost").forEach(c => {
//     cost[c.getAttribute("resourcetype")] = c.textContent.trim();
//   });

//   // Armor
//   const armor = {};
//   unit.querySelectorAll("armor").forEach(a => {
//     armor[a.getAttribute("type")] = a.getAttribute("value");
//   });

//   // Attacks
//   const extractAttack = (actionName) => {
//     const action = Array.from(unit.querySelectorAll("protoaction"))
//       .find(a => a.querySelector("name")?.textContent.trim() === actionName);
//     if (!action) return null;

//     const attack = { rof: action.querySelector("rof")?.textContent, damage: {}, bonus: {} };
//     action.querySelectorAll("damage").forEach(d => attack.damage[d.getAttribute("type")] = d.textContent);
//     action.querySelectorAll("damagebonus").forEach(d => attack.bonus[d.getAttribute("type")] = d.textContent);
//     return attack;
//   };

//   return {
//     name: unitName,
//     icon: unit.querySelector("icon")?.textContent.trim(),
//     category,
//     cost,
//     armor,
//     population: unit.querySelector("populationcount")?.textContent,
//     maxVelocity: unit.querySelector("maxvelocity")?.textContent,
//     handAttack: extractAttack("HandAttack"),
//     rangedAttack: extractAttack("RangedAttack")
//   };
// }