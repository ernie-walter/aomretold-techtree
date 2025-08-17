// This file is intentionally left blank.
 
// Player Colour Dropdown Selection
const dropdownColour = document.getElementById("PlayerColourToggle");
const wrappers = document.querySelectorAll(".icon-wrapper:not(.no-background)");

dropdownColour.addEventListener("change", function () {
  const color = this.value || "#ffffff"; // will now use hex code
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
