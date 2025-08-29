// Unit Icons Source Mapping
const ICONS = {
  // Costs
  Food:       {src: "images/Icons/food.png"},
  Wood:       {src: "images/Icons/wood.png"},
  Gold:       {src: "images/Icons/gold.png"},
  Favor:      {src: "images/Icons/favor.png"},
  Train_time: {src: "images/Icons/time.png"},
  
  // Unit Stats
  Population: {src: "images/Icons/pop.png"},
  Speed:      {src: "images/Icons/speed.png"},
  Hp:         {src: "images/Icons/hp.png"},
  
  // Attacks
  Atk_hack:   {src: "images/Icons/atk_hack.png"},
  Atk_pierce: {src: "images/Icons/atk_pierce.png"},
  Atk_crush:  {src: "images/Icons/atk_crush.png"},
  Atk_divine: {src: "images/Icons/atk_divine.png"},
  Atk_rof:    {src: "images/Icons/atk_rof.png"},
  Atk_projectiles: {src: "images/Icons/atk_projectiles.png"},
  Atk_area:   {src: "images/Icons/atk_area.png"},

  // Armor
  Armor_Hack:   {src: "images/Icons/armor_hack.png"},
  Armor_Pierce: {src: "images/Icons/armor_pierce.png"},
  Armor_Crush:  {src: "images/Icons/armor_crush.png"},

  // Unit types
  Type_soldier:  {src: "images/Icons/type_soldier.png"},
  Type_infantry: {src: "images/Icons/type_infantry.png"},
  Type_cavalry:  {src: "images/Icons/type_cavalry.png"},
  Type_ranged:   {src: "images/Icons/type_ranged.png"},  
  
  Type_villager: {src: "images/Icons/type_villager.png"},
  Type_hero:     {src: "images/Icons/type_hero.png"},
  Type_myth:     {src: "images/Icons/type_myth.png"},
  Type_titan:    {src: "images/Icons/type_titan.png"},
  
  Type_building: {src: "images/Icons/type_building.png"},
  Type_wall:     {src: "images/Icons/type_wall.png"},
  Type_tower:    {src: "images/Icons/type_tower.png"},
  Type_siege:    {src: "images/Icons/type_siege.png"},
  
  Type_ship:     {src: "images/Icons/type_ship.png"},
  Type_ship_archer: {src: "images/Icons/type_ship_archer.png"},
  Type_ship_siege:  {src: "images/Icons/type_ship_siege.png"},
  Type_ship_melee:  {src: "images/Icons/type_ship_melee.png"},
};

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

  wrappers.forEach(wrapper => {                               // For each wrapper:
    wrapper.addEventListener("mouseenter", () => {                // When mouse enters that wrapper:
      const id2 = wrapper.getAttribute("name");                      // id = its name attribute    
      const data = unitDataMap[id2];                                 // data = all of that unit's data from top level map    
      if (!data) return;

      panelTitle.textContent = data.displayName || "Unknown";       // Panel is made up of title and descripton. This sets title to the unit's displayName
      panelDescription.innerHTML = "";                              // Clear description for now. We will slowly build it up below...

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

      // === Population ===
      if (data.population) {
        const span = document.createElement("span");
        span.classList.add("panel-line");                           // Add a "panel-line" class to that span to carry over styling 
        if (ICONS.Population) {
          const img = document.createElement("img");
          img.src = ICONS.Population.src;
          img.classList.add("panel-icon");
          span.appendChild(img);
        }
        span.appendChild(document.createTextNode(data.population));
        panelDescription.appendChild(span);
      }

      // === Speed ===
      if (data.speed) {
        const span = document.createElement("span");
        span.classList.add("panel-line");                           // Add a "panel-line" class to that span to carry over styling 
        if (ICONS.Speed) {
          const img = document.createElement("img");
          img.src = ICONS.Speed.src;
          img.alt = "Speed";
          img.classList.add("panel-icon");
          span.appendChild(img);
        }
        span.appendChild(document.createTextNode(data.speed));
        panelDescription.appendChild(span);
      }

      // === Armor ===
      if (data.armor) {
        for (const [type, val] of Object.entries(data.armor)) {
          const span = document.createElement("span");
          span.classList.add("panel-line");                           // Add a "panel-line" class to that span to carry over styling 
          span.style.display = "inline";                              // ensure it's inline
          if (ICONS[`Armor_${type}`]){
            const img = document.createElement("img");
            img.src = ICONS[`Armor_${type.replace(/["'\s]/g,'')}`]?.src;
            img.classList.add("panel-icon");                        // Add a "panel-icon" class to that img to carry over styling 
            span.appendChild(img);
          }
          span.appendChild(document.createTextNode(data.armor[type] + " "));
          panelDescription.appendChild(span);
          
        }
      }
      
      // wrapper.addEventListener("mouseleave", () => {
      // panelTitle.textContent = "";
      // panelDescription.textContent = "";
      // });
    });
  });
});

