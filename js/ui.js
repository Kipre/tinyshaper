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
const dpi = window.devicePixelRatio;
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
                move: (d, axis)=>{
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
            if (touchesSomething(e.offsetX, e.offsetY, pts, selected) >= 0) {
                canvas.style.cursor = 'pointer';
            } else {
                canvas.style.cursor = 'default';
            }
        }
    }
    ;

    canvas.onmouseup = e=>{
        dragging = false;
    }
    ;

    document.addEventListener('continuitytoggle', (e)=>{
        if (selected >= 0) {
            activeFamily(selected, pts).forEach((e)=>{e.continuity ^= true;})
            movePoint(0, 0, selected, pts);
            renderUI(pts, context, canvas);
        }
    }
    );

    document.addEventListener('pointselected', (e)=>{
        if (e.target != canvas) {
            selected = -1
            renderUI(pts, context, canvas);
        }
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
            if ((ve - v) ** 2 + (we - w) ** 2 < style.touchRadius ** 2) {
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
});

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

        this.box.onclick = () => {
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

});

document.addEventListener('pointselected', (e)=>{
    const tog = document.getElementById('continuityswitch');
    if (e.detail?.point) {
        tog.enable();
        (e.detail.point.continuity)? tog.uncheck(): tog.check();
    } else {
        tog.disable();
    }
}
);

const svg = (function() {
  const ns = "http://www.w3.org/2000/svg";
  function drawCont() {
    const img = document.createElementNS(ns, "svg");
    img.setAttribute('width', '41px');
    img.setAttribute('height', '41px');
    const [a, b, c] = [[5, 5], [15, 35], [35, 25]];
    const [a1, b1, c1] = [[5, 5], [35, 35], [22, 22]];

    img.appendChild(mkAnimLine(...a, ...c, ...a1, ...c1));
    img.appendChild(mkAnimLine(...c, ...b, ...c1, ...b1));
    img.appendChild(mkAnimCircle(...a, ...a1, style.childPointFill));
    img.appendChild(mkAnimCircle(...b, ...b1, style.childPointFill));
    img.appendChild(mkAnimCircle(...c, ...c1, style.parentPointFill));

    return img;
  }

  function mkAnimCircle(x, y, x1, y1, fillColor) {
        const circle = mkCircle(x, y, style.visibleRadius, style.pointStroke, fillColor);
        circle.appendChild(mkAnim('cx', x, x1));
        circle.appendChild(mkAnim('cy', y, y1));
        return circle;
    }    

    function mkAnimLine(x, y, x1, y1, x2, y2, x3, y3) {
      const line = mkLine(x, y, x1, y1);
      line.appendChild(mkAnim('x1', x, x2));
      line.appendChild(mkAnim('y1', y, y2));
      line.appendChild(mkAnim('x2', x1, x3));
      line.appendChild(mkAnim('y2', y1, y3));
      return line;
    }

    function mkLine(x1, y1, x2, y2) {
        const line = document.createElementNS(ns, "line");
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke-width', 1);
        line.setAttribute('stroke', style.pointStroke);
        return line;
    }

    function mkCircle(x, y, r, stroke, fill) {
        const circle = document.createElementNS(ns, "circle");
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', r);
        circle.setAttribute('stroke', stroke);
        circle.setAttribute('stroke-width', 1);
        circle.setAttribute('fill', fill);
        return circle;
    }

    function mkAnim(attr, from, to) {
        const anim = document.createElementNS(ns, "animate");
        anim.setAttribute('attributeName', attr);
        anim.setAttribute('from', from);
        anim.setAttribute('to', to);
        anim.setAttribute('dur', "1s");
        anim.setAttribute('repeatCount', 'indefinite');
        return anim;
    }
            
    return {drawCont: drawCont}
})();

const toggleSwitchStyle = `


`;


// customElements.define('toggle-switch', class extends HTMLElement {

//     state = false;
    
//     constructor() {
//         super();

//         const shadowRoot = this.attachShadow({
//             mode: 'open'
//         });

//         const button = document.createElement('button');
//         button.classList.add("switch");
//         const img = svg.drawCont()
//         button.appendChild(img);

//         const style = document.createElement('style');
//         style.textContent = toggleSwitchStyle;
//         shadowRoot.appendChild(style);

//         shadowRoot.appendChild(button);
//     }
// });


