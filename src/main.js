import {MechanismLigament2d, MechanismRoot2d, findObjectByName} from "./mech2d.js";
import {refreshProperties} from "./properties.js";

// where it all starts
const root = new MechanismRoot2d("root", 250, 250);

/* Tree stuff */
const tree = document.getElementById("mech-objects");
const treeRoot = document.getElementById("tree");

let selectedObject = null;

function updateSelection(e) {
  // get the selected object in the tree
  const selectedName = e.target.closest(".name");

  // remove selected style from other elements
  const names = treeRoot.getElementsByClassName("name");
  for (const name of names) {
    name.classList.remove("outset");
  }

  // add selected style to element and update the selected object
  selectedName.classList.add("outset");

  let objectName = selectedName.id;
  if (objectName === "mech") {
    selectedObject = null;
  } else {
    selectedObject = findObjectByName(objectName, root);
  }

  refreshProperties(selectedObject, canvas);
}

treeRoot.addEventListener("click", (e) => {
  updateSelection(e);

  if (e.button === 2) {
    e.preventDefault();
  }

  const caret = e.target.closest(".caret");
  if (!caret || !treeRoot.contains(caret)) {
    return;
  }

  const nested = caret.parentElement.querySelector(":scope > .nested");
  if (!nested) {
    return;
  }

  nested.classList.toggle("active");
  caret.classList.toggle("caret-down");
});

/* Ligament Actions */
const appendButton = document.getElementById("append");
const deleteButton = document.getElementById("delete");

appendButton.addEventListener("click", () => {
  const target = getSelectedTreeTarget();
  if (!target) {
    return;
  }

  const ligament = new MechanismLigament2d(
      getUniqueLigamentName(),
      20,
      -90,
      10,
      "#00aa00",
  );
  target.object.append(ligament);
  target.nameElement.classList.add("caret");
  ligament.addToList(target.childList);
});

deleteButton.addEventListener("click", () => {
  const target = getSelectedTreeTarget();
  if (!target || !target.object.parent) {
    return;
  }

  const selectedName = document.getElementById(target.object.name);
  const selectedItem = selectedName ? selectedName.closest("li") : null;
  if (selectedItem) {
    selectedItem.remove();
  }
  
  const parent = findObjectByName(target.object.parent.name, root);
  selectedObject = parent;
  refreshProperties(selectedObject, canvas);
  
  target.object.parent.objects.delete(target.object.name);

  const parentNameElement = document.getElementById(parent.name);
  if (parentNameElement) {
    parentNameElement.classList.add("outset");
    const parentItem = parentNameElement.closest("li");
    const childList = parentItem
        ? parentItem.querySelector(":scope > .nested")
        : null;
    if (childList && target.object.parent.objects.size === 0) {
      childList.remove();
      parentNameElement.classList.remove("caret");
      parentNameElement.classList.remove("caret-down");
    }
  }
});

function getUniqueLigamentName() {
  let index = 1;
  while (findObjectByName(`ligament${index}`, root)) {
    index += 1;
  }
  return `ligament${index}`;
}

function getSelectedTreeTarget() {
  if (selectedObject === null) {
    return null;
  }

  const nameElement = document.getElementById(selectedObject.name);
  if (!nameElement) {
    return null;
  }

  const item = nameElement.closest("li");
  if (!item) {
    return null;
  }

  let childList = item.querySelector(":scope > .nested");
  if (!childList) {
    childList = document.createElement("ul");
    childList.setAttribute("class", "nested active");
    item.appendChild(childList);
  }

  return { object: selectedObject, nameElement, childList };
}


/* Canvas stuff */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let scaleTrans = 1;
let mouseDown = false;
let cameraTrans = [0, 0];

canvas.onwheel = function (e) {
  scaleTrans -= e.deltaY * 0.001;
};

canvas.onmousedown = function () {
  mouseDown = true;
};

canvas.onmouseup = function () {
  mouseDown = false;
};

canvas.onmousemove = function (e) {
  if (mouseDown) {
    cameraTrans = [e.movementX * 2, e.movementY * 2];
  }
};

function updateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scaleTrans, scaleTrans);
  ctx.translate(cameraTrans[0], cameraTrans[1]);
  scaleTrans = 1;
  cameraTrans = [0, 0];
  root.draw(ctx);
  for (const [_, obj] of root.objects) {
    obj.draw(ctx, root.x, root.y);
  }
  setTimeout(updateCanvas, 1000 / 60);
}

updateCanvas();

root.addToList(tree);
