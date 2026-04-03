// populateUnitWrapper populates an icon wrapper with unit data
function populateUnitWrapper(wrapper, data) {
  const unitIndex = data.unitIndex;
  const godPowerIndex = data.godPowerIndex;
  const unitName = wrapper.getAttribute('name');        // Gets 'name' from wrapper (i.e. what you type in html)

  let unitNodeObj = unitIndex[unitName];    // Looks for name in unitIndex and creates an empty object (unitNodeObj) for it
  let isGodPower = false;

  // fallback to god powers if not found in units
  if (!unitNodeObj && godPowerIndex[unitName]) {
    unitNodeObj = godPowerIndex[unitName];
    isGodPower = true;
  }

  if (!unitNodeObj) return null;
  
  const unitData = getUnitDataFromNode(unitNodeObj.node, wrapper);  // Creates 'unitData'

  // --- Icon ---
  let iconDiv = wrapper.querySelector('.icon');
  if (!iconDiv) {
    iconDiv = document.createElement('div');
    iconDiv.classList.add('icon');
    wrapper.appendChild(iconDiv);
  }

  // Use <img> for proper scaling
  let img = iconDiv.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";
    iconDiv.appendChild(img);
  }
  if (unitData.icon) {
    img.src = `images/${unitData.icon.replace(/\\/g, "/")}`;
    } else {
    console.warn("Missing icon for:", wrapper.getAttribute("name"));
    }

  // --- Frame overlay ---
  const existingFrame = wrapper.querySelector('.frame');
  if (!existingFrame) {
    const frame = document.createElement('img');
    frame.src = `images/Frames/Frame_${unitData.category}.png`;
    frame.classList.add('frame');
    wrapper.appendChild(frame);
  }

return unitData;
}