// @ts-check
import * as ui from "./ui.js";
import * as surf from "./surf.js";
import * as trid from "./3d.js";
import { eps } from "./config.js";
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

let lastChangeListener;

/**
 * @param {ProfileKey} profileKey
 */
function moveTo(profileKey) {
  const profileInfo = surf.getBoardVisualisationProfile(board, profileKey);
  const destination = { ...profileInfo.cameraPosition, zoom: profileInfo.zoom };
  const { x, y, z, xUp, yUp, zUp, zoom } = destination;
  if (
    trid.camera.up.distanceTo(new Vector3(xUp, yUp, zUp)) < eps &&
    trid.camera.position.distanceTo(new Vector3(x, y, z)) < eps &&
    Math.abs(trid.camera.zoom - zoom) < eps
  )
    return;

  ui.setProfile(profileKey);

  /** @param {any} e */
  const moveSvg = (e) => {
    const { xUp, yUp, zUp } = destination;
    if (
      !svg.classList.contains("hidden") &&
      e.target.object.up.distanceTo(new Vector3(xUp, yUp, zUp)) > 1e-5
    )
      ui.hideSvg();

    ui.updateSvgLayerPosition(
      profileKey,
      e.target.object.zoom,
      e.target.target,
    );
  };

  if (lastChangeListener)
    trid.controls.removeEventListener("change", lastChangeListener);

  ui.showSvg();
  trid.tweenCameraTo(destination).onComplete(() => {
    trid.controls.addEventListener("change", moveSvg);
    lastChangeListener = moveSvg;
  });
}

ui.setupOrientationButtons(moveTo);

ui.setupDimensionInputs(board, () => {
  // recompute the required zoom for the x profile, should be applied only
  // conditionally
  const profile = ui.state.profile;
  if (profile === "front" || profile === "back") {
    const { zoom } = surf.getBoardVisualisationProfile(board, profile);
    trid.camera.zoom = zoom;
    trid.camera.updateProjectionMatrix();
  }
});

window.addEventListener("resize", () => {
  trid.onResize();
  ui.updateSvgLayerPosition(ui.state.profile);
});

export function run() {
  // update positions before first rendering
  surf.modifyBoard((x) => x);
  trid.display3D();
}
