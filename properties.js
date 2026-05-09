import {MechanismLigament2d} from "./mech2d.js";

const properties = document.getElementById("properties");

export function refreshProperties(selectedObject, canvas) {
    // clear properties
    properties.innerHTML = "";
    
    // if mechanism is selected (selectedObject is null)
    if (!selectedObject) {
        const colorPicker = document.createElement("input");
        colorPicker.setAttribute("type", "color");
        colorPicker.setAttribute("value", "#000080");
        colorPicker.addEventListener("input", (e) => {
            canvas.setAttribute("style", "background: " + e.target.value);
        });

        const colorPickerLabel = document.createElement("label");
        colorPickerLabel.appendChild(document.createTextNode("Background Color "));
        colorPickerLabel.appendChild(colorPicker);
        properties.appendChild(colorPickerLabel);
    }
    else {
        const name = document.createElement("input");
        name.setAttribute("type", "text");
        name.setAttribute("value", selectedObject.name);
        name.addEventListener("change", (e) => {
            // reset input if the new name is empty
            if (e.target.value.trim() === "") {
                e.target.value = selectedObject.name;
            } else {
                const selectedName = document.getElementById(selectedObject.name);
                const selectedItem = selectedName ? selectedName.closest("span") : null;

                // rename object in parent's list
                selectedObject.parent.objects.delete(selectedObject.name);
                selectedObject.parent.objects.set(e.target.value, selectedObject);
                // actually rename the object
                selectedObject.name = e.target.value;
                selectedName.id = e.target.value;
                selectedItem.textContent = e.target.value;
            }
        })
        const nameLabel = document.createElement("label");
        nameLabel.appendChild(document.createTextNode("Name: "));
        nameLabel.appendChild(name);
        properties.appendChild(nameLabel);

        const xPos = document.createElement("input");
        xPos.setAttribute("type", "number");
        xPos.setAttribute("value", selectedObject.x);
        xPos.addEventListener("input", (e) => {
            selectedObject.x = e.target.value;
        });
        const xPosLabel = document.createElement("label");
        xPosLabel.appendChild(document.createTextNode("X Position "));
        xPosLabel.appendChild(xPos);
        properties.appendChild(xPosLabel);

        const yPos = document.createElement("input");
        yPos.setAttribute("type", "number");
        yPos.setAttribute("value", selectedObject.y);
        yPos.addEventListener("input", (e) => {
            selectedObject.y = e.target.value;
        });
        const yPosLabel = document.createElement("label");
        yPosLabel.appendChild(document.createTextNode("Y Position "));
        yPosLabel.appendChild(yPos);
        properties.appendChild(yPosLabel);
    }
    if (selectedObject instanceof MechanismLigament2d) {
        const angle = document.createElement("input");
        angle.setAttribute("type", "number");
        angle.setAttribute("value", selectedObject.angle);
        angle.addEventListener("input", (e) => {
            selectedObject.angle = e.target.value;
        });
        const angleLabel = document.createElement("label");
        angleLabel.appendChild(document.createTextNode("Angle "));
        angleLabel.appendChild(angle);
        properties.appendChild(angleLabel);

        const length = document.createElement("input");
        length.setAttribute("type", "number");
        length.setAttribute("value", selectedObject.length);
        length.addEventListener("input", (e) => {
            selectedObject.length = e.target.value;
        });
        const lengthLabel = document.createElement("label");
        lengthLabel.appendChild(document.createTextNode("Length "));
        lengthLabel.appendChild(length);
        properties.appendChild(lengthLabel);

        const lineWidth = document.createElement("input");
        lineWidth.setAttribute("type", "number");
        lineWidth.setAttribute("value", selectedObject.lineWidth);
        lineWidth.addEventListener("input", (e) => {
            if (e.target.value < 0) {
                e.target.value = 0;
            }
            selectedObject.lineWidth = e.target.value;
        });
        const lineWidthLabel = document.createElement("label");
        lineWidthLabel.appendChild(document.createTextNode("Line Width "));
        lineWidthLabel.appendChild(lineWidth);
        properties.appendChild(lineWidthLabel);

        const color = document.createElement("input");
        color.setAttribute("type", "color");
        color.setAttribute("value", selectedObject.color);
        color.addEventListener("input", (e) => {
            selectedObject.color = e.target.value;
        });
        const colorLabel = document.createElement("label");
        colorLabel.appendChild(document.createTextNode("Color "));
        colorLabel.appendChild(color);
        properties.appendChild(colorLabel);
    }
}