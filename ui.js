class DimForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({
            value: event.target.value
        });
    }

    render() {
        return (React.createElement("label", null, `${this.props.name}:`, React.createElement("input", {
            type: "text",
            value: this.state.value,
            onChange: this.handleChange
        })));

    }
}

class DimsForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            length: props.length
        };
    }

    handleChange(event) {
        console.log(event);
        this.setState({
            length: event.target.length
        });
    }

    render() {
        return (React.createElement("div", { onChange: this.handleChange }, React.createElement(DimForm, {
            name: 'Length',
            value: this.state.length
        })));

    }
}


class Point {
    isDragging = false;
    children = [];
    freedom = [1, 1];
    number = null;
    r = 5;


    constructor(x, y, freedomX, freedomY, number) {
        this.x = x;
        this.y = y;
        //         this.rang = rang
        this.freedom = [freedomX, freedomY]
        this.number = number
    }

    dest() {
        var out = from([this.x, this.y]);
        return [...out, ...this.freedom, this.number]
    }

    get pair() {
        return [this.x, this.y]
    }

    plot(ctx) {
        if (this.number < 0) {
            ctx.fillStyle = "#A0A0A0";
        } else {
            ctx.fillStyle = "#444444";
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update(dx, dy) {
        this.x += dx * this.freedom[0]
        this.y += dy * this.freedom[1]
    }
}


class CvsRedactor {
    dragok = false;
    padding = 40;
    axis = 'z';
    rescaling = 0;
    startX;
    startY;
    rescaling;
    points;

    constructor(board, profile='x') {
        this.board = board
        this.profile = profile
        this.canvas = document.getElementById("canvas1");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.onmousedown = (e) => this.onDown(e);
        this.canvas.onmouseup = (e) => this.onUp(e);
        this.canvas.onmousemove = (e) => this.onMove(e);
        window.addEventListener('resize', () => { this.initialize(this.profile) });
        this.initialize(profile);
    }

    initialize(profile) {
        this.profile = profile
        let actual = this.canvas.getBoundingClientRect();
        this.width = Math.floor(actual.width);
        this.height = Math.floor(this.width*0.33);
        console.log(this.width, this.height)
        this.canvas.height = this.height
        this.canvas.width = this.width
        this.padding = Math.floor(actual.height/10);
        this.offsetX = actual.left;
        this.offsetY = actual.top;
        this.setRescaling(profile)
        this.points = this.getPoints(profile);
        this.render()
    }

    setRescaling(profile) {
        switch (profile) {
            case 'x':
                this.xFactor = board.width;
                this.yFactor = board.thickness;
                break;
            case 'x0':
                this.xFactor = board.x0Wwidth();
                this.yFactor = board.x0Thickness();
                break;
            case 'y':
                this.xFactor = board.length;
                this.yFactor = board.thickness;
                break;
            case 'z':
                this.xFactor = board.length;
                this.yFactor = board.width;
                break;
            default:
                throw new Error('Profile not understood');
        }
        this.rescaling = Math.max(this.xFactor / this.width, this.yFactor / this.height)
        this.rescaling = 0.9 / this.rescaling

    }
    
    getPoints(profile) {
    var pointsArray = this.board[profile].points.map((p) => p.fullDest);
    return pointsArray.map((p, i) => {
        var j = p.slice();
        [j[0], j[1]] = this.to([j[0], j[1]]);
        return new Point(...j);
        })
    }

    to([x, y]) {
        y *= this.yFactor
        y *= -this.rescaling
        y += this.height - this.padding
        x *= this.xFactor
        x *= this.rescaling
        x += this.padding
        return [x, y]
    }

    drawProfile() {
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = "rgba(45, 252, 194, 0.3)";
        this.ctx.beginPath()
        this.ctx.moveTo(...this.points[0].pair);
        for (var i = 1; i < this.points.length; i += 3) {
            if (this.points[i].number > 0) {
                this.ctx.lineTo(...points[i].pair);
                i -= 2
            } else {
                this.ctx.bezierCurveTo(...this.points[i].pair, ...this.points[i + 1].pair, ...this.points[i + 2].pair);
            }
        }
        this.ctx.closePath()
        this.ctx.fill()
        this.ctx.stroke()
    }


    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    render() {
        this.clear();
        this.drawProfile();
        this.drawPoints();
    }

    drawPoints() {
        this.ctx.lineWidth = 1;
        for (var i = 0; i < this.points.length; i++) {
            if (this.points[i].number == -1) {
                this.ctx.beginPath();
                this.ctx.moveTo(...this.points[i - 1].pair);
                this.ctx.lineTo(...this.points[i].pair);
                this.ctx.stroke();
            } else if (this.points[i].number == -2) {
                this.ctx.beginPath();
                this.ctx.moveTo(...this.points[i + 1].pair);
                this.ctx.lineTo(...this.points[i].pair);
                this.ctx.stroke();
            }
            this.points[i].plot(this.ctx)
        }
    }

    onDown(e) {
        
        let actual = this.canvas.getBoundingClientRect();
        this.offsetX = actual.left;
        this.offsetY = actual.top;

        e.preventDefault();
        e.stopPropagation();

        var mx = parseInt(e.clientX - this.offsetX);
        var my = parseInt(e.clientY - this.offsetY);

        this.dragok = false;
        for (var i = 0; i < this.points.length; i++) {
            var p = this.points[i];
            var dx = p.x - mx;
            var dy = p.y - my;
            if (dx * dx + dy * dy < p.r * p.r) {
                this.dragok = true;
                p.isDragging = true;
                if (p.number > 0) {
                    this.points[(i - 1 > 0) ? i - 1 : i].isDragging = true;
                    this.points[(i + 1 < this.points.length) ? i + 1 : i].isDragging = true;
                }
            }
        }
        this.startX = mx;
        this.startY = my;
    }

    onUp(e) {
       e.preventDefault();
        e.stopPropagation();

        this.dragok = false;
        for (var i = 0; i < this.points.length; i++) {
            this.points[i].isDragging = false;
        }
    }

    onMove(e) {
        // if we're dragging anything.
        var mx = parseInt(e.clientX - this.offsetX);
        var my = parseInt(e.clientY - this.offsetY);
        if (this.dragok) {

            e.preventDefault();
            e.stopPropagation();

            var dx = mx - this.startX;
            var dy = my - this.startY;

            for (var i = 0; i < this.points.length; i++) {
                var p = this.points[i];
                if (p.isDragging) {
                    p.update(dx, dy)
                }
            }

            this.render();

            this.startX = mx;
            this.startY = my;

        }
    }

}

// function commit() {
//     var arr = pointsToBoard(points);
//     board[name] = arr;
//     var output = document.getElementById("json_output");
//     output.innerHTML = JSON.stringify(board);
// }

// function changeAxis(name) {
//     if (name == 'x0') {
//         axis = 'x';
//     } else {
//         axis = name;
//     }
//     initialize(axis, name);
// }


// function pointsToBoard(points) {
//     var result = [];
//     for (var i = 0; i < points.length; i++) {
//         result.push(points[i].dest())
//     }
//     return result
// }

// function get2D(axis, point) {
//     var [x, y, z] = point
//     if (axis == 'x') {
//         return [y, z]
//     } else if (axis == 'y') {
//         return [x, z]
//     } else if (axis == 'z') {
//         return [x, y]
//     }
// }



// function round(value, precision = 100) {
//     return Math.round(value * precision) / precision
// }

// function to([x, y]) {
//     if (axis !== null) {
//         y *= y_factor
//         y *= -rescaling
//         y += HEIGHT - padding
//         x *= x_factor
//         x *= rescaling
//         x += padding
//         return [x, y]
//     } else {
//         throw "axis not initialized";
//     }
// }

// function from([x, y]) {
//     if (axis !== null) {
//         y -= HEIGHT - padding
//         y /= -rescaling
//         y /= y_factor
//         x -= padding
//         x /= rescaling
//         x /= x_factor
//         return [x, y]
//     } else {
//         throw "axis not initialized";
//     }
// }



