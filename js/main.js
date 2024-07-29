// @ts-check
import * as ui from "./ui.js";
import * as surf from "./surf.js";
import * as trid from "./3d.js";
import { coords } from "./config.js";
import { Vector3 } from "three";
/** @import { ProfileKey } from "./config.js" */

const { board } = surf;

const svg = /** @type {HTMLElement & SVGElement} */ (
  document.getElementById("vis")
);
const canvas = document.getElementById("threed");

surf.addBoardChangeListener(() => {
  surf.getPositions(trid.getPositionsAttribute());
  trid.update();
});

ui.setProfile("top");

const positions = surf.getPositions();
const indices = surf.getIndices();
trid.display3D(positions, indices, board);

const showSvg = () => {
  document.documentElement.style.setProperty("--svg-opacity", "0");
  svg.classList.remove("hidden");
};

const hideSvg = () => {
  svg.classList.add("hidden");
};

const buttons = /** @type {HTMLElement} */ (
  document.getElementById("positions")
);
const [top, side, front, back] = buttons.children;

/** @param {} e */
const moveSvg = (e) => {
  const profile = ui.state.profile;
  const { xUp, yUp, zUp } = coords[profile];
  if (
    !svg.classList.contains("hidden") &&
    e.target.object.up.distanceTo(new Vector3(xUp, yUp, zUp)) > 1e-5
  )
    hideSvg();

  ui.updateViewport(profile, e.target.object.zoom, e.target.target);
};

const eps = 1e-5;
/**
 * @param {ProfileKey} profileKey
 */
function moveTo(profileKey) {
  const { profile, ...destination } = coords[profileKey];
  const { x, y, z, xUp, yUp, zUp, zoom } = destination;
  if (
    trid.camera.up.distanceTo(new Vector3(xUp, yUp, zUp)) < eps &&
    trid.camera.position.distanceTo(new Vector3(x, y, z)) < eps &&
    Math.abs(trid.camera.zoom - zoom) < eps
  )
    return;

  trid.controls.removeEventListener("change", moveSvg);
  showSvg();
  ui.setProfile(profileKey);
  trid.tweenCameraTo(destination).onComplete(() => {
    trid.controls.addEventListener("change", moveSvg);
  });
}

top.addEventListener("click", () => moveTo("top"));
side.addEventListener("click", () => moveTo("side"));
front.addEventListener("click", () => moveTo("front"));
back.addEventListener("click", () => moveTo("back"));

window.addEventListener("resize", () => {
  trid.onResize();
  ui.updateViewport("top");
});
