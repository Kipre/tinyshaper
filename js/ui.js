import {roots, siblingPosition} from './surf.js';

const config = {
    pointStrokeWidth: 1,
    selectRadius: 7,
    pointRadius: 4,
    floatPrecision: 2,
    padding: 20,
}

const state = {
    profile: 'z',
    pivoted: false
}

export function setup(board, logicBoard) {

    const profiles = {
        'z': {
            width: board.length,
            height: board.width,
        },
        'y': {
            width: board.length,
            height: board.width,
        },
        'x': {
            width: board.width,
            height: board.thickness,
        },
        'x0': {
            height: (roots(board.yDown, {
                x: board.z[3].x
            })[0] - roots(board.yUp, {
                x: board.z[3].x
            })[0]) * board.thickness,
            width: board.z[3].y * board.width
        }
    }

    document.getElementById('dims-control').setDims(board);

    const {width, height} = profiles[state.profile];
    const points = board[state.profile];
    let scaledPoints;

    let xScale, yScale;

    const svg = d3.select("#vis")
    .call(svg=>svg
        .append("path")
        .attr("class", "u-path"));

    const bottomAxis = svg.append('g');
    const leftAxis = svg.append('g');
    let scale = ({x, y})=>({x, y})
    , unscale = scale;

    draggable();

    function updateViewport() {
        const {clientWidth, clientHeight} = svg.node();
        const {padding} = config;
        // if (clientWidth > clientHeight) {
            [state.pivoted, xScale] = [false, clientWidth - 2*padding];
        // } else {
        // [state.pivoted, xScale] = [true, clientHeight];
        // }
        yScale = xScale * (height / width);
        const half = clientHeight / 2

        // bottomAxis.attr("transform", `translate(0, ${yScale * 1.1})`).call(d3.axisBottom(d3.scaleLinear().range([0, xScale]).domain([0, length])).ticks())
        scale = ({x, y})=>({
            x: x * xScale + padding,
            y: y * yScale + half
        });
        unscale = ({x, y})=>({
            x: (x - padding) / xScale,
            y: (y - half) / yScale
        });
        update();
    }


    function update() {
        scaledPoints = points.map(scale);
        const quads = Array.from({
            length: (points.length - 1) / 3
        }, (_,i)=>i * 3).map(i=>scaledPoints.slice(i, i + 4));

        const path = d3.path();
        const [{x, y}] = scaledPoints;
        path.moveTo(x, y);
        quads.forEach(([,{x: cp1x, y: cp1y},{x: cp2x, y: cp2y},{x, y}])=>path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y));

        svg.select(".u-path").attr("d", path);

        svg.selectAll(".u-point")
        .data(scaledPoints)
        .join(enter=>enter
            .append("g")
            .classed("u-point", true)
            .call(g=>g
                .append("circle")
                .attr("r", config.pointRadius)))
        .attr("transform", ({x, y})=>`translate(${[x, y]})`);

        svg.selectAll(".u-line").data(quads.flatMap(([from,to,from1,to1])=>[{
            from,
            to
        }, {
            from: from1,
            to: to1
        }])).join("line").attr("x1", ({from})=>from.x).attr("y1", ({from})=>from.y).attr("x2", ({to})=>to.x).attr("y2", ({to})=>to.y).classed("u-line", true);
    }

    function draggable() {
        updateViewport();

        function dragSubject(event) {
            const [px, py] = d3.pointer(event.sourceEvent, svg.node());
            const dist = m=>Math.sqrt((px - m.x) ** 2 + (py - m.y) ** 2)
            const idx = d3.minIndex(scaledPoints, dist);
            if (dist(scaledPoints[idx]) > config.selectRadius) {
                svg.style("cursor", null);
                return null;
            }
            svg.style("cursor", "hand").style("cursor", "grab");
            const {continuous, freezeX, freezeY} = points[idx];
            const move = (point, dx, dy) => {
                point.x += (dx / xScale) * !freezeX;
                point.y += (dy / yScale) * !freezeY;
            }
            let direction, sibling;
            if (continuous !== undefined) {
                return (dx, dy) => {
                    for (let i=-1; i <= 1; i++) {
                        move(points[idx + i], dx, dy);
                    }
                }
            } else if (points[idx - 1]?.continuous) {
                direction = -1;
            } else if (points[idx + 1]?.continuous) {
                direction = 1;
            }
            if (sibling = points[idx + (2 * direction)]) {
                return (dx, dy) => {
                    move(points[idx], dx, dy);
                    Object.assign(sibling, siblingPosition(points[idx], points[idx + direction], sibling, xScale, yScale));
                }
            }
            return (dx, dy) => move(points[idx], dx, dy);
        }

        svg.on("mousemove", event=>dragSubject({sourceEvent: event})).call(d3.drag().subject(dragSubject)
            .on("start", ({subject})=>subject && svg.style("cursor", "grabbing"))
            .on("drag", ({subject, dx, dy})=>subject(dx, dy))
            .on("end", ()=>svg.style("cursor", "grab"))
            .on("start.render drag.render end.render", update));
    }

    window.onresize = updateViewport;
}

