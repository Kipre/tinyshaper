const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const style = {
    parentPointFill: dark ? '#9d9d9d' : '#b8b8b8',
    childPointFill: dark ? '#b800b8' : '#b800b8',
    pointStroke: '#000000',
    selectedPointStroke: '#a13939',
    outlineFill: dark ? '#4f4040' : '#bbe7fd',
    outlineStroke: dark ? '#53948f' : '#1e4a5f',
    pointStrokeWidth: 1,
    touchRadius: 7,
    visibleRadius: 5,
    floatPrecision: 2
};
const round = (x)=>Math.round(x * 10 ** style.floatPrecision) / 10 ** style.floatPrecision

function setBoardDimsControls(board) {
    document.getElementById('dims-control').setDims(board);
}

export function setup(board, logicBoard) {

    setBoardDimsControls(board);

    const parent = document.getElementById('canvases');
    parent.textContent = '';
    const width = parent.offsetWidth - 3
      , height = (parent.offsetHeight / 3) - 5;

    const canvas_obj = {};
    for (let args of [['z', board.length, board.width, (window.innerHeight / 2.5) - 5, width, true],
                      ['y', board.length, board.thickness, (window.innerHeight / 4) - 5, width, false],
                      ['x0', logicBoard.x0Width, logicBoard.x0Thickness, height, (logicBoard.x0Width/(logicBoard.x0Width + board.width))*width - 1, false],
                      ['x', board.width, board.thickness, height, (board.width/(logicBoard.x0Width + board.width))*width - 1, false]]) {
        const profile = args[0];
        canvas_obj[profile] = document.createElement('canvas');
        parent.appendChild(canvas_obj[profile]);
        args[0] = board[profile];
        setupPanel(canvas_obj[profile], ...args);

    }

    document.getElementById('continuity').onclick = ()=>{
        const event = new Event('continuitytoggle')
        document.dispatchEvent(event);
    }

    parent.addEventListener('pointselected', (e)=>{
        const event = new Event('pointchanged')
        for (const axis in canvas_obj) {
            if (canvas_obj[axis] != e.target) {
                canvas_obj[axis].dispatchEvent(event);
            }
        }
    });

}

