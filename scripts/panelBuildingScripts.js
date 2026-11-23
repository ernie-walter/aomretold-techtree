// List of panel icon names (same as filenames without extension)
const iconNames = [
  "food", "wood", "gold", "favor", "time",
  "pop", "speed", "hp",
  "atk_hack", "atk_pierce", "atk_crush", "atk_divine","atk_rof", "atk_projectiles", "atk_area", "atk_range",
  "armor_hack", "armor_pierce", "armor_crush",
  "type_humansoldier", "type_abstractinfantry", "type_abstractcavalry", "type_abstractarcher",
  "type_villager", "type_hero", "type_mythunit", "type_abstracttitan",
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

// To display technical effects in the panel
// Format effect amounts according to their relativity

function formatTechAmountWithRelativity(effect) {
  const amount = Number(effect.amount);
  const relativity = (effect.relativity || "Absolute").toLowerCase();

  if (isNaN(amount)) return "";
  if (relativity === "assign") {return `set to ${amount}`;}
  if (relativity === "override") {return `sets base value to ${amount}`;}

  if (relativity === "percent" && effect.subtype?.toLowerCase() === "armorvulnerability") {
    const value = amount * -100;
    const sign = value >= 0 ? "+" : "-";
    const formatted = Number(Math.abs(value).toPrecision(3));
    return `${sign}${formatted}% of current`;
  }

  if (relativity === "percent") {
    const value = (amount - 1) * 100;
    const sign = value >= 0 ? "+" : "-";
    const formatted = Number(Math.abs(value).toPrecision(3));
    return `${sign}${formatted}% of current`;
  }

  if (relativity === "basepercent") {
    const value = (amount - 1) * 100;
    const sign = value >= 0 ? "+" : "-";
    const formatted = Number(Math.abs(value).toPrecision(3));
    return `${sign}${formatted}% of base`;
  }

  const formatted = Number(Math.abs(amount).toPrecision(3));
  const sign = amount >= 0 ? "+" : "-";

  return `${sign}${formatted}`;
}

// Convert CamelCase into readable words
function formatEffectName(name) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/Upgraded$/, "")
    .trim();
}

// Convert XML resource names into display names
function formatEffectResource(resource) {
  return resource?.replace(/Resource$/, "") || "";
}

// Get the first target of an effect
function getEffectTarget(effect) {
  return formatEffectName(effect.targets?.[0]?.name || "");
}

// Individual technology effect handlers
const DATA_SUBTYPE_HANDLERS = {

  workrate: effect => {
  const resource = formatEffectResource(effect.unittype);
  return `<img src="${ICONS[resource].src}" class="panel-icon"> ${resource} gather rate`;
  },
  workratespecific: effect => {
    const resource = effect.resource;
    const source = formatEffectName(effect.unittype);
    return `${resource} gathering rate from ${source}`;
  },
  carrycapacity: effect => `<img src="${ICONS[effect.resource].src}" class="panel-icon"> ${effect.resource} carry capacity`,
  trainpoints: effect => `<img src="images/Icons/time.png" class="panel-icon"> ${getEffectTarget(effect)} training time`,
  buildpoints: effect => `<img src="images/Icons/time.png" class="panel-icon"> ${getEffectTarget(effect)} construction time`,
  cost: effect => `${getEffectTarget(effect)} ${effect.resource} cost`,
  costbuildingtechs: effect => `${getEffectTarget(effect)} technology ${effect.resource} cost`,
  researchrate: effect => `<img src="images/Icons/time.png" class="panel-icon"> ${getEffectTarget(effect)} research speed`,
  hitpoints: effect => `${getEffectTarget(effect)} hitpoints`,
  damage: effect => `${getEffectTarget(effect)} Damage`,
  armorvulnerability: effect => `<img src="images/Icons/armor_${effect.armortype.toLowerCase()}.png" class="panel-icon"> ${getEffectTarget(effect)}`,
  unitregenrate: effect => `${getEffectTarget(effect)} regen rate`,
  maximumvelocity: effect => `${getEffectTarget(effect)} max speed`,
  damagebonus: effect => `${getEffectTarget(effect)} bonus vs ${effect.unittype}`,
  los: effect => `${getEffectTarget(effect)} LOS`,
  fullcapacitymultiplier: effect => `${getEffectTarget(effect)} FullCapacityMultiplier`,
  modifyratecap: effect => `${getEffectTarget(effect)} ModifyRateCap`,
  researchpoints: effect => `${getEffectTarget(effect)} ResearchPoints`,
  maximumrange: effect => `${getEffectTarget(effect)} MaximumRange`,
  maximumcontained: effect => `${getEffectTarget(effect)} MaximumContained`,
  trackrating: effect => `${getEffectTarget(effect)} Trackrating`,
  rateoffire: effect => `${getEffectTarget(effect)} rate of fire`,
  rechargetime: effect => `${getEffectTarget(effect)} RechargeTime`,
};

// Display technology effects
function addPanelEffects(panel, effects) {
  if (!effects?.length) return;

  const descriptions = [];

  effects.forEach(effect => {
    // Ignore effects hidden from tooltips, and name changes
    if (effect.hidetooltip !== undefined) return;
    if (effect.type === "SetName") return;

    // Handle Data effects
    if (effect.type === "Data") {
      const handler = DATA_SUBTYPE_HANDLERS[effect.subtype?.toLowerCase()];
      if (!handler) {console.warn("Unhandled tech effect:", effect.subtype);
        return;
      }
      const description = handler(effect);
      const amount = formatTechAmountWithRelativity(effect);
      descriptions.push(`${description}: ${amount}`);
    }
  });

  if (!descriptions.length) return;

  const h3 = document.createElement("h3");
  h3.textContent = "Effects";
  h3.classList.add("attack-name");
  panel.appendChild(h3);

  descriptions.forEach(description => {
    const span = document.createElement("span");
    span.classList.add("panel-line");
    span.innerHTML = description;
    panel.appendChild(span);
    panel.appendChild(document.createElement("br"));
  });
}