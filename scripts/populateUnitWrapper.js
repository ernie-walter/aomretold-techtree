// populateUnitWrapper populates an icon wrapper with unit data
async function populateUnitWrapper(wrapper, unitIndex) {
  const unitName = wrapper.getAttribute('name');
  const god = wrapper.dataset.god; // optional

  const unitNodeObj = unitIndex[unitName];
  if (!unitNodeObj) {
   // console.warn(`Unit ${unitName} not found`);
    return;
  }

  const data = getUnitDataFromNode(unitNodeObj.node);

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
  img.src = `../images/${data.icon.replace(/\\/g, "/")}`;

  // --- Frame overlay ---
  const existingFrame = wrapper.querySelector('.frame');
  if (!existingFrame) {
    const frame = document.createElement('img');
    frame.src = `images/Frames/Frame_${data.category}.png`;
    frame.classList.add('frame');
    wrapper.appendChild(frame);
  }

   // --- Tooltip ---
  wrapper.title = `${unitName}\nCategory: ${data.category}\nPopulation: ${data.population}`;

}