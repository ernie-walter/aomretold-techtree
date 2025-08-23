// This file is intentionally left blank.
 
// Player Colour Dropdown Selection
const dropdownColour = document.getElementById("PlayerColourToggle");
const wrappers = document.querySelectorAll(".icon:not(.no-background)");

dropdownColour.addEventListener("change", function () {
  const color = this.value || "#ffffff"; 
  wrappers.forEach(wrapper => {
    wrapper.style.backgroundColor = color; 
  });
});

// Minor God Mapping
const majorToMinorMap = {
  zeus: ["zeus", "athena", "hermes", "apollo", "dionysus", "hephaestus", "hera"],
  poseidon: ["poseidon", "ares", "hermes", "aphrodite", "dionysus", "hephaestus", "artemis"],
  hades: ["hades", "ares", "athena", "aphrodite", "apollo", "hephaestus", "artemis"],
};

// Dropdown for Major Gods
const dropdownMajor = document.getElementById('MajorGodToggle');
const iconsGod = document.querySelectorAll('.icon-wrapper.god');

dropdownMajor.addEventListener('change', () => {
  const selectedMajor = dropdownMajor.value;

  iconsGod.forEach(icon => {
    const minorGod = icon.dataset.god;

    if (selectedMajor === "all" || (majorToMinorMap[selectedMajor] || []).includes(minorGod)) {
      icon.style.display = "block";  // show
    } else {
      icon.style.display = "none";   // hide
    }
  });
});

// // Icon Overlay for Minor God-specific techs/units
// document.addEventListener("DOMContentLoaded", () => {
//   document.querySelectorAll(".icon-wrapper[data-god]").forEach(wrapper => {
//     const god = wrapper.dataset.god; // e.g. "athena"
    
//     // Create overlay img
//     const overlay = document.createElement("img");
//     overlay.src = `images/God Pictures/${god}_icon.png`; // adjust path if needed
//     overlay.classList.add("god-overlay");
    
//     wrapper.appendChild(overlay);
//   });
// });



// Big function to fetch unit data
// import fetch from "node-fetch";
// import { XMLParser } from "fast-xml-parser";

async function getUnitData(unitName) {
  const response = await fetch("https://raw.githubusercontent.com/ernie-walter/aomretold-techtree/main/gamefiles/proto.xml");
  const xmlString = await response.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  const unit = xmlDoc.querySelector(`unit[name="${unitName}"]`);
  if (!unit) {
    console.error(`Unit "${unitName}" not found`);
    return null;
  }

  // Determine category
  const rawTypes = Array.from(unit.querySelectorAll("unittype")).map(u => u.textContent.trim());
  let category = "Unknown";
  if (rawTypes.includes("Hero")) category = "Hero";
  else if (rawTypes.includes("MythUnit")) category = "Myth Unit";
  else if (rawTypes.includes("Building")) category = "Building";
  else if (rawTypes.includes("Unit") || rawTypes.includes("MilitaryUnit") || rawTypes.includes("Civilian")) {
    category = "Unit";
  }

  // Costs
  const cost = {};
  unit.querySelectorAll("cost").forEach(c => {
    cost[c.getAttribute("resourcetype")] = c.textContent.trim();
  });

  // Armor
  const armor = {};
  unit.querySelectorAll("armor").forEach(a => {
    armor[a.getAttribute("type")] = a.getAttribute("value");
  });

  // Attacks
  const extractAttack = (actionName) => {
    const action = Array.from(unit.querySelectorAll("protoaction"))
      .find(a => a.querySelector("name")?.textContent.trim() === actionName);
    if (!action) return null;

    const attack = { rof: action.querySelector("rof")?.textContent, damage: {}, bonus: {} };
    action.querySelectorAll("damage").forEach(d => attack.damage[d.getAttribute("type")] = d.textContent);
    action.querySelectorAll("damagebonus").forEach(d => attack.bonus[d.getAttribute("type")] = d.textContent);
    return attack;
  };

  return {
    name: unitName,
    icon: unit.querySelector("icon")?.textContent.trim(),
    category,
    cost,
    armor,
    population: unit.querySelector("populationcount")?.textContent,
    maxVelocity: unit.querySelector("maxvelocity")?.textContent,
    handAttack: extractAttack("HandAttack"),
    rangedAttack: extractAttack("RangedAttack")
  };
}


async function populateUnitWrapper(wrapper) {
  const unitName = wrapper.getAttribute("name");
  const godName = wrapper.dataset.god; // optional

  const data = await getUnitData(unitName);
  if (!data) return;

  // --- Icon div inside wrapper ---
  let iconDiv = wrapper.querySelector(".icon");
  if (!iconDiv) {
    iconDiv = document.createElement("div");
    iconDiv.classList.add("icon");
    wrapper.appendChild(iconDiv);
  }
  iconDiv.style.backgroundImage = `url('ernie-walter.github.io/aomretold-techtree/images/${data.icon.replace(/\\/g, "/")}')`;

  // --- Category for frame ---
  wrapper.dataset.type = data.category.toUpperCase().replace(" ", "");

  // --- Tooltip ---
  wrapper.title = `${unitName}\nCategory: ${data.category}\nPopulation: ${data.population}`;

  // --- Frame overlay ---
  let frameImg = wrapper.querySelector(".frame");
  if (!frameImg) {
    frameImg = document.createElement("img");
    frameImg.classList.add("frame");
    frameImg.src = `images/Frames/Frame_${wrapper.dataset.type}.png`;
    wrapper.appendChild(frameImg);
  }

  console.log("Populating:", unitName, "icon URL:", data.icon.replace(/\\/g, "/"));

}

// --- DOM ready ---
document.addEventListener("DOMContentLoaded", async () => {
  const wrappers = document.querySelectorAll(".icon-wrapper");

  // Populate all wrappers
  for (const wrapper of wrappers) {
    await populateUnitWrapper(wrapper);
  }

  // Your existing God overlay script (kept intact)
  wrappers.forEach(wrapper => {
    if (!wrapper.dataset.god) return;

    const god = wrapper.dataset.god;
    if (wrapper.querySelector(".god-overlay")) return; // prevent duplicates

    const overlay = document.createElement("img");
    overlay.src = `images/God Pictures/${god}_icon.png`;
    overlay.classList.add("god-overlay");
    wrapper.appendChild(overlay);
  });
});