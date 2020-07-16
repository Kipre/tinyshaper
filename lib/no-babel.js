import * as THREE from './three.module.js';
import { OBJLoader } from './OBJLoader.js';


const configs = {
    padding: 0.1,
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
    r = configs.pointRadius;

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
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
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

class Redactor {

    constructor(container, board) {
        this.container = container;
        this.board = board;
        window.addEventListener('resize', () => { this.resize() });
        this.initialize();
    }

    initialize() {

        this.container.textContent = ''; // not mandatory

        let actual = this.container.getBoundingClientRect();

        this.z = new Canvas(this.board, 'z', this.container,
            [this.board.length, this.board.width],
            'board-canvas');
        this.y = new Canvas(this.board, 'y', this.container,
            [this.board.length, this.board.thickness],
            'board-canvas');

        this.doubleView = document.createElement("div");
        this.doubleView.classList.add("double-view-container");
        this.container.appendChild(this.doubleView);
        this.x = new Canvas(this.board, 'x', this.doubleView,
            [this.board.width, this.board.thickness],
            'double-board-canvas');
        this.x0 = new Canvas(this.board, 'x0', this.doubleView,
            [this.board.x0Width(), this.board.x0Thickness()],
            'double-board-canvas');
        this.resize();
    }

    resize() {

        let actual = this.container.getBoundingClientRect();
        let doubleViewBounds = this.doubleView.getBoundingClientRect();

        let newHeight = actual.height / 3 - 3;

        this.z.initialize([actual.width, newHeight]);

        this.y.initialize([actual.width, newHeight]);

        this.x.initialize([actual.width / 2, newHeight]);
        this.x0.initialize([actual.width / 2, newHeight]);

    }


}

class Canvas {
    isDragging = false;
    currentPoint;

    constructor(board, profile, parent, scales, className = null, dims = null) {
        [this.xFactor, this.yFactor] = scales;
        this.board = board;
        this.profile = profile;
        this.canvas = document.createElement("canvas");
        this.canvas.className = (className) ? className : 'no-class';
        parent.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");

        // events
        this.canvas.onmousedown = (e) => this.onDown(e);
        this.canvas.onmouseup = (e) => this.onUp(e);
        this.canvas.onmousemove = (e) => this.onMove(e);

        // initialization
        if (dims != null) {
            this.initialize(dims);
        }
    }


    initialize(dims) {
        [this.width, this.height] = dims;
        this.canvas.height = this.height;
        this.canvas.width = this.width;
        this.rescaling = Math.min((this.width * (1 - configs.padding * 2)) / this.xFactor, (this.height * (1 - configs.padding * 2)) / this.yFactor)
        this.offsetY = (this.height - this.rescaling * this.yFactor) / 2;
        this.offsetX = (this.width - this.rescaling * this.xFactor) / 2;
        this.points = this.getPoints(this.profile);
        this.render();
    }

    getPoints(profile) {
        var pointsArray = this.board.board[profile];
        pointsArray = pointsArray.map((p, i) => {
            var j = p.slice();
            [j[0], j[1]] = this.to([j[0], j[1]]);
            if (j[4] >= 0) {
                return new ParentPoint(...j);
            } else {
                return new ChildPoint(...j)
            }

        })
        for (var i = 0; i < pointsArray.length; i++) { // double loop not optimal
            if (pointsArray[(i - 1 >= 0) ? i - 1 : 0].number == -2) {
                pointsArray[i].before = pointsArray[i - 1];
                pointsArray[i].before.parent = pointsArray[i];
            }
            if (pointsArray[(i + 1 < pointsArray.length) ? i + 1 : i - 1].number == -1) {
                pointsArray[i].after = pointsArray[i + 1];
                pointsArray[i].after.parent = pointsArray[i];
            }
            if (pointsArray[i].before && pointsArray[i].after) {
                pointsArray[i].before.sibling = pointsArray[i].after
                pointsArray[i].after.sibling = pointsArray[i].before
            }
        }
        return pointsArray;
    }

    returnPoints() {
        return this.points.map((p, i) => {
            var j = p.dest;
            [j[0], j[1]] = this.from([j[0], j[1]]);
            return j
        })
    }

    to([x, y]) {
        y *= this.yFactor
        y *= -this.rescaling
        y += this.height - this.offsetY
        x *= this.xFactor
        x *= this.rescaling
        x += this.offsetX
        return [x, y]
    }

    from([x, y]) {
        y -= this.height - this.offsetY
        y /= -this.rescaling
        y /= this.yFactor
        x -= this.offsetX
        x /= this.rescaling
        x /= this.xFactor
        return [x, y]
    }

    drawProfile() {
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = "rgba(45, 252, 194, 0.3)";
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath()
        this.ctx.moveTo(...this.points[0].pair);
        for (var i = 1; i < this.points.length; i += 3) {
            if (this.points[i].number > 0) {
                this.ctx.lineTo(...this.points[i].pair);
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
        this.ctx.strokeStyle = 'black';
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
            this.points[i].plot(this.ctx, (i == this.currentPoint))
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

        this.isDragging = false;
        for (var i = 0; i < this.points.length; i++) {
            var p = this.points[i];
            var dx = p.x - mx;
            var dy = p.y - my;
            if (dx * dx + dy * dy < p.r * p.r) {
                this.isDragging = true;
                // // this.setPointControls(i);
                p.isDragging = true;
                break;
            }
        }
        if (!this.isDragging) {
            // this.setPointControls(-1);
        }
        this.startX = mx;
        this.startY = my;
        this.render();
    }

    onUp(e) {
        e.preventDefault();
        e.stopPropagation();

        this.isDragging = false;
        for (var i = 0; i < this.points.length; i++) {
            this.points[i].isDragging = false;
        }
    }

    onMove(e) {
        var mx = parseInt(e.clientX - this.offsetX);
        var my = parseInt(e.clientY - this.offsetY);
        if (this.isDragging) {

            e.preventDefault();
            e.stopPropagation();

            var dx = mx - this.startX;
            var dy = my - this.startY;

            for (var i = 0; i < this.points.length; i++) {
                var p = this.points[i];
                if (p.isDragging) {
                    p.update(dx, dy)
                    // this.setPointControls(i)
                }
            }

            this.render();

            this.startX = mx;
            this.startY = my;

        }
    }
}

class ThreeDView {

    camera;
    scene;
    renderer;
    mouseX = 0;
    mouseY = 0;
    object;


    constructor(container, board) {
        this.container = container;
        this.board = board
    }

    initialize() {


        this.container.textContent = ''; // not mandatory

        var windowHalfX = this.container.innerWidth / 2;
        var windowHalfY = this.container.innerHeight / 2;

        this.camera = new THREE.PerspectiveCamera(45, this.container.innerWidth / this.container.innerHeight, 1, 2000);
        this.camera.position.z = 100;

        // scene

        this.scene = new THREE.Scene();

        var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
        this.scene.add(ambientLight);

        var pointLight = new THREE.PointLight(0xffffff, 0.8);
        this.camera.add(pointLight);
        this.scene.add(this.camera);

        // manager

        function loadModel() {

            //                  object.traverse( function ( child ) {

            //                      if ( child.isMesh ) child.material.map = texture;

            //                  } );

            this.object.position.z = -100;
            this.object.children[0].geometry.computeFaceNormals();
            this.object.children[0].geometry.computeVertexNormals();
            this.object.children[0].material.side = THREE.DoubleSide;
            this.scene.add(this.object);

        }

        var manager = new THREE.LoadingManager(loadModel);

        manager.onProgress = function(item, loaded, total) {

            console.log(item, loaded, total);

        };
        // model

        var loader = new OBJLoader(manager);

        this.object = loader.parse(this.board.getOBJ())
        loadModel();

        //Apply 


        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);

        document.addEventListener('mousemove', onDocumentMouseMove, false);

        //

        window.addEventListener('resize', onWindowResize, false);

    }

    onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

    }

    onDocumentMouseMove(event) {

        this.mouseX = (event.clientX - windowHalfX) / 2;
        this.mouseY = (event.clientY - windowHalfY) / 2;

    }

    animate() {

        requestAnimationFrame(animate);
        render();

    }

    render() {

        this.camera.position.x += (this.mouseX - this.camera.position.x) * .05;
        this.camera.position.y += (-this.mouseY - this.camera.position.y) * .05;

        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);

    }

}



