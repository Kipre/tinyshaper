import * as d3 from "https://cdn.skypack.dev/d3@7";
import {roots, siblingPosition, evaluate} from './surf.js';

export const config = {
    pointStrokeWidth: 1,
    selectRadius: 7,
    pointRadius: 6,
    floatPrecision: 2,
    padding: 20,
}

const state = {
    profile: 'z',
    pivoted: false
}

export function setup(board, onDragEnd, profile) {

    const profiles = {
        'z': {
            width: board.length,
            height: board.width,
        },
        'yUp': {
            width: board.length,
            height: -board.thickness,
        },
        'x': {
            width: board.width,
            height: -board.thickness,
            half: true
        },
        'x0': {
            height: (evaluate(board.yDown, roots(board.yDown, {x: board.z[3].x})[0]) - evaluate(board.yUp, roots(board.yUp, {x: board.z[3].x})[0])) * board.thickness,
            width: board.z[3].y * board.width
        }
    }

    state.profile = profile;

    const {width, height, half} = profiles[state.profile];
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
        // } else {
        // [state.pivoted, xScale] = [true, clientHeight];
        // }
        [state.pivoted, xScale] = [false, clientWidth - 2*padding];
        let xHalf = padding;
        const yHalf = clientHeight / 2;
        if (half) {
            xHalf = clientWidth / 2;
            [state.pivoted, xScale] = [false, xHalf - padding];
        }
        
        yScale = xScale * (height / width);

        // bottomAxis.attr("transform", `translate(0, ${yScale * 1.1})`).call(d3.axisBottom(d3.scaleLinear().range([0, xScale]).domain([0, length])).ticks())
        scale = ({x, y})=>({
            x: x * xScale + xHalf,
            y: y * yScale + yHalf
        });
        unscale = ({x, y})=>({
            x: (x - xHalf) / xScale,
            y: (y - yHalf) / yScale
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

        svg.selectAll(".u-line")
            .data(quads
                .flatMap(([from,to,from1,to1])=>[{from, to}, {from: from1, to: to1}]))
            .join("line")
            .attr("x1", ({from})=>from.x)
            .attr("y1", ({from})=>from.y)
            .attr("x2", ({to})=>to.x)
            .attr("y2", ({to})=>to.y)
            .classed("u-line", true);
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
            .on("drag", ({subject, dx, dy})=>{
                subject(dx, dy);
            })
            .on("end", ()=>{
                svg.style("cursor", "grab");
                onDragEnd?.();
            })
            .on("start.render drag.render end.render", update));
    }

    window.onresize = updateViewport;
}
