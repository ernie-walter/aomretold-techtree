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

function getUnitDataFromNode(node, wrapper) {
  if (!node) return null;

  const name = node.getAttribute("name");

  // --- displayName ---
  let displayName;
  if (wrapper && wrapper.hasAttribute("displayName")) {
    displayName = wrapper.getAttribute("displayName");
  } else {
    displayName = name;
    const suffixes = ["Greek", "Egyptian", "Norse", "Atlantean", "Chinese"];
    for (const suffix of suffixes) {
      if (displayName.endsWith(suffix)) {
        displayName = displayName.slice(0, -suffix.length);
        break;
      }
    }
  }

  // Insert spaces before capital letters (except first letter)
  displayName = displayName.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Category is already computed in index if desired
  const rawTypes = Array.from(node.querySelectorAll('unittype')).map(u => u.textContent.trim());
  let category = 'Unknown';
  if (rawTypes.includes('Hero')) category = 'Hero';
  else if (rawTypes.includes('MythUnit')) category = 'Myth Unit';
  else if (rawTypes.includes('Building')) category = 'Building';
  else if (rawTypes.includes('Unit') || rawTypes.includes('MilitaryUnit') || rawTypes.includes('Civilian')) category = 'Unit';
  else if (rawTypes.includes('Tech') || node.tagName.toLowerCase() === 'tech') category = 'Techs';
  else if (rawTypes.includes('GodPower') || node.tagName.toLowerCase() === 'effects') category = 'God Power';

  // Costs
  const cost = {};
  node.querySelectorAll('cost').forEach(c => {
  const res = c.getAttribute('resourcetype');
  const rawCost = c.textContent.trim();
  const numCost = Number(rawCost);  // Parse as number if possible
  cost[res] = isNaN(numCost) ? rawCost : numCost.toString();   // If numeric, format to remove trailing zeros, else keep as string
  });
  const costString = Object.entries(cost)     // Convert cost object to readable string
  .map(([res, val]) => `${res}: ${val}`)
  .join(", ");
  
  // Armor
  const armor = {};
  node.querySelectorAll('armor').forEach(a => {
  armor[a.getAttribute('type')] = a.getAttribute('value');
  const arm = a.getAttribute('type');
  const rawArm = a.getAttribute('value');
  const numArm = Number(rawArm);  // Parse as number if possible
  armor[arm] = (numArm * 100).toString().replace(/\.0+$/, "") + "%";
  });
  // const armorString = Object.entries(armor)     // Convert cost object to readable string
  // .map(([arm, val]) => `${arm}: ${val}`)
  // .join(", ");

  // Population, Speed, Train Time, HP
  const population = node.querySelector('populationcount')?.textContent || null;
  const speed = Number(node.querySelector('maxvelocity')?.textContent) || null;
  const trainTime = Number(node.querySelector('trainpoints')?.textContent) || null;
  const hitPoints = Number(node.querySelector('maxhitpoints')?.textContent) || null;

  // Attacks
  const attacks = [];

  node.querySelectorAll('protoaction').forEach(pa => {
    if (!pa) return;
    const attack = {
      name: pa.querySelector('name')?.textContent || "",
      rof: Number(pa.querySelector('rof')?.textContent) || null,
      maxrange: Number(pa.querySelector('maxrange')?.textContent) || null,
      projectile: pa.querySelector('projectile')?.textContent || null,
      damages: {},
      bonus: {},
    };

    // damage types
    pa.querySelectorAll('damage').forEach(d => {
      const type = d.getAttribute('type');
      const val = Number(d.textContent);
      if (type && !isNaN(val)) attack.damages[type] = val;
    });

    // bonus damages
    pa.querySelectorAll('damagebonus').forEach(db => {
      const type = db.getAttribute('type');
      const val = Number(db.textContent);
      if (type && !isNaN(val)) attack.bonus[type] = val;
    });

    // area damage
    const area = pa.querySelector('damagearea');
    if (area) attack.area = Number(area.textContent);

    // number of projectiles
    const numProj = pa.querySelector('numberprojectiles');
    if (numProj) attack.numberProjectiles = Number(numProj.textContent);

    // only include if it's a real attack
    const hasRealData =
      Object.keys(attack.damages).length > 0 ||
      Object.keys(attack.bonus).length > 0 ||
      attack.rof !== null;

    if (hasRealData)
    attacks.push(attack);
  });
  
  return {
    name: node.getAttribute('name'),
    displayName,
    icon: node.querySelector('icon')?.textContent.trim() || null,
    category,
    cost,
    //costString,
    armor,
    //armorString,
    population,
    trainTime,
    hitPoints,
    speed,
    attacks,
  };
}