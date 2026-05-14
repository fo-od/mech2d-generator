class MechanismObject2d {
    constructor(name) {
        this.name = name;
        this.parent = null;
        this.objects = new Map();
    }

    append(object) {
        object.parent = this;
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

export class MechanismRoot2d extends MechanismObject2d {
    constructor(name, x, y) {
        super(name);
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, 5, 5);
    }
}

export class MechanismLigament2d extends MechanismObject2d {
    constructor(name, length, angle, lineWidth, color) {
        super(name);
        this.x = 0;
        this.y = 0;
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

    _draw(ctx, ox, oy, angle = this.angle) {
        const startX = ox + Number(this.x);
        const startY = oy + Number(this.y);
        const endPoint = this._calculateEndPoint(Number(angle));

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + endPoint[0], startY + endPoint[1]);
        ctx.closePath();
        ctx.stroke();
    }

    draw(ctx, ox, oy, angle = this.angle) {
        const startX = ox + Number(this.x);
        const startY = oy + Number(this.y);
        const currentAngle = Number(angle);

        this._draw(ctx, ox, oy, currentAngle);

        const endPoint = this._calculateEndPoint(currentAngle);
        for (const [_, obj] of this.objects) {
            const ex = startX + endPoint[0];
            const ey = startY + endPoint[1];
            const childAngle = currentAngle + Number(obj.angle);
            obj.draw(ctx, ex, ey, childAngle);
        }
    }
}

export function findObjectByName(name, root) {
    if (root.name === name) {
        return root;
    }

    for (const [_, child] of root.objects) {
        const result = findObjectByName(name, child);
        if (result) {
            return result;
        }
    }

    return null;
}