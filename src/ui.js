function round(value, precision=100) {
    return Math.round(value * precision) / precision
}

function DimensionInput(props) {
    return (<div class='dim-input'>
                    <label>{props.name} : </label>
                    <input class='dim-input-field' 
                           value={props.dimension} 
                           disabled={props.disabled} 
                           onChange={(e) => {props.onDimensionChange(e.target.value);}}></input>
                </div>)
}

function ToggleSwitch(props) {
    return (
        <div class='tog-switch'>
            <label>{props.name}</label>
            <input type='checkbox' onClick={props.onChange} checked={props.checked} disabled={props.disabled}/>
        </div>
    );
}

class Controls extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            length: props.length,
            width: props.width,
            thickness: props.thickness,
            continuity: props.continuity
        };
    }

    toFloat(dim, p) {
        var result = parseFloat(dim)
        if (isNaN(result)) {
            return this.props[p]
        } else {
            return result
        }
    }

    commit() {
        var vals = { ...this.state,
            width: this.toFloat(this.state.width, 'width'),
            length: this.toFloat(this.state.length, 'length'),
            thickness: this.toFloat(this.state.thickness, 'thickness')
        }
        this.setState(vals)
        this.props.onCommit(vals)
    }

    handleContinuityChange(e) {
        this.setState({ ...this.state, continuity: !this.state.continuity })
    }

    handleChange(dimension, what) {
        var newState = this.state
        newState[what] = dimension
        this.setState(newState);
    }

    render() {
        return (
            <div class='controls'>
                <fieldset class='dim-input'>
                    <DimensionInput  name='Length'
                                     dimension={this.state.length}
                                     onDimensionChange={(dim) => { this.handleChange(dim, 'length') }}/>
                    <DimensionInput  name='Width'
                                     dimension={this.state.width}
                                     onDimensionChange={(dim) => { this.handleChange(dim, 'width') }}/>
                    <DimensionInput  name='Thickness'
                                     dimension={this.state.thickness}
                                     onDimensionChange={(dim) => { this.handleChange(dim, 'thickness') }}/>
                </fieldset>
                <div class='point-controls'>
                    <label>Point</label>
                    <DimensionInput  name='X'
                                     dimension={this.state.x}
                                     onDimensionChange={(dim) => { this.handleChange(dim, 'x') }}
                                     disabled={!this.state.pointSelected}/>
                    <DimensionInput  name='Y'
                                     dimension={this.state.y}
                                     onDimensionChange={(dim) => { this.handleChange(dim, 'y') }}
                                     disabled={!this.state.pointSelected}/>
                    <ToggleSwitch name='Continuity' 
                                  onChange={(e)  => {this.handleContinuityChange(e)}} 
                                  checked={this.state.continuity}
                                  disabled={this.state.pointSelected != 2}/>
                </div>
                <button class='commit-btn' onClick={() => {this.commit()}}>Commit</button>
                <button class='commit-btn' onClick={() => {this.props.setProfile('z')}}>Top</button>
                <button class='commit-btn' onClick={() => {this.props.setProfile('y')}}>Side</button>
                <button class='commit-btn' onClick={() => {this.props.setProfile('x')}}>Section</button>
                <button class='commit-btn' onClick={() => {this.props.setProfile('x0')}}>Rear Section</button>
            </div>
        );
    }
}

class CvsRedactor {
    dragok = false;
    padding = 40;
    axis = 'z';
    rescaling = 0;
    currentPoint;
    startX;
    startY;
    rescaling;
    points;

    constructor(board, profile = 'z') {
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
        this.height = Math.floor(this.width * 0.33);
        this.canvas.height = this.height;
        this.canvas.width = this.width;
        this.padding = Math.floor(actual.height / 10);
        this.offsetX = actual.left;
        this.offsetY = actual.top;
        this.setRescaling(profile)
        this.points = this.getPoints(profile);
        this.render();
        this.renderControls();
    }



    reconstruct(board) {
        this.board = board;
        this.initialize(this.profile);
    }



    onCommit(state) {
        var newBoard = { ...this.board };
        newBoard.width = state.width;
        newBoard.length = state.length;
        newBoard.thickness = state.thickness;
        if (this.currentPoint) {
            this.points[this.currentPoint].continuity = state.continuity;
        }
        this.board = newBoard;
        this.initialize(this.profile);
    }

    setPointControls(i) {
        this.currentPoint = i;
        if (i == -1) {
            this.controls.setState({...this.controls.state, 
                                    x: '', 
                                    y: '', 
                                    continuity: false,
                                    pointSelected: false});
        } else {
            const [x, y] = this.from(this.points[i].pair);this.points[i].hasContinuity 
            this.controls.setState({...this.controls.state, 
                                    x: round(x), 
                                    y: round(y), 
                                    continuity: this.points[i].continuity,
                                    pointSelected: this.points[i].hasContinuity});
        }
    }

    renderControls() {
        this.controls = ReactDOM.render(
            <Controls width={rBoard.width.toString()} 
                      length={rBoard.length.toString()} 
                      thickness={rBoard.thickness.toString()}
                      pointSelected={false}
                      continuity={true}
                      onCommit={(state) => {this.onCommit(state)}}
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

        this.dragok = false;
        for (var i = 0; i < this.points.length; i++) {
            var p = this.points[i];
            var dx = p.x - mx;
            var dy = p.y - my;
            if (dx * dx + dy * dy < p.r * p.r) {
                this.dragok = true;
                this.setPointControls(i);
                p.isDragging = true;
                if (p.number > 0) {
                    this.points[(i - 1 > 0) ? i - 1 : i].isDragging = true;
                    this.points[(i + 1 < this.points.length) ? i + 1 : i].isDragging = true;
                }
                break;
            }
        }
        if (!this.dragok) {
            this.setPointControls(-1);
        }
        this.startX = mx;
        this.startY = my;
        this.render();
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
                    this.setPointControls(i)
                }
            }

            this.render();

            this.startX = mx;
            this.startY = my;

        }
    }

}

class Point {
    isDragging = false;
    children = [];
    freedom = [1, 1];
    number = null;
    continuity = false;
    r = 6;


    constructor(x, y, freedomX, freedomY, number) {
        this.x = x;
        this.y = y;
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

    get hasContinuity() {
        return 2;
    }

    plot(ctx, selected = false) {
        if (this.number < 0) {
            ctx.fillStyle = "#A0A0A0";
        } else {
            ctx.fillStyle = "#444444";
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        if (selected) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
        }
    }

    update(dx, dy) {
        this.x += dx * this.freedom[0]
        this.y += dy * this.freedom[1]
    }
}