// This file is intentionally left blank.
 
// Player Colour Dropdown Selection
const dropdown = document.getElementById("PlayerColourToggle");
const wrappers = document.querySelectorAll(".icon-wrapper:not(.no-background)");

dropdown.addEventListener("change", function () {
  const color = this.value || "#ffffff"; // will now use hex code
  wrappers.forEach(wrapper => {
    wrapper.style.backgroundColor = color;
  });
});
