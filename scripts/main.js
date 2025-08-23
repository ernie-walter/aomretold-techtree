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