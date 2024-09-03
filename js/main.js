// @ts-check
import * as ui from "./ui.js";
import * as surf from "./surf.js";
import * as trid from "./3d.js";
import { eps, coords } from "./config.js";
import { Vector3 } from "three";
/** @import { ProfileKey } from "./config.js" */

const { board } = surf;

const svg = /** @type {HTMLElement & SVGElement} */ (
  document.getElementById("vis")
);

surf.addBoardChangeListener(() => {
  const positionsAttribute = trid.getPositionsAttribute();
  surf.getPositions(positionsAttribute.array);
  positionsAttribute.needsUpdate = true;
});

// update positions before rendering
surf.commitBoardChanges();
trid.display3D();

const buttons = /** @type {HTMLElement} */ (
  document.getElementById("positions")
);
const [top, side, front, back] = buttons.children;

/** @param {any} e */
const moveSvg = (e) => {
  const profile = ui.state.profile;
  const { xUp, yUp, zUp } = coords[profile];
  if (
    !svg.classList.contains("hidden") &&
    e.target.object.up.distanceTo(new Vector3(xUp, yUp, zUp)) > 1e-5
  )
    ui.hideSvg();

  ui.updateSvgLayer(profile, e.target.object.zoom, e.target.target);
};

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

  ui.setProfile(profileKey);

  trid.controls.removeEventListener("change", moveSvg);
  ui.showSvg();
  trid.tweenCameraTo(destination).onComplete(() => {
    trid.controls.addEventListener("change", moveSvg);
  });
}

top.addEventListener("click", () => moveTo("top"));
side.addEventListener("click", () => moveTo("side"));
front.addEventListener("click", () => moveTo("front"));
back.addEventListener("click", () => moveTo("back"));

ui.setupDimensionInputs(board, () => {
  // recompute the required zoom for the x profile, should be applied only
  // conditionally
  const { length, width } = board;
  coords.front.zoom = coords.back.zoom = length / width / 2;
  trid.camera.zoom = coords[ui.state.profile].zoom;
  trid.camera.updateProjectionMatrix();
  surf.commitBoardChanges();
});

window.addEventListener("resize", () => {
  trid.onResize();
  ui.updateSvgLayer(ui.state.profile);
});
