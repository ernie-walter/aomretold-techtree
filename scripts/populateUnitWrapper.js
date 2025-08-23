// populateUnitWrapper populates an icon wrapper with unit data
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
  let img = iconDiv.querySelector("img");
  if (!img) {
  img = document.createElement("img");
  iconDiv.appendChild(img);
  }

  // Set the src of the image
  img.src = `../images/${data.icon.replace(/\\/g, "/")}`;
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "contain"; // scales the image to fit without stretching

  // --- Category for frame ---
  wrapper.dataset.type = data.category.replace(" ", "");
  //wrapper.dataset.type = data.category.toUpperCase().replace(" ", "");

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


}
