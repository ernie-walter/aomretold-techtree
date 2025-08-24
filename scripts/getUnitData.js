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
    displayName,
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