const diyElementsStyle = `


input, .box {
    text-align:center;
    border-radius: 5px;
    width: 70px;
    margin: 2px;
    font-size: 15px;
    font-weight: 500;
    display: inline-block;
    float: left;
}

.box {
    cursor: pointer;
    width: 74px;
    position: relative;
    background: #ffffff;
    color: #000000;
    padding: 3px 2px;
}

.switch {   
    position: absolute;
    z-index: 10;
    left: 0px;
    top: 0px;
    width: 35px;
    height: 20px;
    background: rgb(248 248 248 / 0%);
    border-width: 2px;
    border-style: inset;
    border-color: rgb(118, 118, 118);
    border-radius: 5px;
    transition: .2s;
}

.checked > .switch {
    transform: translateX(39px);
}

.disabled > .switch {
    border-color: rgba(118, 118, 118, 0);
    transition: 0s;
}

.disabled {   
    background: rgba(239, 239, 239, 0.3);
    color: rgb(110 110 110);
    transition: .2s;
    border-style: inset;
    border-color: rgba(118, 118, 118, 0.3);
    border-width: 2px;
    padding: 1px 0px;
    transition: .0s;
}


.container {
    height: 30px;
}

input[type='submit'] {
    position: absolute; 
    left: -200px;
}

label{
    display: inline-block;
    float: left;
    clear: left;
    width: 100px;
    font-size: 14px;
    text-align: right;
    padding: 4px;
}

@media (prefers-color-scheme: dark) {
    input, .box {
        background: #5c585d;
        color: #e8dbc6;
    }

    .switch {
        border-style: solid;
        border-color: rgb(181 181 181);
    }

    input:disabled, .disabled {
        cursor: default;
        background: #3f3c40;
        color: rgb(110 110 110);
    }
}
`;

customElements.define('dim-input', class extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({
            mode: 'open'
        });

        this.name = this.getAttribute('name');
        const form = document.createElement('form');
        const div = document.createElement('div');
        div.classList.add('container');
        const input = document.createElement('input');
        const label = document.createElement('label');
        const css = document.createElement('style');
        css.textContent = diyElementsStyle;

        shadowRoot.appendChild(css);
        shadowRoot.appendChild(form);
        form.appendChild(div);
        div.appendChild(label);
        div.appendChild(input);

        input.value = this.textContent;
        input.disabled = true;
        label.innerText = this.name.charAt(0).toUpperCase() + this.name.slice(1);

        const showValue = ()=>{
            if (this.point) {
                input.value = round(this.point[this.name]);
                input.disabled = !this.point['freedom' + this.name.charAt(0).toUpperCase()];
            } else {
                input.value = ''
                input.disabled = true;
            }
        }

        document.addEventListener('pointselected', (e)=>{
            this.point = e.detail?.point;
            this.movePoint = e.detail?.move;
            showValue();
        }
        );

        document.addEventListener('pointmove', showValue);

        form.addEventListener('submit', e=>{
            e.preventDefault();
            if (this.point) {
                this.movePoint(parseFloat(input.value) - this.point[this.name], this.name);
            }
        }
        );
    }
}
);

customElements.define('dims-input', class extends HTMLElement {

    board;

    constructor() {
        super();

        const shadowRoot = this.attachShadow({
            mode: 'open'
        });

        const form = document.createElement('form');
        const style = document.createElement('style');
        style.textContent = diyElementsStyle;
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(form);
        this.inputs = {};
        this.dims = ['length', 'width', 'thickness'];

        for (const dim of this.dims) {
            const div = document.createElement('div');
            const input = document.createElement('input');
            const label = document.createElement('label');

            this.inputs[dim] = input;
            input.value = '';
            label.innerText = dim.charAt(0).toUpperCase() + dim.slice(1);

            form.appendChild(div);
            div.appendChild(label);
            div.appendChild(input);

        }

        const submit = document.createElement('input');
        submit.setAttribute('type', 'submit')
        form.appendChild(submit)

        form.addEventListener('submit', e=>{
            e.preventDefault();
            for (const dim of this.dims) {
                this.board[dim] = parseFloat(this.inputs[dim].value);
            }
            const event = new Event('dimschange');
            document.dispatchEvent(event);
        }
        );
    }

    setDims(board) {
        this.board = board;
        for (const dim of this.dims) {
            this.inputs[dim].value = board[dim];
        }
    }
}
);

customElements.define('toggle-switch', class extends HTMLElement {

    constructor() {
        super();

        const boxHeight = 25;

        const shadowRoot = this.attachShadow({
            mode: 'open'
        });

        this.name = this.getAttribute('name');
        this.left = this.getAttribute('left');
        this.right = this.getAttribute('right');
        this.event = this.getAttribute('event');

        const div = document.createElement('div');
        div.classList.add('container');
        const label = document.createElement('label');
        this.box = document.createElement('div');
        this.box.classList.add('box');
        if (this.getAttribute('disabled') != null) {
            this.box.classList.add('disabled');
        }
        this.box.style.height = boxHeight;

        const switsh = document.createElement('span');
        switsh.classList.add('switch');
        switsh.style.height = boxHeight - 4;
        switsh.style.width = 33;

        const css = document.createElement('style');

        css.textContent = diyElementsStyle;

        shadowRoot.appendChild(css);
        shadowRoot.appendChild(div);
        div.appendChild(label);
        div.appendChild(this.box);
        this.box.innerText = `${this.left} \u00A0\u00A0\u00A0 ${this.right}`;
        this.box.appendChild(switsh);

        label.innerText = this.name;

        this.box.onclick = ()=>{
            this.box.classList.toggle('checked');
            const event = new Event(this.event);
            document.dispatchEvent(event);
        }

    }

    disable() {
        this.box.classList.add('disabled');
    }

    enable() {
        this.box.classList.remove('disabled');
    }

    check() {
        this.box.classList.add('checked');
    }

    uncheck() {
        this.box.classList.remove('checked');
    }

}
);

document.addEventListener('pointselected', (e)=>{
    const tog = document.getElementById('continuityswitch');
    if (e.detail?.point) {
        tog.enable();
        (e.detail.point.continuity) ? tog.uncheck() : tog.check();
    } else {
        tog.disable();
    }
}
);
