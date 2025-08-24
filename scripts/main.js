// // Image preloading
// const preloadImages = [
//   "images/God Pictures/aphrodite_icon.png",
//   "images/God Pictures/apollo_icon.png",
//   "images/God Pictures/ares_icon.png",
//   "images/God Pictures/athena_icon.png",
//   "images/God Pictures/dionysus_icon.png",
//   "images/God Pictures/hephaestus_icon.png",
//   "images/God Pictures/hera_icon.png",
//   "images/God Pictures/hermes_icon.png",
//   "images/God Pictures/hades_icon.png",
//   "images/God Pictures/poseidon_icon.png",
//   "images/God Pictures/zeus_icon.png",
//   "images/God Pictures/artemis_icon.png",
// ];
// preloadImages.forEach(src => {
//   const img = new Image();
//   img.src = src;
// });


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
  // ra: ["egyptian", "ra", "isis", "set", "horus", "thoth", "bast", "sekmet"],
};

// Filtering out icons based on Major God selection
const dropdownMajor = document.getElementById('MajorGodToggle');
const iconsGod = document.querySelectorAll('.icon-wrapper[data-god]');
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

// Building icons using populateUnitWrapper() and getUnitData()
document.addEventListener("DOMContentLoaded", async () => {
  const unitIndex = await buildUnitIndex();

  const wrappers = document.querySelectorAll(".icon-wrapper");
  for (const wrapper of wrappers) {
    await populateUnitWrapper(wrapper, unitIndex);
  }

  // Add god overlays
  wrappers.forEach(wrapper => {
    if (!wrapper.dataset.god) return;

    const god = wrapper.dataset.god;
    if (!god) return; // skip if no data-god

    // list of pantheons to skip
  const skipGods = ["greek", "egyptian", "norse", "atlantean", "chinese"];

  if (skipGods.includes(god.toLowerCase())) return; // skip pantheon overlays
  if (wrapper.querySelector(".god-overlay")) return; // prevent duplicates

    // if (god === "greek", "egyptian", "norse", "atlantean", "chinese") return;

    const overlay = document.createElement("img");
    overlay.src = `images/God Pictures/${god}_icon.png`;
    overlay.classList.add("god-overlay");
    wrapper.appendChild(overlay);
  });
});