var board = JSON.parse('{"y":[[0,1.2899999999999996,0,1,7],[0.22,1.1499999999999995,1,1,-1],[0.32999999999999996,0.9000000000000005,1,1,-2],[0.5,1.0000000000000004,0,0,6],[0.79,1.0700000000000005,1,1,-1],[0.94,1.1811111111111112,1,1,-2],[1,1.8711111111111112,0,1,5],[1,1.6700000000000002,0,1,3],[0.95,0.5900000000000001,1,1,-1],[0.78,0.1,1,1,-2],[0.5,0,0,0,4],[0.2,0.24,1,1,-1],[0.13,0.6258333333333338,1,1,-2],[0,0.9758333333333338,0,1,0]],"x":[[0,1.0000000000000004,0,0,6],[0.4866666666666667,0.9747222222222227,1,1,-1],[0.8322222222222223,0.7276851851851853,1,1,-2],[0.9088888888888889,0.6194444444444446,1,1,8],[0.9677777777777777,0.5491203703703705,1,1,-1],[0.9999999999999999,0.3858796296296297,1,1,-2],[0.9999999999999999,0.24263888888888893,0,1,2],[0.9977777777777777,0.10361111111111113,1,1,-1],[0.98,0.025601851851851924,1,1,-2],[0.9533333333333335,-0.04472222222222234,1,1,9],[0.8433333333333334,-0.04472222222222234,1,1,-1],[0.37,0,1,1,-2],[0,0,0,0,4]],"x0":[[0,1,0,0,10],[0.37,1,1,1,-1],[0.8377777777777778,0.8659259259259259,1,1,-2],[0.92,0.6900925925925926,1,1,11],[0.9877777777777778,0.5579629629629631,1,1,-1],[1,0.38999999999999996,1,1,-2],[1,0.23000000000000004,0,1,1],[1,0.13000000000000003,1,1,-1],[1.0022222222222221,0.07842592592592605,1,1,-2],[0.9988888888888888,0,1,1,12],[0.7988888888888888,0,1,1,-1],[0.18,0,1,1,-2],[0,0,0,0,13]],"z":[[0,0,0,0,0],[0,0.21673992673992679,1,1,-1],[0.026666666666666672,0.36978021978021974,1,1,-2],[0.06,0.4925274725274724,1,1,1],[0.10222222222222223,0.6610622710622709,1,1,-1],[0.2811111111111111,1.0183150183150182,1,1,-2],[0.5,0.9999999999999999,1,0,2],[0.7433333333333333,0.9725274725274724,1,1,-1],[0.9733333333333334,0.717985347985348,1,1,-2],[1,0,0,0,3]],"length":225,"width":27.3,"thickness":7.2}');

var rBoard = new Board(board);

var container = document.getElementById('canvases');


var redactor = new Redactor(container,rBoard);
var threeDView = new ThreeDView(container,rBoard)

  var checkbox = document.getElementById('toggle-3d');

  checkbox.addEventListener('change', function () {
    if (checkbox.checked) {
      threeDView.initialize();
    } else {
      redactor.initialize();
    }
  });