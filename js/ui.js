// @ts-check
import * as d3 from "d3";
import {
  board,
  siblingPosition,
  commitBoardChanges,
  modifyBoard,
  getBoardVisualisationProfile,
} from "./surf.js";
import { coords } from "./config.js";
import { Vector3 } from "three";
/** @import { ProfileKey, ProfileInfo } from "./config.js" */

export const config = {
  pointStrokeWidth: 1,
  selectRadius: 7,
  pointRadius: 6,
  floatPrecision: 2,
  padding: 20,
};

/** @type {{profile: ProfileKey, pivoted: boolean}} */
export const state = {
  profile: "top",
  pivoted: false,
};

/**
 * @param {ProfileKey} profile
 */
export function setProfile(profile) {
  state.profile = profile;
  points = board[coords[profile].profile];

  if (profile === "side") {
    points = [
      ...board["yUp"],
      board["yUp"].at(-1),
      board["yDown"].at(-1),
      ...[...board["yDown"]].reverse(),
    ];
  }
  draggable();
}

let points, scaledPoints;
let xScale, yScale;

const svg = d3
  .select("#vis")
  .call((svg) => svg.append("path").attr("class", "u-path"));

const svgElement = /** @type {SVGElement & HTMLElement} */ (svg.node());

export const showSvg = () => {
  document.documentElement.style.setProperty("--svg-opacity", "0");
  svgElement.classList.remove("hidden");
};

export const hideSvg = () => {
  svgElement.classList.add("hidden");
};

const { clientHeight } = svgElement;

const bottomAxis = svg
  .append("g")
  .attr("transform", `translate(0,${clientHeight - 2 * config.padding})`);

//const leftAxis = svg.append("g");

let scale = ({ x, y }) => ({ x, y }),
  unscale = scale;

let currentWidth = 0;

/**
 * @param {ProfileKey} profileKey
 * @param {number?} [maybeZoom]
 * @param {Vector3?} [target]
 */
export function updateSvgLayer(profileKey, maybeZoom, target) {
  const {
    width,
    height,
    half,
    bottom,
    getXPan,
    getYPan,
    zoom: defaultZoom,
  } = getBoardVisualisationProfile(board, profileKey);

  currentWidth = width;

  const [xPan, yPan] = target ? [getXPan(target), getYPan(target)] : [0, 0];

  const zoom = maybeZoom ?? defaultZoom;

  const { clientWidth, clientHeight } = svgElement;

  const { padding } = config;
  const zoomComponent = zoom / defaultZoom;

  const effectiveWidth = clientWidth - 2 * padding;

  // 0.5 is half of the length of the profile as all profiles are normalized
  const zoomCentering = 0.5 * (1 - zoomComponent) * effectiveWidth;

  const clipSpaceRatio = board.length / width;
  const smallProfileScale = half ? (0.5 * width) / board.width : 1;

  xScale = smallProfileScale * zoomComponent * effectiveWidth;
  yScale = (xScale * height) / width;

  const lastTerm = half ? (0.5 * xScale) / smallProfileScale : 0;

  const xHalf =
    padding + zoomCentering + xPan * xScale * clipSpaceRatio + lastTerm;

  // for the back profile we need to translate it vetically so that in sits in
  // the right spot on the board
  const bottomTerm = (-(bottom || 0) / height) * yScale;

  const yHalf = clientHeight / 2 + yPan * xScale * clipSpaceRatio + bottomTerm;

  scale = ({ x, y }) => ({
    x: x * xScale + xHalf,
    y: y * yScale + yHalf,
  });

  unscale = ({ x, y }) => ({
    x: (x - xHalf) / xScale,
    y: (y - yHalf) / yScale,
  });

  update();
}

