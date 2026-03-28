// Viewport adjustment for iOS Safari
function setVh() {    // Set CSS variable --vh to 1% of the viewport height
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVh();    // Run on load
window.addEventListener('resize', setVh); // Update on resize or orientation change
window.addEventListener('orientationchange', setVh);

// Minor God Mapping
const majorToMinorMap = {
  zeus: ["greek", "zeus", "athena", "hermes", "apollo", "dionysus", "hephaestus", "hera"],
  poseidon: ["greek", "poseidon", "ares", "hermes", "aphrodite", "dionysus", "hephaestus", "artemis"],
  hades: ["greek", "hades", "ares", "athena", "aphrodite", "apollo", "hephaestus", "artemis"],
  ra: ["egyptian", "ra", ""],
  isis: [],
};

// Filtering out icons based on Major God selection
const iconsCiv = document.querySelectorAll('.icon-wrapper');
const dropdownMajor = document.getElementById('MajorGodToggle');
dropdownMajor.addEventListener('change', filterIcons);

function filterIcons(selectedMajor) {
  iconsCiv.forEach(icon => {
    const minorGod = icon.dataset.civ;

    if (!selectedMajor || selectedMajor === "") {
      icon.classList.add("hidden");
    }
    else if (selectedMajor === "all") {
      icon.classList.remove("hidden");
    }
    else if ((majorToMinorMap[selectedMajor] || []).includes(minorGod)) {
      icon.classList.remove("hidden");
    }
    else {
      icon.classList.add("hidden");
    }
  });
}

// Portrait tree in sidebar
function updateSidebar(selectedMajor) {
  const gods = majorToMinorMap[selectedMajor] || [];

  // Map gods into age slots
  const ageSlots = [
    ["portrait_age1", gods[1]],                   // Age 1
    ["portrait_age2a", gods[2], "portrait_age2b", gods[3]], // Age 2
    ["portrait_age3a", gods[4], "portrait_age3b", gods[5]], // Age 3
    ["portrait_age4a", gods[6], "portrait_age4b", gods[7]]  // Age 4
  ];
  ageSlots.forEach(slot => {
    for (let i = 0; i < slot.length; i += 2) {
      const imgId = slot[i];
      const god = slot[i + 1];
      const img = document.getElementById(imgId);
      if (img) {
        img.src = god ? `images/God Pictures/${god}_icon.png` : "";
      }
    }
  });
}

// Set player colour onto icon backgrounds
const dropdownColour = document.getElementById("PlayerColourToggle");
function changePlayerColour(color) {
  const wrappers = document.querySelectorAll(".icon:not(.no-background)");
  wrappers.forEach(wrapper => {wrapper.style.backgroundColor = color;});
  const largeIconFrame = document.querySelector(".panel-frame-fancy");
  if (largeIconFrame) {largeIconFrame.style.backgroundColor = color;}
}

// Build icons using populateUnitWrapper() and getUnitData()
document.addEventListener("DOMContentLoaded", async () => {
  const unitIndex = await buildUnitIndex();                           // Creates unitIndex used below
  const unitDataMap = {};                                             // Top level tooltip data storage
  const wrappers = document.querySelectorAll(".icon-wrapper");
    wrappers.forEach(icon => {
    icon.classList.add("hidden");
  });

  for (const wrapper of wrappers) {                                   // For each wrapper:
    const unitData = await populateUnitWrapper(wrapper, unitIndex);     // Run populateUnitWrapper() to fill it
    const id = wrapper.getAttribute("name");                            // id = the wrapper's name, passed from getUnitDataFromNode()
    if (id && unitData) {
      unitDataMap[id] = unitData;                                       // Store that wrapper's data in top level map
    }
  }

  // // Merge description for both units and techs
   await mergeDescriptionIntoUnitData(unitDataMap);

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

  // Build sidebar panel
  const panelTitle = document.getElementById("panel-title");
  const panelDescription = document.getElementById("panel-content");
  const panelImg = document.getElementById("large-panel-img");
  let lock = null;

  function showPanelItem(wrapper) {
    const id = wrapper.getAttribute("name");                      // id = its name attribute    
    const data = unitDataMap[id];                                 // data = all of that unit's data from top level map    
    if (!data) return;
    
    panelTitle.textContent = data.displayName || "Unknown";       // Panel is made up of title and descripton. This sets title to the unit's displayName
    panelDescription.innerHTML = "";                              // Clear description for now. We will slowly build it up below...
    panelImg.src = `images/${data.icon.replace(/\\/g, "/")}`;

    // Add description if it exists
    if (data.description) {
      const span = document.createElement("div");
      span.textContent = data.description;
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
  };
  
  // Hover to show item in panel, click to freeze
  wrappers.forEach(wrapper => {
    wrapper.addEventListener("mouseenter", () => {
      if (lock) return;           // skip if locked
      showPanelItem(wrapper);
    });

    wrapper.addEventListener("click", (e) => {
      e.stopPropagation();                  // prevent bubbling to document
      if (lock === wrapper) {lock = null;}  // unlock
      else {lock = wrapper; showPanelItem(wrapper);}  // lock this one
    });
  });
  
  // Click off icon to unfreeze
  const main = document.querySelector('main'); // your main content
  document.addEventListener("click", (e) => {
    if (main.contains(e.target)) {
      lock = null;
      panelTitle.textContent = "Hover over an icon";
      panelDescription.innerHTML = "Click to freeze it";
      panelImg.src = "";
      panelImg.style.backgroundColor = ""; // clear background color
      panelImg.parentElement.style.backgroundColor = "";
    }
  });

  // iconsCiv.forEach(icon => icon.style.display = "none");

  initDropdown("MajorGodToggle", value => {
    // Filter our techs and units
    filterIcons(value);

    // Populate portrait tree
    updateSidebar(value);

    // Watermark
    const content = document.querySelector('.content');
    if (value === 'all') {
        content.style.setProperty('--watermark', 'none');
    } else {
        content.style.setProperty('--watermark', `url("/images/Watermarks/watermark_${value}.png")`);
    }
  });

  initDropdown("PlayerColourToggle", changePlayerColour);

  console.log(unitIndex)
  console.log(unitDataMap)
});


