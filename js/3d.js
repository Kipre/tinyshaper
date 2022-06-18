import * as THREE from "three";
import * as TWEEN from "tween";
import { TrackballControls } from "TrackballControls";
import * as surf from './surf.js';
import {config} from './ui.js';

export const coords = {
    top: {profile: 'z', x: 0, y:0, z: 5, xUp: 1, yUp: 0, zUp: 0, zoom: 1},
    side: {profile: 'yUp', x: -5, y:0, z: 0, xUp: 0, yUp: 0, zUp: 1, zoom: 1},
    front: {profile: 'x', x: 0, y:-5, z: 0, xUp: 0, yUp: 0, zUp: 1, zoom: 3},
};

const scene = new THREE.Scene();
const canvas = document.getElementById('threed');

const {x: pad, y: vert} = halves(canvas.offsetWidth, canvas.offsetHeight);

const camera = new THREE.OrthographicCamera( -pad, pad, vert, -vert, -1, 1000 );
camera.position.set(-1.5, -0.5, 1);
camera.up.set(0, 0, 1);

export const controls = new TrackballControls(camera, canvas);
controls.rotateSpeed = 2.0;
controls.zoomSpeed = 1.2;
controls.noPan = true;

const renderer = new THREE.WebGLRenderer({canvas, alpha: true});
renderer.setPixelRatio( window.devicePixelRatio );

const material = new THREE.MeshPhongMaterial();

const light = new THREE.PointLight();
light.position.set(10, 10, 10);
scene.add(light);

const light2 = new THREE.PointLight();
light2.position.set(-10, -10, -5);
scene.add(light2);

const ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

// const axesHelper = new THREE.AxesHelper( 1 );
// scene.add( axesHelper );

const geometry = new THREE.BufferGeometry();

export function display3D(position, indices, board) {
    // recompute the required zoom for the x profile
    const {length, width} = board;
    coords.front.zoom = length / width / 2;

    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geometry.setIndex(Array.from(indices));
    geometry.computeVertexNormals();


    const mesh = new THREE.Mesh(geometry, material);
    // const edges = new THREE.EdgesGeometry( geometry, 0 );
    // const mesh = new THREE.LineSegments(edges, material);
    // const mesh = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xFFFFFF, size: 1 }))
    scene.add(mesh);

    const other = new THREE.Mesh(geometry, material);
    // const other = new THREE.LineSegments(edges, material);
    other.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
    scene.add(other);

    onResize();
    animate();
}

export function getPositionsAttribute() {
    return geometry.getAttribute('position');
}

export function update() {
    geometry.getAttribute('position').needsUpdate = true;
}

function halves(width, height) {
    const x = 0.5 * (1 + config.padding / (width / 2 - config.padding));
    const y = height * x / width;
    return {x, y};
}

function onResize() {
    const parent = document.querySelector('.content');
    const width = parent.offsetWidth,
        height = parent.offsetHeight;
    renderer.setSize(width, height);

    const {x: pad, y: vert} = halves(width, height);

    camera.left = - pad;
    camera.right = pad;
    camera.top = vert;
    camera.bottom = - vert;
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
        x: camera.position.x, y: camera.position.y, z: camera.position.z,
        xUp: camera.up.x, yUp: camera.up.y, zUp: camera.up.z, zoom: camera.zoom
    };
}

function setCamera({x, y, z, xUp, yUp, zUp, zoom, a}) {
    camera.position.set(x, y, z);
    camera.up.set(xUp, yUp, zUp);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
    controls.update();
    if (a >= 0)
        document.documentElement.style.setProperty('--svg-opacity', a);
}

export function tweenCameraTo(destination) {
    return new TWEEN.Tween({...getCoords(camera), a: -2})
      .to({...destination, a: 1}, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(setCamera)
      .start();
}

export function alreadyWellOriented(destination) {
    const actualPositions = getCoords(camera);
    for (const axis in destination)
        if (actualPositions[axis] - destination[axis] > 10e-20)
            return false;
    return true;
}

window.addEventListener('resize', onResize);
