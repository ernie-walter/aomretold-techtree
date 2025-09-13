// List of panel icon names (same as filenames without extension)
const iconNames = [
  "food", "wood", "gold", "favor", "time",
  "pop", "speed", "hp",
  "atk_hack", "atk_pierce", "atk_crush", "atk_divine","atk_rof", "atk_projectiles", "atk_area", "atk_range",
  "armor_hack", "armor_pierce", "armor_crush",
  "type_soldier", "type_infantry", "type_cavalry", "type_ranged",
  "type_villager", "type_hero", "type_mythunit", "type_titan",
  "type_building", "type_wall", "type_tower", "type_siege",
  "type_ship", "type_ship_archer", "type_ship_siege", "type_ship_melee"
];
// Create a mapping of icon names to their file paths
const ICONS = Object.fromEntries(
  iconNames.map(name => [PascalCaseName(name), { src: `images/Icons/${name}.png` }])  
);
console.log(ICONS)
function PascalCaseName(name) {
  return name.replace(/(^|_)([a-z])/g, (_, __, c) => c.toUpperCase());
}

// Viewport adjustment for iOS Safari
function setVh() {    // Set CSS variable --vh to 1% of the viewport height
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVh();    // Run on load
window.addEventListener('resize', setVh); // Update on resize or orientation change
window.addEventListener('orientationchange', setVh);

// Player Colour Dropdown Selection
const dropdownColour = document.getElementById("PlayerColourToggle");

dropdownColour.addEventListener("change", function () {
  const color = this.value || "#ffffff"; 
  const wrappers = document.querySelectorAll(".icon:not(.no-background)");
  wrappers.forEach(wrapper => {
    wrapper.style.backgroundColor = color; 
  });
  const panelIcons = document.querySelectorAll("#large-panel-icon");
  panelIcons.forEach(img => {
    img.style.backgroundColor = color; 
  });
});

// Minor God Mapping
const majorToMinorMap = {
  zeus: ["greek", "zeus", "athena", "hermes", "apollo", "dionysus", "hephaestus", "hera"],
  poseidon: ["greek", "poseidon", "ares", "hermes", "aphrodite", "dionysus", "hephaestus", "artemis"],
  hades: ["greek", "hades", "ares", "athena", "aphrodite", "apollo", "hephaestus", "artemis"],
  ra: ["egyptian", "ra", ""],
  isis: [],
};

// Filtering out icons based on Major God selection
const dropdownMajor = document.getElementById('MajorGodToggle');
const iconsCiv = document.querySelectorAll('.icon-wrapper[data-civ]');
dropdownMajor.addEventListener('change', () => {
  const selectedMajor = dropdownMajor.value;

  iconsCiv.forEach(icon => {
    const minorGod = icon.dataset.civ;

    if (selectedMajor === "all" || (majorToMinorMap[selectedMajor] || []).includes(minorGod)) {
      icon.style.display = "block";  // show
    } else {
      icon.style.display = "none";   // hide
    }
  });
});

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
    entries = [[tag, data]]; // tag is a single value
    ({ prefix = undefined, newline = false, suffix = "" } = options);
  } else {
    entries = Object.entries(data);   // tag is object/array
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


// Build icons using populateUnitWrapper() and getUnitData()
document.addEventListener("DOMContentLoaded", async () => {
  const unitIndex = await buildUnitIndex();                           // Creates unitIndex used below
  const unitDataMap = {};                                             // Top level tooltip data storage

  const wrappers = document.querySelectorAll(".icon-wrapper");

  for (const wrapper of wrappers) {                                   // For each wrapper:
    const unitData = await populateUnitWrapper(wrapper, unitIndex);     // Run populateUnitWrapper() to fill it
    const id = wrapper.getAttribute("name");                            // id = the wrapper's name, passed from getUnitDataFromNode()
    if (id && unitData) {
      unitDataMap[id] = unitData;                                       // Store that wrapper's data in top level map
    }
  }

  // Merge LR for both units and techs
   await mergeLRIntoUnitData(unitDataMap);

  // Add god overlays
  wrappers.forEach(wrapper => {
    if (!wrapper.dataset.civ) return;

    const god = wrapper.dataset.civ;
    if (!god) return; // skip if no data-god

    // list of pantheons to skip
    const skipGods = ["greek", "egyptian", "norse", "atlantean", "chinese"];

    if (skipGods.includes(god.toLowerCase())) return; // skip pantheon overlays
    if (wrapper.querySelector(".god-overlay")) return; // prevent duplicates

    const overlay = document.createElement("img");
    overlay.src = `images/God Pictures/${god}_icon.png`;
    overlay.classList.add("god-overlay");
    wrapper.appendChild(overlay);
  });

  // Sidebar panel with tooltip info
  const panelTitle = document.getElementById("panel-title");
  const panelDescription = document.getElementById("panel-content");
  const panelImg = document.getElementById("large-panel-img");

  wrappers.forEach(wrapper => {                               // For each wrapper:
    wrapper.addEventListener("mouseenter", () => {                // When mouse enters that wrapper:
      
      const id2 = wrapper.getAttribute("name");                      // id = its name attribute    
      const data = unitDataMap[id2];                                 // data = all of that unit's data from top level map    
      if (!data) return;
      
      panelTitle.textContent = data.displayName || "Unknown";       // Panel is made up of title and descripton. This sets title to the unit's displayName
      panelDescription.innerHTML = "";                              // Clear description for now. We will slowly build it up below...
      panelImg.src = `images/${data.icon.replace(/\\/g, "/")}`;

    // Add _LR description if it exists
    if (data._LR) {
      const span = document.createElement("div");
      span.textContent = data._LR;
      span.classList.add("panel-line");
      panelDescription.appendChild(span);
    }

    if (data.cost) addPanelInfo(panelDescription, data.cost, {newline: true});
    if (data.population) addPanelInfo(panelDescription, data.population, "Pop");
    if (data.trainTime) addPanelInfo(panelDescription, data.trainTime, "Time", {newline: true, suffix: "s"});
    if (data.hitPoints) addPanelInfo(panelDescription, data.hitPoints, "Hp");
    if (data.armor) addPanelInfo(panelDescription, data.armor, {prefix: "Armor"});
    if (data.speed) addPanelInfo(panelDescription, data.speed, "Speed", {newline: true});
    if (data.attacks) addPanelAttacks(panelDescription, data.attacks);

      console.log(data);  // Debug log to confirm hover action
    });
  });
});