function update() {
  scaledPoints = points.map(scale);
  const quads = Array.from(
    {
      length: (points.length - 1) / 3,
    },
    (_, i) => i * 3,
  ).map((i) => scaledPoints.slice(i, i + 4));

  const path = d3.path();
  const [{ x, y }] = scaledPoints;
  path.moveTo(x, y);
  quads.forEach(([, { x: cp1x, y: cp1y }, { x: cp2x, y: cp2y }, { x, y }]) =>
    path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y),
  );

  svg.select(".u-path").attr("d", path);

  svg
    .selectAll(".u-point")
    .data(scaledPoints)
    .join((enter) =>
      enter
        .append("g")
        .classed("u-point", true)
        .call((g) => g.append("circle").attr("r", config.pointRadius)),
    )
    .attr("transform", ({ x, y }) => `translate(${[x, y]})`);

  svg
    .selectAll(".u-line")
    .data(
      quads.flatMap(([from, to, from1, to1]) => [
        { from, to },
        { from: from1, to: to1 },
      ]),
    )
    .join("line")
    .attr("x1", ({ from }) => from.x)
    .attr("y1", ({ from }) => from.y)
    .attr("x2", ({ to }) => to.x)
    .attr("y2", ({ to }) => to.y)
    .classed("u-line", true);

  const start = scale({ x: 0, y: 0 });
  const stop = scale({ x: 1, y: 0 });

  bottomAxis.call(
    d3.axisBottom(d3.scaleLinear([0, currentWidth], [start.x, stop.x])),
  );
}

function draggable() {
  updateSvgLayer(state.profile);

  function dragSubject(event) {
    const [px, py] = d3.pointer(event.sourceEvent, svg.node());
    const dist = (m) => Math.sqrt((px - m.x) ** 2 + (py - m.y) ** 2);
    const idx = d3.minIndex(scaledPoints, dist);
    if (dist(scaledPoints[idx]) > config.selectRadius) {
      svg.style("cursor", null);
      return null;
    }
    svg.style("cursor", "hand").style("cursor", "grab");
    const { continuous, freezeX, freezeY } = points[idx];
    const move = (point, dx, dy) => {
      point.x += (dx / xScale) * !freezeX;
      point.y += (dy / yScale) * !freezeY;
    };
    let direction, sibling;
    if (continuous !== undefined) {
      return (dx, dy) => {
        for (let i = -1; i <= 1; i++) {
          move(points[idx + i], dx, dy);
        }
      };
    } else if (points[idx - 1]?.continuous) {
      direction = -1;
    } else if (points[idx + 1]?.continuous) {
      direction = 1;
    }
    if ((sibling = points[idx + 2 * direction])) {
      return (dx, dy) => {
        move(points[idx], dx, dy);
        Object.assign(
          sibling,
          siblingPosition(
            points[idx],
            points[idx + direction],
            sibling,
            xScale,
            yScale,
          ),
        );
      };
    }
    return (dx, dy) => move(points[idx], dx, dy);
  }

  svg
    .on("mousemove", (event) => dragSubject({ sourceEvent: event }))
    .call(
      d3
        .drag()
        .subject(dragSubject)
        .on(
          "start",
          ({ subject }) => subject && svg.style("cursor", "grabbing"),
        )
        .on("drag", ({ subject, dx, dy }) => {
          subject(dx, dy);
          commitBoardChanges();
        })
        .on("end", () => svg.style("cursor", "grab"))
        .on("start.render drag.render end.render", update),
    );
}

/**
 * @param board {import("./surf.js").Board}
 * @param onAfterModified {() => void}
 */
export function setupDimensionInputs(board, onAfterModified) {
  const dimensions = /** @type {NodeListOf<HTMLInputElement>} */ (
    document.querySelectorAll(".dimensions input")
  );
  const [length, width, thickness] = dimensions;

  length.value = board.length.toString();
  width.value = board.width.toString();
  thickness.value = board.thickness.toString();

  for (const input of dimensions) {
    input.addEventListener("change", (e) => {
      const dim = e.target.id;
      modifyBoard((board) => (board[dim] = e.target.value));
      onAfterModified();

      updateSvgLayer(state.profile);
    });
  }
}