function setupPanel(canvas, pts, objectWidth, objectHeight, height, width, full) {

    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const [xFactor,xTranslation,yFactor,yTranslation] = affineCoeficients(objectWidth, objectHeight, width, height);

    // No selected point
    let selected = -1;
    let dragging = false;

    renderUI(pts, context, canvas);

    canvas.onmousedown = e=>{
        selected = touchesSomething(e.offsetX, e.offsetY, pts, selected);
        dragging = (selected >= 0);
        const event = new CustomEvent('pointselected',{
            bubbles: true,
            detail: {
                point: pts[selected],
                move: (d,axis)=>{
                    const move = (axis == 'x') ? [d, 0] : [0, d]
                    movePoint(...move, selected, pts)
                    renderUI(pts, context, canvas);
                }
            }
        });
        canvas.dispatchEvent(event);
        // For the selected point to dissapear
        renderUI(pts, context, canvas);
    }

    canvas.onmousemove = e=>{
        if (dragging && e.target == canvas) {
            movePoint(...incrementsFromUI(e.movementX, e.movementY), selected, pts)
            // Let UI know that the point moves
            const event = new Event('pointmove');
            document.dispatchEvent(event);
            renderUI(pts, context, canvas);
            return;
        } else {
            dragging = false;
        }
    }
    ;

    canvas.onmouseup = e=>{
        dragging = false;
    }
    ;

    document.addEventListener('continuitytoggle', (e)=>{
        if (selected >= 0) {
            parent(selected, pts).continuity ^= true;
            movePoint(0, 0, selected, pts);
            renderUI(pts, context, canvas);
        }
    }
    );

    canvas.addEventListener('pointchanged', (e)=>{
        selected = -1
        renderUI(pts, context, canvas);
    }
    );

    function affineCoeficients(objectWidth, objectHeight, width, height) {
        const zoom = Math.min(0.9 * width / objectWidth, 0.8 * height / objectHeight);
        const xFactor = objectWidth * zoom;
        const yFactor = -objectHeight * zoom;
        const xTranslation = (width - xFactor) / 2;
        const yTranslation = (height - yFactor) / 2;
        return [xFactor, xTranslation, yFactor, yTranslation];
    }

    function toUI(a, b) {
        return [a * xFactor + xTranslation, yFactor * b + yTranslation]
    }

    function fromUI(a, b) {
        return [(a - xTranslation) / xFactor, (b - yTranslation) / yFactor];
    }

    function incrementsFromUI(da, db) {
        return [da / xFactor, db / yFactor];
    }

    /**
     * Checks if a point is currently being manipulated.
     * @param {number} v X coordinate of the click event with respect to the canvas.
     * @param {number} w Y coordinate.
     * @param {Array} pts Array of currenty plotted points.
     * @return {number} Returns -1 if there is no match, otherwise returns the index of the matched point.
     */
    function touchesSomething(v, w, pts, selected) {
        for (const [i,point] of pts.entries()) {
            const [ve,we] = toUI(point.x, point.y);
            if ((ve - v) ** 2 + (we - w) ** 2 < style.touchRadius ** 2 && i != selected) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Draws the board outline.
     * @param {Array} pts Profile array of points
     * @param {2DContext} context Canvas drawing context
     */
    function drawOutline(pts, ctx) {
        ctx.beginPath();
        ctx.fillStyle = style.outlineFill;
        ctx.strokeStyle = style.outlineStroke;
        ctx.moveTo(...toUI(pts[0].x, pts[0].y));
        let i = 1;
        while (i < pts.length) {
            if (pts[i].number >= 0) {
                ctx.lineTo(...toUI(pts[i].x, pts[i].y));
                i++;
            } else {
                ctx.bezierCurveTo(...toUI(pts[i].x, pts[i].y), ...toUI(pts[i + 1].x, pts[i + 1].y), ...toUI(pts[i + 2].x, pts[i + 2].y));
                i += 3;
            }
        }
        if (full) {
            i = pts.length - 2
            while (i > 0) {
                if (pts[i].number >= 0) {
                    ctx.lineTo(...toUI(pts[i].x, -pts[i].y));
                    i--;
                } else {
                    ctx.bezierCurveTo(...toUI(pts[i].x, -pts[i].y), ...toUI(pts[i - 1].x, -pts[i - 1].y), ...toUI(pts[i - 2].x, -pts[i - 2].y));
                    i -= 3;
                }
            }
        }
        ctx.closePath()
        ctx.fill();
        ctx.stroke();
    }

    function drawPoint(point, ctx) {
        ctx.beginPath();
        const [a,b] = toUI(point.x, point.y);
        ctx.moveTo(a + style.visibleRadius, b);
        ctx.arc(a, b, style.visibleRadius, 0, 2 * Math.PI);

        ctx.fill();
        ctx.stroke();
    }

    /** Transformation presque astucieuse */
    function parentInc(point) {
        return (point.number < 0) ? -2 * point.number - 3 : 0;
    }

    function sibling(selected, pts) {
        if (pts[selected].number < 0) {
            return pts[selected + 2 * parentInc(pts[selected])];
        }
        return null;
    }

    function parent(selected, pts) {
        if (selected >= 0) {
            return pts[selected + parentInc(pts[selected])];
        }
        return null;
    }

    function activeFamily(selected, pts) {
        if (selected >= 0) {
            const parentIndex = selected + parentInc(pts[selected]);
            const family = [pts[parentIndex]];
            if (pts[parentIndex - 1]?.number < 0) {
                family.unshift(pts[parentIndex - 1]);
            }
            if (pts[parentIndex + 1]?.number < 0) {
                family.push(pts[parentIndex + 1]);
            }
            return family;
        }
        return [];
    }

    function drawPoints(pts, ctx) {
        for (const [i,point] of pts.entries()) {
            if (point.number >= 0) {
                ctx.fillStyle = style.parentPointFill;
                ctx.strokeStyle = (i == selected) ? style.selectedPointStroke : style.pointStroke;
                drawPoint(point, ctx);
            } else if (i + parentInc(point) == selected) {
                ctx.fillStyle = style.childPointFill;
                ctx.strokeStyle = style.pointStroke;
                drawPoint(point, ctx);
            } else if (i == selected) {
                ctx.fillStyle = style.childPointFill;
                ctx.strokeStyle = style.selectedPointStroke;
                drawPoint(point, ctx);
                const brother = sibling(i, pts);
                if (brother) {
                    ctx.fillStyle = style.childPointFill;
                    ctx.strokeStyle = style.pointStroke;
                    drawPoint(brother, ctx);
                }
            }
        }
    }

    function drawLines(selected, pts, ctx) {
        if (selected >= 0) {
            const family = activeFamily(selected, pts);
            ctx.strokeStyle = style.pointStroke;
            ctx.beginPath();
            const first = family.shift();
            ctx.moveTo(...toUI(first.x, first.y));
            for (const member of family) {
                ctx.lineTo(...toUI(member.x, member.y))
            }
            ctx.stroke()
        }

    }

    function renderUI(pts, context, canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawOutline(pts, context);
        drawLines(selected, pts, context);
        drawPoints(pts, context);
    }

    function movePoint(dx, dy, selected, pts) {
        const point = pts[selected]
        // Assuming the point is selected
        const [incX,incY] = [dx * point.freedomX, dy * point.freedomY]
        point.x += incX;
        point.y += incY;
        if (point.number >= 0) {
            const [precPoint,nextPoint] = [pts[selected - 1], pts[selected + 1]]
            if (precPoint?.number < 0) {
                precPoint.x += incX;
                precPoint.y += incY;
            }
            if (nextPoint?.number < 0) {
                nextPoint.x += incX;
                nextPoint.y += incY;
            }
        } else {
            // In case we are moving through continuity
            const sister = sibling(selected, pts);
            if (sister) {
                const parent = pts[selected + parentInc(point)];
                if (parent.continuity) {
                    const [parV,parW] = toUI(parent.x, parent.y);
                    const [sisV,sisW] = toUI(sister.x, sister.y);
                    const [poiV,poiW] = toUI(point.x, point.y);
                    const norm = Math.sqrt((parV - sisV) ** 2 + (parW - sisW) ** 2);
                    const alpha = -Math.atan((poiV - parV) / (poiW - parW)) + ((poiW - parW) >= 0) * Math.PI + Math.PI / 2;
                    [sister.x,sister.y] = fromUI(norm * Math.cos(alpha) + parV, norm * Math.sin(alpha) + parW);
                }
            }
        }
    }

}


const diyElementsStyle = `
    input {
        text-align:center;
        border-radius: 5px;
        width: 60px;
        margin: 2px;
        font-size: 15px;
        font-weight: 500;
        display: inline-block;
        float: left;
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
        text-align: right;
        padding: 4px;
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
            this.point = e.detail.point;
            this.movePoint = e.detail.move;
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
});


export function svg(parent) {

    const ns = "http://www.w3.org/2000/svg";
    let svg = document.createElementNS(ns, "svg");
    svg.setAttribute('width', '50px');
    svg.setAttribute('height', '50px');
    let [a, b, c] = [[10, 10], [15, 45], [45, 15]];

    drawLine(...a, ...c);
    drawLine(...c, ...b);
    drawPoint(...a, style.childPointFill);
    drawPoint(...b, style.childPointFill);
    drawPoint(...c, style.parentPointFill);

    parent.appendChild(svg);

    svg = document.createElementNS(ns, "svg");
    svg.setAttribute('width', '50px');
    svg.setAttribute('height', '50px');
    [a, b, c] = [[10, 10], [45, 45], [30, 30]];

    drawLine(...a, ...c);
    drawLine(...c, ...b);
    drawPoint(...a, style.childPointFill);
    drawPoint(...b, style.childPointFill);
    drawPoint(...c, style.parentPointFill);

    parent.appendChild(svg);

    function drawPoint(x, y, fillColor) {
        const circle = document.createElementNS(ns, "circle");
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', style.visibleRadius);
        circle.setAttribute('stroke', style.pointStroke);
        circle.setAttribute('stroke-width', 1);
        circle.setAttribute('fill', fillColor);
        svg.appendChild(circle);
    }

    function drawLine(x1, y1, x2, y2) {
        const line = document.createElementNS(ns, "line");
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke-width', 1);
        line.setAttribute('stroke', style.pointStroke);
        svg.appendChild(line);

    }
}