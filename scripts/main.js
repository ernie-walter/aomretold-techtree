// Viewport adjustment for iOS Safari
function setVh() {    // Set CSS variable --vh to 1% of the viewport height
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVh();    // Run on load
window.addEventListener('resize', setVh); // Update on resize or orientation change
window.addEventListener('orientationchange', setVh);

// Build fancy dropdown menus
function initDropdown(containerId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const selected = container.querySelector(".selected");
  const label = selected.querySelector(".label");
  const list = container.querySelector(".dropdown-list");
  const options = list.querySelectorAll("li");

  // Toggle dropdown
  selected.addEventListener("click", () => {
    list.style.display = list.style.display === "block" ? "none" : "block";
  });

  // Handle option click
  options.forEach(option => {
    option.addEventListener("click", () => {
      label.innerHTML = ""; // clear previous

      const img = option.querySelector("img");
      const square = option.querySelector(".player-square");

      if (img) {
        label.appendChild(img.cloneNode(true)); // clone icon
        label.appendChild(document.createTextNode(option.textContent.trim())); // add text
      } else if (square) {
        label.appendChild(square.cloneNode(true)); // clone icon
      }
      list.style.display = "none";
      if (onSelect) onSelect(option.dataset.value);
    });
  });

  // Close if clicking outside
  document.addEventListener("click", e => {
    if (!container.contains(e.target)) list.style.display = "none";
  });
}

// Dropdown button mouse hover background changes
document.querySelectorAll('.dropdown .selected .dropdown-bg').forEach(img => {
  const off = 'images/Buttons/BtnOrnate_Sml_Light.png';
  const on  = 'images/Buttons/BtnOrnate_Sml_Gold.png';

  img.addEventListener('mouseenter', () => img.src = on);
  img.addEventListener('mouseleave', () => img.src = off);
});

// Dropdown button fade effect
function addHoverFadeSwap(img, offSrc, onSrc, duration = 300) {
  img.style.transition = `opacity ${duration}ms ease`;
  function swap(newSrc) {
    img.style.opacity = 0;
    setTimeout(() => {
      img.src = newSrc;
      img.style.opacity = 1;
    }, duration / 2);
  }
  img.addEventListener('mouseenter', () => swap(onSrc));
  img.addEventListener('mouseleave', () => swap(offSrc));
}
const btnImg = document.querySelector('.dropdown .selected .dropdown-bg');
addHoverFadeSwap(
  btnImg,
  'images/Buttons/BtnOrnate_Sml_Light.png',
  'images/Buttons/BtnOrnate_Sml_Gold.png',
  50 // optional fade duration (ms)
);


// Set player colour onto icon backgrounds
const dropdownColour = document.getElementById("PlayerColourToggle");
function changePlayerColour(color) {
  const wrappers = document.querySelectorAll(".icon:not(.no-background)");
  wrappers.forEach(wrapper => {wrapper.style.backgroundColor = color;});
  const panelIcons = document.querySelectorAll("#large-panel-icon");
  panelIcons.forEach(img => {
    img.style.backgroundColor = color; 
  });
};

// Helper to build Player Colour Square Icons
document.querySelectorAll('.player-square').forEach(el => {
  const color = el.getAttribute('color');
  if (!color) return;
  el.style.setProperty('--playerColour', color);
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
const iconsCiv = document.querySelectorAll('.icon-wrapper[data-civ]');
const dropdownMajor = document.getElementById('MajorGodToggle');
dropdownMajor.addEventListener('change', filterIcons);

function filterIcons(selectedMajor) {
  iconsCiv.forEach(icon => {
    const minorGod = icon.dataset.civ;
    if (selectedMajor === "all") {
      icon.style.display = "block"; // show everything
    } else if ((majorToMinorMap[selectedMajor] || []).includes(minorGod)) {
      icon.style.display = "block"; // show matching icons
    } else {
      icon.style.display = "none";  // hide the rest
    }
  });
}

const watermarkNames = [
  'zeus','poseidon','hades',
  'ra','isis','set',
  'thor','odin','loki','freyr',
  'kronos','oranos','gaia',
  'fuxi','nuwa','shennong'
];

const watermarks = Object.fromEntries(
  watermarkNames.map(name => [name, `url("images/Watermarks/watermark_${name}.png")`])
);
watermarks.all = 'none';

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
  };
  
  // Hover to show item in panel, click to freeze
  wrappers.forEach(wrapper => {
    wrapper.addEventListener("mouseenter", () => {
      if (lock) return;           // skip if locked
      showPanelItem(wrapper);
    });

    wrapper.addEventListener("click", (e) => {
      e.stopPropagation();                 // prevent bubbling to document
      if (lock === wrapper) {
      lock = null;              // unlock
    } else {
      lock = wrapper;           // lock this one
      showPanelItem(wrapper);
    }
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
  
  initDropdown("MajorGodToggle", value => {
    filterIcons(value);
    const content = document.querySelector('.content');
    content.style.setProperty('--watermark', watermarks[value] || 'none');
  });

  initDropdown("PlayerColourToggle", changePlayerColour);
});

