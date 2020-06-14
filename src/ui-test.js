
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

class Canvas {
    isDragging = false;
    currentPoint;

    constructor(board, profile, parent) {
        this.board = board;
        this.profile = profile;
        this.parent = parent
        this.canvas = document.createElement("canvas");
        parent.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.canvas.onmousedown = (e) => this.onDown(e);
        this.canvas.onmouseup = (e) => this.onUp(e);
        this.canvas.onmousemove = (e) => this.onMove(e);
        window.addEventListener('resize', () => { this.initialize(profile) });
        this.initialize(profile);
    }


    initialize(profile) {
        this.profile = profile;
        let actual = this.parent.getBoundingClientRect();
        this.height = actual.height/3 - 1;
        this.width = actual.width;
        this.canvas.height = this.height;
        this.canvas.width = this.width;
        this.padding = Math.floor(actual.height / 10);
        this.offsetX = actual.left;
        this.offsetY = actual.top;
        this.setRescaling(profile)
        this.points = this.getPoints(profile);
        this.render();
    }
    
    onCommit(state) {
        var newBoard = { ...this.board.board };
        newBoard.width = state.width;
        newBoard.length = state.length;
        newBoard.thickness = state.thickness;
        newBoard[this.profile] = this.returnPoints()
        this.board.initialize(newBoard);
        this.initialize(this.profile);
        this.onBoardChange();
    }

    setPointControls(i) {
        // this.currentPoint = i;
        // if (i == -1) {
        //     this.controls.setState({...this.controls.state, 
        //                             x: '', 
        //                             y: '', 
        //                             continuity: false,
        //                             pointSelected: false});
        // } else {
        //     const [x, y] = this.from(this.points[i].pair);
        //     this.controls.setState({...this.controls.state, 
        //                             x: round(x), 
        //                             y: round(y), 
        //                             continuity: (this.points[i] instanceof ChildPoint) ? this.points[i].parent.continuity : this.points[i].continuity,
        //                             pointSelected: true});
        // }
    }

    renderControls() {
        this.controls = ReactDOM.render(
            <Controls width={rBoard.width.toString()} 
                      length={rBoard.length.toString()} 
                      thickness={rBoard.thickness.toString()}
                      pointSelected={false}
                      continuity={false}
                      onContinuity={() => {
                        if (this.points[this.currentPoint].parent) {
                            this.points[this.currentPoint].parent.continuity ^= true;
                            this.points[this.currentPoint].update(0, 0);
                        } else {
                            this.points[this.currentPoint].continuity ^= true;
                        }
                      }}
                      onCommit={(state) => {this.onCommit(state);}}
                      onSave={() => {this.onSave(this.board.nonNested());}}
                      setProfile={(profile) => {this.initialize(profile)}}/>,
            document.getElementById('controls')
        );
    }

    setRescaling(profile) {
        switch (profile) {
            case 'x':
                this.xFactor = this.board.width;
                this.yFactor = this.board.thickness;
                break;
            case 'x0':
                this.xFactor = this.board.x0Width();
                this.yFactor = this.board.x0Thickness();
                break;
            case 'y':
                this.xFactor = this.board.length;
                this.yFactor = this.board.thickness;
                break;
            case 'z':
                this.xFactor = this.board.length;
                this.yFactor = this.board.width;
                break;
            default:
                throw new Error('Profile not understood');
        }
        this.rescaling = Math.max(this.xFactor / this.width, this.yFactor / this.height)
        this.rescaling = 0.9 / this.rescaling

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
        for (var i=0; i<pointsArray.length; i++) {
            if (pointsArray[(i-1 >= 0) ? i-1 : 0].number == -2) {
                pointsArray[i].before = pointsArray[i-1];
                pointsArray[i].before.parent = pointsArray[i];
            }
            if (pointsArray[(i+1 < pointsArray.length) ? i+1 : i-1].number == -1) {
                pointsArray[i].after = pointsArray[i+1];
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
        y += this.height - this.padding
        x *= this.xFactor
        x *= this.rescaling
        x += this.padding
        return [x, y]
    }

    from([x, y]) {
        y -= this.height - this.padding
        y /= -this.rescaling
        y /= this.yFactor
        x -= this.padding
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
                this.setPointControls(i);
                p.isDragging = true;
                break;
            }
        }
        if (!this.isDragging) {
            this.setPointControls(-1);
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
                    this.setPointControls(i)
                }
            }

            this.render();

            this.startX = mx;
            this.startY = my;

        }
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