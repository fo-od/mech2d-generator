class MechanismObject2d {
  constructor(name) {
    this.name = name;
    this.objects = new Map();
  }

  append(object) {
    this.objects.set(object.name, object);
  }

  addToList(list) {
    // create list item
    const item = document.createElement("li");

    // create name span for list item
    const name = document.createElement("span");
    if (this.objects.size > 0) {
      name.setAttribute("class", "caret");
    }
    name.appendChild(document.createTextNode(this.name));
    name.setAttribute("id", this.name);
    name.classList.add("name");

    // nested list
    if (this.objects.size > 0 || this.name === "root") {
      item.appendChild(name);
      const nested = document.createElement("ul");
      nested.setAttribute("class", "nested");
      for (const [_, obj] of this.objects) {
        obj.addToList(nested);
      }
      item.appendChild(nested);
    } else {
      item.appendChild(name);
    }

    list.appendChild(item);
  }
}

class MechanismRoot2d extends MechanismObject2d {
  constructor(name, x, y) {
    super(name);
    this.x = x;
    this.y = y;
  }

  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, 10, 10);
  }
}

class MechanismLigament2d extends MechanismObject2d {
  constructor(name, length, angle, lineWidth, color) {
    super(name);
    this.length = length;
    this.angle = angle;
    this.lineWidth = lineWidth;
    this.color = color;
  }

  _calculateEndPoint(angle) {
    const ex = this.length * Math.cos((angle * Math.PI) / 180);
    const ey = this.length * Math.sin((angle * Math.PI) / 180);
    return [ex, ey];
  }

  _draw(ox, oy, angle = this.angle) {
    const endPoint = this._calculateEndPoint(angle);

    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + endPoint[0], oy + endPoint[1]);
    ctx.closePath();
    ctx.stroke();
  }

  draw(ox, oy, angle = this.angle) {
    this._draw(ox, oy, angle);
    const endPoint = this._calculateEndPoint(angle);
    for (const [_, obj] of this.objects) {
      const ex = ox + endPoint[0];
      const ey = oy + endPoint[1];
      const angle = this.angle + obj.angle;
      obj.draw(ex, ey, angle);
    }
  }
}

// where it all starts
const root = new MechanismRoot2d("root", 250, 250);

/* Panel stuff */
const properties = document.getElementById("properties");

const bgColorPicker = document.querySelector("#bgcolor");
bgColorPicker.addEventListener("input", (e) => {
  canvas.setAttribute("style", "background: " + e.target.value);
});

// tree stuff
const tree = document.getElementById("mech-objects");
const treeRoot = document.getElementById("tree");
const contextMenu = document.getElementById("contextMenu");
const appendButton = document.getElementById("append");
const deleteButton = document.getElementById("delete");

var selectedObject = "";

function updateSelection(e) {
  // get the selected object in the tree
  const selectedName = e.target.closest(".name");

  // remove selected style from other elements
  const names = treeRoot.getElementsByClassName("name");
  for (const name of names) {
    name.classList.remove("outset");
  }

  // add selected style to element and update the selected object name
  selectedName.classList.add("outset");
  selectedObject = selectedName.getAttribute("id");
}

// hide context menu on click
document.onclick = function () {
  contextMenu.style.display = "none";
};

// show context menu on right click of an object in the tree
treeRoot.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  updateSelection(e);
  contextMenu.style.display = "block";
  contextMenu.style.left = e.pageX + "px";
  contextMenu.style.top = e.pageY + "px";
});

treeRoot.addEventListener("click", (e) => {
  updateSelection(e);

  if (e.button == 2) {
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

/* Canvas stuff */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
var scaleTrans = 1;
var mouseDown = false;
var cameraTrans = [0, 0];

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

function findObjectByName(name, node = root, parent = null) {
  if (node.name === name) {
    return { object: node, parent };
  }

  for (const [_, child] of node.objects) {
    const result = findObjectByName(name, child, node);
    if (result) {
      return result;
    }
  }

  return null;
}

function getSelectedObject() {
  if (selectedObject === "mech" || selectedObject === "") {
    return { object: root, parent: null };
  }

  return findObjectByName(selectedObject);
}

function getUniqueLigamentName() {
  let index = 1;
  while (findObjectByName(`ligament${index}`)) {
    index += 1;
  }
  return `ligament${index}`;
}

function getTreeNameByObjectName(name) {
  return name === "root" ? "mech" : name;
}

function getSelectedTreeTarget() {
  const target = getSelectedObject();
  if (!target) {
    return null;
  }

  if (selectedObject === "mech" || selectedObject === "") {
    return {
      ...target,
      nameElement: document.getElementById("mech"),
      childList: tree,
    };
  }

  const nameElement = document.getElementById(target.object.name);
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

  return { ...target, nameElement, childList };
}

appendButton.addEventListener("click", (e) => {
  e.stopPropagation();
  const target = getSelectedTreeTarget();
  if (!target) {
    return;
  }

  const ligament = new MechanismLigament2d(
    getUniqueLigamentName(),
    60,
    -90,
    10,
    "green",
  );
  target.object.append(ligament);
  contextMenu.style.display = "none";
  target.nameElement.classList.add("caret");
  ligament.addToList(target.childList);
});

deleteButton.addEventListener("click", (e) => {
  e.stopPropagation();
  const target = getSelectedTreeTarget();
  if (!target || !target.parent) {
    return;
  }

  const selectedName = document.getElementById(target.object.name);
  const selectedItem = selectedName ? selectedName.closest("li") : null;
  if (selectedItem) {
    selectedItem.remove();
  }

  target.parent.objects.delete(target.object.name);
  const parentTreeName = getTreeNameByObjectName(target.parent.name);
  selectedObject = parentTreeName;
  contextMenu.style.display = "none";

  const parentNameElement = document.getElementById(parentTreeName);
  if (parentNameElement) {
    parentNameElement.classList.add("outset");
    const parentItem = parentNameElement.closest("li");
    const childList = parentItem
      ? parentItem.querySelector(":scope > .nested")
      : null;
    if (childList && target.parent.objects.size === 0) {
      childList.remove();
      parentNameElement.classList.remove("caret");
      parentNameElement.classList.remove("caret-down");
    }
  }
});

function updateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scaleTrans, scaleTrans);
  ctx.translate(cameraTrans[0], cameraTrans[1]);
  scaleTrans = 1;
  cameraTrans = [0, 0];
  root.draw();
  for (const [_, obj] of root.objects) {
    obj.draw(root.x, root.y);
  }
  setTimeout(updateCanvas, 1000 / 60);
}

updateCanvas();

root.addToList(tree);
