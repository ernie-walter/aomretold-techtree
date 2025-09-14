// List of panel icon names (same as filenames without extension)
const iconNames = [
  "food", "wood", "gold", "favor", "time",
  "pop", "speed", "hp",
  "atk_hack", "atk_pierce", "atk_crush", "atk_divine","atk_rof", "atk_projectiles", "atk_area", "atk_range",
  "armor_hack", "armor_pierce", "armor_crush",
  "type_soldier", "type_infantry", "type_cavalry", "type_ranged",
  "type_villager", "type_hero", "type_mythunit", "type_titan",
  "type_building", "type_wall", "type_abstracttower", "type_siege",
  "type_ship", "type_ship_archer", "type_ship_siege", "type_ship_melee"
];

// Create a mapping of icon names to their file paths
const ICONS = Object.fromEntries(
  iconNames.map(name => [PascalCaseName(name), { src: `images/Icons/${name}.png` }])  
);

function PascalCaseName(name) {
  return name.replace(/(^|_)([a-z])/g, (_, __, c) => c.toUpperCase());
}

// Helper function to print icons
function appendIconValue(parent, key, value, iconPrefix, iconSuffix = "") {
  const fullKey = PascalCaseName(iconPrefix ? `${iconPrefix}${key}` : key);
  const iconData = ICONS[fullKey];
  if (iconData) {
    const img = document.createElement("img");
    img.src = iconData.src;
    img.classList.add("panel-icon");
    parent.appendChild(img);
  }
  parent.appendChild(document.createTextNode(value + iconSuffix + " " ));
}

// For single-value or simple array properties
function addPanelInfo(panel, data, tag, options = {}){
  let prefix, newline, suffix;
  let entries;
  if (typeof tag === "string") { 
    entries = [[tag, data]];                // tag is a single value (for pop, hp, speed etc)
    ({ prefix = undefined, newline = false, suffix = "" } = options);
  } else {
    entries = Object.entries(data);         // tag is object/array (for cost, armor etc)
    ({ prefix = undefined, newline = false, suffix = "" } = tag || {});
  }
  for (const [key, val] of entries) {
    const span = document.createElement("span");
    span.classList.add("panel-line");
    appendIconValue(span, key, val, prefix, suffix);
    panel.appendChild(span);
  }
  if (newline) panel.appendChild(document.createElement("br"));
}

// For the more complex attack array
function addPanelAttacks(panel, attacks) {
  attacks.forEach(attack => {
  const span = document.createElement("span");
  span.classList.add("panel-line");

  const formattedName = attack.name.replace(/([a-z])([A-Z])/g, "$1 $2");
  const h3 = document.createElement("h3");
  h3.textContent = formattedName;
  h3.classList.add("attack-name");
  panel.appendChild(h3);

  // Damages
  if (attack.damages) {
    for (const [type, val] of Object.entries(attack.damages)) {
      appendIconValue(span, type, val, "atk");
    }
  }
  // Bonus damages
  if (attack.bonus) {
    for (const [type, val] of Object.entries(attack.bonus)) {
      const iconKey = `type_${type.toLowerCase()}`; 
      appendIconValue(span, iconKey, val, "", "x");
    }
    span.appendChild(document.createElement("br"));
  }
  // Attack details
  appendIconValue(span, "Rof", attack.rof, "atk");
  if (attack.maxrange != null) appendIconValue(span, "Range", attack.maxrange, "atk");
  if (attack.numberProjectiles != null) appendIconValue(span, "Projectiles", attack.numberProjectiles, "atk");
  if (attack.area != null) appendIconValue(span, "Area", attack.area, "atk");
  
  panel.appendChild(span);
  panel.appendChild(document.createElement("br")); // new line per attack
  });
}
