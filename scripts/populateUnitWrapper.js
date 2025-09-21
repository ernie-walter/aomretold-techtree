// populateUnitWrapper populates an icon wrapper with unit data
function populateUnitWrapper(wrapper, unitIndex) {
  const unitName = wrapper.getAttribute('name');        // Gets 'name' from wrapper (i.e. what you type in html)
  const unitNodeObj = unitIndex[unitName];              // Looks for name in unitIndex and creates an empty object (unitNodeObj) for it
  if (!unitNodeObj) return
  const data = getUnitDataFromNode(unitNodeObj.node, wrapper);  // Creates 'data'

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
  img.src = `images/${data.icon.replace(/\\/g, "/")}`;

  // --- Frame overlay ---
  const existingFrame = wrapper.querySelector('.frame');
  if (!existingFrame) {
    const frame = document.createElement('img');
    frame.src = `images/Frames/Frame_${data.category}.png`;
    frame.classList.add('frame');
    wrapper.appendChild(frame);
  }

  return data;
}