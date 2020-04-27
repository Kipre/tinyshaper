var WIDTH = 1000;
var HEIGHT = 300;


var background = document.getElementById("canvas-background");
background.width = WIDTH;
background.height = HEIGHT;
var bCtx = background.getContext("2d");


var canvas = document.getElementById("canvas1");
canvas.width = WIDTH;
canvas.height = HEIGHT;
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;
canvas.onmousemove = myMove;

var ctx = canvas.getContext("2d");
var BB = canvas.getBoundingClientRect();
var offsetX = BB.left;
var offsetY = BB.top;



// drag related variables
var dragok = false;
var startX;
var startY;
var rescaling;
var padding = 40
var points;

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

    get pair () {
        return [this.x, this.y]
    }

    plot() {
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

var board = JSON.parse('{"y": [[0.0, 1.2899999999999996, 0, 1, 7],[0.22, 1.1499999999999995, 1, 1, -1],[0.32999999999999996, 0.9000000000000005, 1, 1, -2],[0.5, 1.0000000000000004, 0, 0, 6],[0.79, 1.0700000000000005, 1, 1, -1],[0.94, 1.1811111111111112, 1, 1, -2],[1.0, 1.8711111111111112, 0, 1, 5],[1.0, 1.6700000000000002, 0, 1, 3],[0.95, 0.5900000000000001, 1, 1, -1],[0.78, 0.1, 1, 1, -2],[0.5, 0.0, 0, 0, 4],[0.2, 0.24, 1, 1, -1],[0.13, 0.6258333333333338, 1, 1, -2],[0.0, 0.9758333333333338, 0, 1, 0]],"x": [[0.0, 1.0000000000000004, 0, 0, 6],[0.4866666666666667, 0.9747222222222227, 1, 1, -1],[0.8322222222222223, 0.7276851851851853, 1, 1, -2],[0.9088888888888889, 0.6194444444444446, 1, 1, 8],[0.9677777777777777, 0.5491203703703705, 1, 1, -1],[0.9999999999999999, 0.3858796296296297, 1, 1, -2],[0.9999999999999999, 0.24263888888888893, 0, 1, 2],[0.9977777777777777, 0.10361111111111113, 1, 1, -1],[0.98, 0.025601851851851924, 1, 1, -2],[0.9533333333333335, -0.04472222222222234, 1, 1, 9],[0.8433333333333334, -0.04472222222222234, 1, 1, -1],[0.37, 0.0, 1, 1, -2],[0.0, 0.0, 0, 0, 4]],"x0": [[0.0, 1.0, 0, 0, 10],[0.37, 1.0, 1, 1, -1],[0.52, 0.6468518518518518, 1, 1, -2],[0.55, 0.5468518518518518, 1, 1, 11],[0.5800000000000001, 0.45685185185185184, 1, 1, -1],[1.0, 0.39, 1, 1, -2],[1.0, 0.23, 1, 1, 1],[1.0, 0.13, 1, 1, -1],[0.6, 0.07, 1, 1, -2],[0.59, 0.0, 1, 1, 12],[0.38999999999999996, 0.0, 1, 1, -1],[0.18, 0.0, 1, 1, -2],[0.0, 0.0, 0, 0, 13]],"z": [[0.0, 0.0, 0, 0, 0],[0.0, 0.21673992673992679, 1, 1, -1],[0.026666666666666672, 0.36978021978021974, 1, 1, -2],[0.06, 0.4925274725274724, 1, 1, 1],[0.10222222222222223, 0.6610622710622709, 1, 1, -1],[0.2811111111111111, 1.0183150183150182, 1, 1, -2],[0.5, 0.9999999999999999, 0, 0, 2],[0.7433333333333333, 0.9725274725274724, 1, 1, -1],[0.9733333333333334, 0.717985347985348, 1, 1, -2],[1.0, 0.0, 0, 0, 3]],"length": 225,"width": 27.3,"thickness": 7.2,"cut_x0": 0.2,"cut_x": 0.5}');
var axis = 'z';
var rescaling = 0
var x_factor, y_factor;


var orders = {
    'z': [0, 1, 2, 3],
    'y': [7, 6, 5, 3, 4, 0],
    'x': [6, 8, 2, 9, 4],
    'x0': [10, 11, 1, 12, 13]
}
var currentOrder;

// call to draw the scene

initialize(axis);

function initialize(axis, name=null) {
    var name = name ? name : axis;
    drawCoordinates();
    [x_factor, y_factor] = get2D(axis, [board['length'], board['width'], board['thickness']])
    rescaling = Math.max(x_factor / WIDTH, y_factor / HEIGHT)
    rescaling = 0.9 / rescaling
    points = boardToPoints(name, board);
    draw();
}

function changeAxis(name) {
    if (name == 'x0') {
        axis = 'x';
    } else {
        axis = name
    }
    initialize(axis, name);
}

function boardToPoints(name, board) {
    var pointsArray = board[name];
    return pointsArray.map((p, i) => {
        var j = p.slice();
        [j[0], j[1]] = to([j[0], j[1]])
        return new Point(...j)
    })
}

function get2D(axis, point) {
    var [x, y, z] = point
    if (axis == 'x') {
        return [y, z]
    } else if (axis == 'y') {
        return [x, z]
    } else if (axis == 'z') {
        return [x, y]
    }
}

function drawProfile(points) {
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(45, 252, 194, 0.3)";
    ctx.beginPath()
    ctx.moveTo(...points[0].pair);
    for (var i = 1; i < points.length; i += 3) {
        if (points[i].number > 0) {
            ctx.lineTo(...points[i].pair);
            i -= 2
        } else {
            ctx.bezierCurveTo(...points[i].pair, ...points[i + 1].pair, ...points[i + 2].pair);
        }
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
}

function drawPoints(points) {
    ctx.lineWidth = 1;
    for (var i = 0; i < points.length; i++) {
        if (points[i].number == -1) {
            ctx.beginPath();
            ctx.moveTo(...points[i - 1].pair);
            ctx.lineTo(...points[i].pair);
            ctx.stroke();
        } else if (points[i].number == -2) {
            ctx.beginPath();
            ctx.moveTo(...points[i + 1].pair);
            ctx.lineTo(...points[i].pair);
            ctx.stroke();
        }
        points[i].plot()
    }
}

function round(value, precision=100) {
    return Math.round(value * precision) / precision
}

function to([x, y]) {
    if (axis !== null) {
        y *= y_factor
        y *= -rescaling
        y += HEIGHT - padding
        x *= x_factor
        x *= rescaling
        x += padding
        return [x, y]
    } else {
        throw "axis not initialized";
    }
}

function from([x, y]) {
    if (axis !== null) {
        y -= HEIGHT - padding
        y /= -rescaling
        y /= y_factor
        x -= padding
        x /= rescaling
        x /= x_factor
        return [x, y]
    } else {
        throw "axis not initialized";
    }
}

function drawCoordinates() {
    bCtx.lineWidth = 1;
    bCtx.beginPath();
    bCtx.moveTo(padding, 0);
    bCtx.lineTo(padding, HEIGHT - padding);
    bCtx.lineTo(WIDTH, HEIGHT - padding);
    bCtx.stroke();
    bCtx.lineWidth = 2;
}

function drawPosition(mx, my) {
    bCtx.clearRect(0.75 * WIDTH, 0, WIDTH, 0.20 * HEIGHT);
    bCtx.font = "15px Arial";
    var [p_x, p_y] = from([mx, my])
    bCtx.fillText(mx.toFixed(2).toString() + " " + my.toFixed(2).toString(), 0.85 * WIDTH, 0.20 * HEIGHT);
    bCtx.fillText(p_x.toFixed(2).toString() + " " + p_y.toFixed(2).toString(), 0.85 * WIDTH, 0.10 * HEIGHT);
}

// clear the canvas
function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

// redraw the scene
function draw() {
    clear();
    drawProfile(points);
    drawPoints(points);
}


// handle mousedown events
function myDown(e) {
    BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;

    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // get the current mouse position
    var mx = parseInt(e.clientX - offsetX);
    var my = parseInt(e.clientY - offsetY);

    // test each shape to see if mouse is inside
    dragok = false;
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var dx = p.x - mx;
        var dy = p.y - my;
        // test if the mouse is inside this circle
        if (dx * dx + dy * dy < p.r * p.r) {
            dragok = true;
            p.isDragging = true;
            if (p.number > 0) {
                points[(i - 1 > 0) ? i - 1 : i].isDragging = true;
                points[(i + 1 < points.length) ? i + 1 : i].isDragging = true;
            }
        }
        // decide if the shape is a rect or circle               

    }
    // save the current mouse position
    startX = mx;
    startY = my;
}


// handle mouseup events
function myUp(e) {
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // clear all the dragging flags
    dragok = false;
    for (var i = 0; i < points.length; i++) {
        points[i].isDragging = false;
    }
}


// handle mouse moves
function myMove(e) {
    // if we're dragging anything.
    var mx = parseInt(e.clientX - offsetX);
    var my = parseInt(e.clientY - offsetY);
    if (dragok) {

        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // get the current mouse position

        // calculate the distance the mouse has moved
        // since the last mousemove
        var dx = mx - startX;
        var dy = my - startY;

        // move each rect that isDragging 
        // by the distance the mouse has moved
        // since the last mousemove
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            if (p.isDragging) {
                p.update(dx, dy)
            }
        }

        // redraw the scene with the new rect positions
        draw();

        // reset the starting mouse position for the next mousemove
        startX = mx;
        startY = my;

    }
    drawPosition(mx, my)
}