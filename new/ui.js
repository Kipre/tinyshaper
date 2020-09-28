const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const style = {
    parentPointFill: dark ? '#9d9d9d' : '#b8b8b8',
    childPointFill: dark ? '#b800b8' : '#b800b8',
    pointStroke: '#000000',
    selectedPointStroke: '#a13939',
    outlineFill: dark ? '#4f4040' : '#bbe7fd',
    outlineStroke: dark ? '#53948f' : '#1e4a5f',
    radius: 7,
    floatPrecision: 2
};
const round = (x)=>Math.round(x * 10 ** style.floatPrecision) / 10 ** style.floatPrecision

export function setup(board, logicBoard) {
    const parent = document.getElementById('canvases');
    const width = parent.offsetWidth - 3
      , height = (parent.offsetHeight / 3) - 5;

    const canvases = {};

    canvases.y = document.getElementById('canvas-y');
    setupPanel(board.y, board.length, board.thickness, canvases.y, (window.innerHeight / 4) - 5, width, false);

    canvases.z = document.getElementById('canvas-z');
    setupPanel(board.z, board.length, board.width, canvases.z, (window.innerHeight / 2.5) - 5, width, true);

    canvases.x = document.getElementById('canvas-x');
    setupPanel(board.x, board.width, board.thickness, canvases.x, height, width / 2 - 5, false);

    canvases.x0 = document.getElementById('canvas-x0');
    setupPanel(board.x0, logicBoard.x0Width, logicBoard.x0Thickness, canvases.x0, height, width / 2 - 5, false);

    document.getElementById('continuity').onclick = ()=>{
        const event = new Event('continuitytoggle')
        document.dispatchEvent(event);
    }

    parent.addEventListener('pointselected', (e)=>{
        const event = new Event('pointchanged')
        for (const axis in canvases) {
            if (canvases[axis] != e.target) {
                canvases[axis].dispatchEvent(event);
            }
        }
    }
    )
}

function setupPanel(pts, objectWidth, objectHeight, canvas, height, width, full) {

    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const [xFactor,xTranslation,yFactor,yTranslation] = affineCoeficients(objectWidth, objectHeight, width, height);

    // No selected point
    let selected = -1;
    let dragging = false;

    renderUI(pts, context, canvas);

    canvas.onmousedown = e=>{
        selected = touchesSomething(e.offsetX, e.offsetY, pts);
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
    };

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
    function touchesSomething(v, w, pts) {
        for (const [i,point] of pts.entries()) {
            const [ve,we] = toUI(point.x, point.y);
            const radius = style.radius
            if ((ve - v) ** 2 + (we - w) ** 2 < radius ** 2) {
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
        ctx.moveTo(a + style.radius, b);
        ctx.arc(a, b, style.radius, 0, 2 * Math.PI);

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

customElements.define('dim-input', class extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({
            mode: 'open'
        });

        this.name = this.getAttribute('name');
        const form = document.createElement('form');
        const input = document.createElement('input');
        const label = document.createElement('label');

        input.disabled = true;
        const css = document.createElement('style');
        css.textContent = 'label { padding: 4px; }';

        shadowRoot.appendChild(css);
        shadowRoot.appendChild(form);

        input.value = this.textContent;
        label.innerText = this.name.charAt(0).toUpperCase() + this.name.slice(1);
        form.appendChild(label);
        form.appendChild(input);
        input.style.width = '100px';
        this.style.display = 'inline-block';

        const showValue = ()=>{
            if (this.point) {
                input.value = round(this.point[this.name]);
                input.disabled = !this.point['freedom' + this.name.charAt(0).toUpperCase()];
            } else {
                input.value = ''
                input.disabled = true;
            }
        }
        ;

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
    constructor() {
        super();

        const shadowRoot = this.attachShadow({
            mode: 'open'
        });

        const form = document.createElement('form');
        const style = document.createElement('style');
        style.textContent = 'label { padding: 4px; }';
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(form);
        const inputs = {};

        for (const dim of ['length', 'width', 'thickness']) {
            const div = document.createElement('div');
            const input = document.createElement('input');
            inputs[dim] = input;
            const label = document.createElement('label');
            input.value = '';
            label.innerText = dim.charAt(0).toUpperCase() + dim.slice(1);
            form.appendChild(div);
            div.appendChild(label);
            div.appendChild(input);
            input.style.width = '100px';

        }

        this.style.display = 'inline-block';

        //         this.addEventListener('click', ()=>{
        //             input.focus();
        //             input.setSelectionRange(0, input.value.length)
        //         }
        //         );

        //         form.addEventListener('submit', e=>{
        //             updateDisplay();
        //             e.preventDefault();
        //         }
        //         );

        //         function updateDisplay() {}
    }
}
);
