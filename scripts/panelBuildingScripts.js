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

  let value = amount;

  if (relativity === "percent" || relativity === "basepercent") {
    value = (amount - 1) * 100;
  }

  if (relativity === "assign") {
    return `set to ${amount}`;
  }

  if (relativity === "override") {
    return `sets base value to ${amount}`;
  }

  const formatted = Number(Math.abs(value).toPrecision(3));
  const sign = value >= 0 ? "+" : "-";

  if (relativity === "percent" || relativity === "basepercent") {
    return `${sign}${formatted}%`;
  }

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
    return `${resource} gathering rate`;
  },

  workratespecific: effect => {
    const resource = effect.resource;
    const source = formatEffectName(effect.unittype);

    return `${resource} gathering rate from ${source}`;
  },

  carrycapacity: effect => {
    return `${effect.resource} carry capacity`;
  },

  trainpoints: effect => {
    return `${getEffectTarget(effect)} training time`;
  },

  buildpoints: effect => {
    return `${getEffectTarget(effect)} construction time`;
  },

  cost: effect => {
    return `${getEffectTarget(effect)} ${effect.resource} cost`;
  },

  costbuildingtechs: effect => {
    return `${getEffectTarget(effect)} technology ${effect.resource} cost`;
  },

  researchrate: effect => {
    return `${getEffectTarget(effect)} research speed`;
  },

  hitpoints: effect => {
    return `${getEffectTarget(effect)} hitpoints`;
  }

};
// Display technology effects
function addPanelEffects(panel, effects) {
  if (!effects?.length) return;

  const descriptions = [];

  effects.forEach(effect => {

    // Ignore effects hidden from tooltips
    if (effect.hidetooltip !== undefined) return;

    // Handle SetName separately
    if (effect.type === "SetName") {
      const oldName = formatEffectName(effect.proto);

      const newName = effect.newname
        .replace(/^STR_UNIT_/, "")
        .replace(/_NAME$/, "")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());

      descriptions.push(`${oldName} becomes ${newName}`);
      return;
    }

    // Handle Data effects
    if (effect.type === "Data") {
      const handler = DATA_SUBTYPE_HANDLERS[effect.subtype?.toLowerCase()];

      if (!handler) {
        console.warn("Unhandled tech effect:", effect.subtype);
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
    span.textContent = description;

    panel.appendChild(span);
    panel.appendChild(document.createElement("br"));
  });
}