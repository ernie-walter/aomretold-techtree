// XML loading helper functions
async function loadXML(url) {
  const response = await fetch(url);
  const text = await response.text();
  return new DOMParser().parseFromString(text, "application/xml");
}

// unitIndex is a long list of ALL nodes in proto.xml and techtree.xml, with all their stats nested inside them in childNodes
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

  const name = node.getAttribute("name");     // the name of the node, which is fed from what we typed in html

  // --- displayName ---
  // A simple helper to tidy up display names, to remove civ-specific suffixes
  let displayName = wrapper?.getAttribute("displayName") || name;
  const suffixes = ["Greek", "Egyptian", "Norse", "Atlantean", "Chinese"];
  for (const suffix of suffixes) {
    if (displayName.endsWith(suffix)) {
      displayName = displayName.slice(0, -suffix.length);
      break;
    }
  }
  // Insert spaces before capital letters (except first letter)
  displayName = displayName.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Category
  const rawTypes = Array.from(node.querySelectorAll('unittype')).map(u => u.textContent.trim());
  let category = 'Unknown';
  if (rawTypes.includes('Hero')) category = 'Hero';
  else if (rawTypes.includes('MythUnit')) category = 'Myth Unit';
  else if (rawTypes.includes('Building')) category = 'Building';
  else if (rawTypes.includes('Unit') || rawTypes.includes('MilitaryUnit') || rawTypes.includes('Civilian')) category = 'Unit';
  else if (rawTypes.includes('Tech') || node.tagName.toLowerCase() === 'tech') category = 'Techs';
  else if (rawTypes.includes('GodPower') || node.tagName.toLowerCase() === 'effects') category = 'God Power';

  // --- Unit Types ---
  let unitTypes = [];
  if (category === 'Unit') {
    if (rawTypes.includes("HumanSoldier")) unitTypes.push("type_humansoldier");
    if (rawTypes.includes("AbstractInfantry")) unitTypes.push("type_abstractinfantry");
    if (rawTypes.includes("AbstractCavalry")) unitTypes.push("type_abstractcavalry");
    if (rawTypes.includes("AbstractArcher")) unitTypes.push("type_abstractarcher");
    if (rawTypes.includes("Villager")) unitTypes.push("type_villager");
    if (rawTypes.includes("Hero")) unitTypes.push("type_hero");
    if (rawTypes.includes("MythUnit")) unitTypes.push("type_mythunit");
    if (rawTypes.includes("AbstractTitan")) unitTypes.push("type_abstracttitan");
    if (rawTypes.includes("Building")) unitTypes.push("type_building");
    if (rawTypes.includes("Wall")) unitTypes.push("type_wall");
    if (rawTypes.includes("AbstractTower")) unitTypes.push("type_abstracttower");
    if (rawTypes.includes("Siege")) unitTypes.push("type_siege");
    if (rawTypes.includes("Ship")) unitTypes.push("type_ship");
    if (rawTypes.includes("ShipArcher")) unitTypes.push("type_ship_archer");
    if (rawTypes.includes("ShipSiege")) unitTypes.push("type_ship_siege");
    if (rawTypes.includes("ShipMelee")) unitTypes.push("type_ship_melee");
  }

  // Costs
  const cost = {};
  node.querySelectorAll('cost').forEach(c => {
    const res = c.getAttribute('resourcetype');
    const val = Number(c.textContent.trim());
    cost[res] = isNaN(val) ? c.textContent.trim() : val.toString();
  });
  
  // Armor
  const armor = {};
  node.querySelectorAll('armor').forEach(a => {
    const type = a.getAttribute('type');
    const val = Number(a.getAttribute('value'));
    armor[type] = `${(val * 100).toString().replace(/\.0+$/,"")}%`;
  });

  // Population, Speed, Train Time, HP
  const population = node.querySelector('populationcount')?.textContent || null;
  const speed = Number(node.querySelector('maxvelocity')?.textContent) || null;
  const trainTime = Number(node.querySelector('trainpoints')?.textContent) || null;
  const hitPoints = Number(node.querySelector('maxhitpoints')?.textContent) || null;

  // Attacks
  const attacks = [];

  node.querySelectorAll('protoaction').forEach(pa => {
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
    armor,
    population,
    trainTime,
    hitPoints,
    speed,
    attacks,
  };
}