const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const style = {
    parentPointFill: dark ? '#9d9d9d' : '#b8b8b8',
    childPointFill: dark ? '#b800b8' : '#b800b8',
    pointStroke: '#000000',
    selectedPointStroke: '#a13939',
    outlineFill: dark ? '#4f4040' : '#bbe7fd',
    outlineStroke: dark ? '#53948f' : '#1e4a5f',
    radius: 7
};

export function setup(board, logicBoard) {
    const parent = document.getElementById('canvases');
    const width = parent.offsetWidth - 3
      , height = (parent.offsetHeight / 3) - 5;

    const canvasY = document.getElementById('canvas-y');
    const callbacksY = setupPanel(board.y, board.length, board.thickness, canvasY, (window.innerHeight / 4) - 5, width, false);

    const canvasZ = document.getElementById('canvas-z');
    const callbacksZ = setupPanel(board.z, board.length, board.width, canvasZ, (window.innerHeight / 2.5) - 5, width, true);

    const canvasX = document.getElementById('canvas-x');
    const callbacksX = setupPanel(board.x, board.width, board.thickness, canvasX, height, width / 2 - 5, false);

    const canvasX0 = document.getElementById('canvas-x0');
    const callbacksX0 = setupPanel(board.x0, logicBoard.x0Width, logicBoard.x0Thickness, canvasX0, height, width / 2 - 5, false);

    document.onmousedown = (e)=>{
        callbacksX.onmousedown(e);
        callbacksY.onmousedown(e);
        callbacksZ.onmousedown(e);
        callbacksX0.onmousedown(e);
    }
    document.onmousemove = (e)=>{
        callbacksX.onmousemove(e);
        callbacksY.onmousemove(e);
        callbacksZ.onmousemove(e);
        callbacksX0.onmousemove(e);
    }
    document.onmouseup = (e)=>{
        callbacksX.onmouseup(e);
        callbacksY.onmouseup(e);
        callbacksZ.onmouseup(e);
        callbacksX0.onmouseup(e);
    }
    document.getElementById('continuity').onclick = ()=>{
        callbacksX.togglecontinuity();
        callbacksY.togglecontinuity();
        callbacksZ.togglecontinuity();
        callbacksX0.togglecontinuity();
    }
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

    return {
        onmousedown: e=>{
            if (e.target == canvas) {
                selected = touchesSomething(e.offsetX, e.offsetY, pts);
                dragging = (selected >= 0);
            } else if (e.target instanceof HTMLCanvasElement) {
                selected = -1;
                dragging = false;
            }
            // For the selected point to dissapear
            renderUI(pts, context, canvas);
        }
        ,
        onmousemove: e=>{
            if (dragging && e.target == canvas) {
                movePoint(...incrementsFromUI(e.movementX, e.movementY), selected, pts)
                renderUI(pts, context, canvas);
                return;
            } else {
                dragging = false;
            }
        }
        ,
        onmouseup: e=>{
            dragging = false;
        }
        ,
        togglecontinuity: ()=>{
            if (selected >= 0) {
                parent(selected, pts).continuity ^= true;
            }
        }
    };

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
        const form = document.createElement('form');
        const input = document.createElement('input');
        const label = document.createElement('label');

        const style = document.createElement('style');
        style.textContent = 'label { padding: 4px; }';

        shadowRoot.appendChild(style);
        shadowRoot.appendChild(form);

        input.value = this.textContent;
        label.innerText = this.getAttribute('name');

        form.appendChild(label);
        form.appendChild(input);
        input.style.width = '100px';
        this.style.display = 'inline-block';

        this.addEventListener('click', ()=>{
            input.focus();
            input.setSelectionRange(0, input.value.length)
        }
        );

        form.addEventListener('submit', e=>{
            updateDisplay();
            e.preventDefault();
        }
        );

        function updateDisplay() {}
    }
}
);
