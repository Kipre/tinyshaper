
const configs = {
    boardPadding: 40,
    boardFillColor: "rgba(45, 252, 194, 0.3)",
    boardStrokeColor: "black",
    parentPointFillColor: "#444444",
    childPointFillColor: "#A0A0A0",
    highlightStrokeColor: 'red',
    highlightStrokeWidth: 2,
    pointStrokeColor: 'black',
    pointStrokeWidth: 1,
    pointRadius: 6
}


class Point {
    isDragging = false;
    freedom = [1, 1];
    number = null;

    constructor(x, y, freedomX, freedomY, number) {
        this.x = x;
        this.y = y;
        this.freedom = [freedomX, freedomY]
        this.number = number
    }

    get dest() {
        return [this.x, this.y, ...this.freedom, this.number]
    }

    get pair() {
        return [this.x, this.y]
    }

    get hasContinuity() {
        return 2;
    }

    plot(ctx, selected = false) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, configs.pointRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        if (selected) {
            ctx.strokeStyle = configs.highlightStrokeColor;
            ctx.lineWidth = configs.highlightStrokeWidth;
            ctx.stroke();
            ctx.strokeStyle = configs.pointStrokeColor;
            ctx.lineWidth = configs.pointStrokeWidth;
        }
    }

    update(dx, dy) {
        dx = dx * this.freedom[0]
        dy = dy * this.freedom[1]
        this.x += dx
        this.y += dy
    }
}

class ParentPoint extends Point {

    continuity = false;
    before = null;
    after = null;


    update(dx, dy) {
        dx = dx * this.freedom[0]
        dy = dy * this.freedom[1]
        if (this.before) {
            this.before.update(dx, dy, false)
        }
        if (this.after) {
            this.after.update(dx, dy, false)
        }
        this.x += dx
        this.y += dy
    }

    plot(ctx, selected = false) {
        ctx.fillStyle = configs.parentPointFillColor;
        super.plot(ctx, selected)
    }
}

class ChildPoint extends Point {
    parent = null;
    sibling = null;

    move(alpha) {
        const [rX, rY] = [this.x - this.parent.x, this.y - this.parent.y]
        const norm = Math.sqrt(rX * rX + rY * rY)
        this.x = norm * Math.cos(alpha) + this.parent.x
        this.y = norm * Math.sin(alpha) + this.parent.y
    }

    update(dx, dy, propagate = true) {
        dx = dx * this.freedom[0]
        dy = dy * this.freedom[1]
        if (this.parent.continuity && this.sibling && propagate) {
            const [rX, rY] = [this.x - this.parent.x, this.y - this.parent.y]
            const [nX, nY] = [rX + dx, rY + dy]
            const alpha = Math.atan(nY / nX)
            this.sibling.move(alpha + (nX >= 0) * Math.PI)
        }
        this.x += dx
        this.y += dy
    }

    plot(ctx, selected = false) {
        ctx.fillStyle = configs.childPointFillColor;
        super.plot(ctx, selected)
    }
}

class Canvas {
    isDragging = false;
    currentPoint;

    constructor(projection) {

    }
}




class BaseEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            length: props.length,
            width: props.width,
            thickness: props.thickness,
            continuity: props.continuity
        };
    }

    render() {
        return (
            <canvas class='controls'/>
        );
    }
}