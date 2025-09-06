// List of panel icon names (same as filenames without extension)
const iconNames = [
  "food", "wood", "gold", "favor", "time",
  "pop", "speed", "hp",
  "atk_hack", "atk_pierce", "atk_crush", "atk_divine","atk_rof", "atk_projectiles", "atk_area",
  "armor_hack", "armor_pierce", "armor_crush",
  "type_soldier", "type_infantry", "type_cavalry", "type_ranged",
  "type_villager", "type_hero", "type_myth", "type_titan",
  "type_building", "type_wall", "type_tower", "type_siege",
  "type_ship", "type_ship_archer", "type_ship_siege", "type_ship_melee"
];
// Create a mapping of icon names to their file paths
const ICONS = Object.fromEntries(
  iconNames.map(name => [PascalCaseName(name), { src: `images/Icons/${name}.png` }])
);

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
    //wrapper.querySelector('.background-layer').style.backgroundColor = color;
    wrapper.style.backgroundColor = color; 
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
  const panelDescription = document.getElementById("panel-description");
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

      // === Cost section ===
      if (data.cost) {                                            // If the unit has a cost object:
        for (const [res, val] of Object.entries(data.cost)) {      // For each resource in that cost object:
          const span = document.createElement("span");                // Create a new span for each resource
          span.classList.add("panel-line");                           // Add a "panel-line" class to that span to carry over styling 
          span.style.display = "inline";                              // ensure it's inline

          if (ICONS[res]) {                                       // If there's an icon for that resource:    
            const img = document.createElement("img");              // Create an <img> element  
            img.src = ICONS[res].src;                               // Set its src to the icon's src 
            img.classList.add("panel-icon");                        // Add a "panel-icon" class to that img to carry over styling 
            span.appendChild(img);
          }
          span.appendChild(document.createTextNode(val + " "));         // Add the cost value text to the span
          panelDescription.appendChild(span);                     // Add that span to the panel description.
        }
        
      }

      // === Train Time ===
      if (data.trainTime) {
        const span = document.createElement("span");
        span.classList.add("panel-line");                           // Add a "panel-line" class to that span to carry over styling 
        span.style.display = "inline";                              // ensure it's inline
        if (ICONS.Time) {
          const img = document.createElement("img");
          img.src = ICONS.Time.src;
          img.classList.add("panel-icon");
          span.appendChild(img);
        }
        span.appendChild(document.createTextNode(data.trainTime + "s "));
        panelDescription.appendChild(span);
        panelDescription.appendChild(document.createElement("br"));
      }

      // === HP ===
      if (data.hitPoints) {
        const span = document.createElement("span");
        span.classList.add("panel-line");                           // Add a "panel-line" class to that span to carry over styling 
        span.style.display = "inline";                              // ensure it's inline
        if (ICONS.Hp) {
          const img = document.createElement("img");
          img.src = ICONS.Hp.src;
          img.classList.add("panel-icon");
          span.appendChild(img);
        }
        span.appendChild(document.createTextNode(data.hitPoints + " "));
        panelDescription.appendChild(span);
      }

      // === Population ===
      if (data.population) {
        const span = document.createElement("span");
        span.classList.add("panel-line");                           // Add a "panel-line" class to that span to carry over styling 
        span.style.display = "inline";                              // ensure it's inline
        if (ICONS.Pop) {
          const img = document.createElement("img");
          img.src = ICONS.Pop.src;
          img.classList.add("panel-icon");
          span.appendChild(img);
        }
        span.appendChild(document.createTextNode(data.population + " "));
        panelDescription.appendChild(span);
      }

      // === Speed ===
      if (data.speed) {
        const span = document.createElement("span");
        span.classList.add("panel-line");                           // Add a "panel-line" class to that span to carry over styling 
        span.style.display = "inline";                              // ensure it's inline
        if (ICONS.Speed) {
          const img = document.createElement("img");
          img.src = ICONS.Speed.src;
          img.alt = "Speed";
          img.classList.add("panel-icon");
          span.appendChild(img);
        }
        span.appendChild(document.createTextNode(data.speed + " "));
        panelDescription.appendChild(span);
        panelDescription.appendChild(document.createElement("br"));
      }

      // === Armor ===
      if (data.armor) {
        for (const [type, val] of Object.entries(data.armor)) {
          const span = document.createElement("span");
          span.classList.add("panel-line");                           // Add a "panel-line" class to that span to carry over styling 
          span.style.display = "inline";                              // ensure it's inline
          if (ICONS[`Armor${type}`]){
            const img = document.createElement("img");
            img.src = ICONS[`Armor${type.replace(/["'\s]/g,'')}`]?.src;
            img.classList.add("panel-icon");                        // Add a "panel-icon" class to that img to carry over styling 
            span.appendChild(img);
          }
          span.appendChild(document.createTextNode(data.armor[type] + " "));
          panelDescription.appendChild(span);
        }
        panelDescription.appendChild(document.createElement("br"));
      }
      
      // === Attacks section ===
      if (data.attacks && data.attacks.length > 0) {
        data.attacks.forEach(atk => {
          const row = document.createElement("div");
          row.classList.add("panel-row");

          // Damage types (Hack, Pierce, Crush, Divine…)
          for (const [type, val] of Object.entries(atk.damage)) {
            const dmgSpan = document.createElement("span");
            dmgSpan.classList.add("panel-line");

            if (ICONS[`Attack_${type}`]) {
              const img = document.createElement("img");
              img.src = ICONS[`Attack_${type}`].src;
              img.classList.add("panel-icon");
              dmgSpan.appendChild(img);
            }

            dmgSpan.appendChild(document.createTextNode(val));
            row.appendChild(dmgSpan);
          }

          // ROF
          if (atk.rof) {
            const rofSpan = document.createElement("span");
            rofSpan.classList.add("panel-line");
            rofSpan.textContent = `ROF: ${atk.rof}`;
            row.appendChild(rofSpan);
          }

          // Projectiles
          if (atk.numProjectiles) {
            const projSpan = document.createElement("span");
            projSpan.classList.add("panel-line");
            projSpan.textContent = `×${atk.numProjectiles}`;
            row.appendChild(projSpan);
          }

          // Area damage
          if (atk.area) {
            const areaSpan = document.createElement("span");
            areaSpan.classList.add("panel-line");
            areaSpan.textContent = `Area: ${atk.area}`;
            row.appendChild(areaSpan);
          }

          // Bonus vs types
          if (atk.bonus.length > 0) {
            atk.bonus.forEach(b => {
              const bonusSpan = document.createElement("span");
              bonusSpan.classList.add("panel-line");
              bonusSpan.textContent = `Bonus vs ${b.vs}: ${b.value}`;
              row.appendChild(bonusSpan);
            });
          }

          panelDescription.appendChild(row);
        });
      }

      // wrapper.addEventListener("mouseleave", () => {
      // panelTitle.textContent = "";
      // panelDescription.textContent = "";
      // });

      // console.log(data);  // Debug log to confirm hover action

    });
  });
});

