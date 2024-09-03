// @ts-check
import * as THREE from "three";
import * as TWEEN from "tween";
import { TrackballControls } from "TrackballControls";
import { config } from "./ui.js";
import { nbPointsPerSlice, nbSlices } from "./config.js";
import { getIndices } from "./surf.js";

// buffer holding the mesh positions data
export const positionsArray = new Float32Array(nbPointsPerSlice * nbSlices * 3);
const indices = getIndices();

const scene = new THREE.Scene();
const canvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("threed")
);

const { x: pad, y: vert } = halves(canvas.offsetWidth, canvas.offsetHeight);

export const camera = new THREE.OrthographicCamera(
  -pad,
  pad,
  vert,
  -vert,
  -1,
  1000,
);
camera.position.set(-1.5, -0.5, 1);
camera.up.set(0, 0, 1);

export const controls = new TrackballControls(camera, canvas);
controls.rotateSpeed = 2.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 30;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);

const material = new THREE.MeshStandardMaterial({
  color: 0xffeeee,
  roughness: 0.2,
});

for (const position of [
  [0, 0, 1],
  [0, 2, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 1],
  [0, 0, -1],
  [0, -2, 0],
  [-1, 0, 0],
  [-1, 1, 0],
  [0, -1, -1],
]) {
  const light = new THREE.PointLight();
  light.position.set(...position);
  light.intensity = 0.8;
  scene.add(light);
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(positionsArray, 3));
geometry.setIndex(Array.from(indices));

export function display3D() {
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  //const edges = new THREE.EdgesGeometry( geometry, 0 );
  //const mesh = new THREE.LineSegments(edges, material);
  // const mesh = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xFFFFFF, size: 1 }))
  scene.add(mesh);

  const otherSide = new THREE.Mesh(geometry, material);
  // const other = new THREE.LineSegments(edges, material);
  otherSide.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
  scene.add(otherSide);

  onResize();
  animate();
}

export function getPositionsAttribute() {
  return geometry.getAttribute("position");
}

function halves(width, height) {
  const x = 0.5 * (1 + config.padding / (width / 2 - config.padding));
  const y = (height * x) / width;
  return { x, y };
}

export function onResize() {
  const parent = document.querySelector(".content");
  const width = parent.offsetWidth,
    height = parent.offsetHeight;
  renderer.setSize(width, height);

  const { x: pad, y: vert } = halves(width, height);

  camera.left = -pad;
  camera.right = pad;
  camera.top = vert;
  camera.bottom = -vert;
  camera.zoom = 1;

  camera.updateProjectionMatrix();
  controls.update();
}

function animate(time) {
  requestAnimationFrame(animate);
  TWEEN.update(time);
  controls.update();
  renderer.render(scene, camera);
}

function getCoords(camera) {
  return {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
    xUp: camera.up.x,
    yUp: camera.up.y,
    zUp: camera.up.z,
    zoom: camera.zoom,
  };
}

function setCamera({ x, y, z, xUp, yUp, zUp, zoom, a, panX, panY, panZ }) {
  camera.position.set(x, y, z);
  camera.up.set(xUp, yUp, zUp);
  camera.zoom = zoom;
  camera.updateProjectionMatrix();
  controls.target.set(panX, panY, panZ);
  controls.update();
  if (a >= 0) document.documentElement.style.setProperty("--svg-opacity", a);
}

export function tweenCameraTo(destination) {
  return new TWEEN.Tween({
    ...getCoords(camera),
    a: -2,
    panX: controls.target.x,
    panY: controls.target.y,
    panZ: controls.target.z,
  })
    .to(
      {
        ...destination,
        a: 1,
        panX: 0,
        panY: 0,
        panZ: 0,
      },
      500,
    )
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(setCamera)
    .start();
}
