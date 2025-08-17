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

// Icon Overlay for Minor God-specific techs/units
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".icon-wrapper[data-god]").forEach(wrapper => {
    const god = wrapper.dataset.god; // e.g. "athena"
    
    // Create overlay img
    const overlay = document.createElement("img");
    overlay.src = `images/God Pictures/${god}_icon.png`; // adjust path if needed
    overlay.classList.add("god-overlay");
    
    wrapper.appendChild(overlay);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".icon-wrapper").forEach(wrapper => {
    const type = wrapper.dataset.type;  // e.g. "tech", "unit", "building"
    const god  = wrapper.dataset.god;   // e.g. "athena" (might be undefined)

    // Add frame based on type
    if (type) {
      const frame = document.createElement("img");
      frame.src = `images/Frames/Frame_${type}.png`; // adjust path to your naming
      frame.classList.add("frame");
      wrapper.appendChild(frame);
    }

    // Add god overlay if applicable
    if (god) {
      const overlay = document.createElement("img");
      overlay.src = `images/God Pictures/${god}_icon.png`;
      overlay.classList.add("god-overlay");
      wrapper.appendChild(overlay);
    }
  });
});
