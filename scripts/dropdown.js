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
