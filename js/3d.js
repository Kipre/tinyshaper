import * as surf from './surf.js';
import {config} from './ui.js';
import * as THREE from "three";
import { TrackballControls } from 'https://unpkg.com/three@0.140.2/examples/jsm/controls/TrackballControls.js';


const scene = new THREE.Scene();
const canvas = document.getElementById('threed');

const {x: pad, y: vert} = halves(canvas.offsetWidth, canvas.offsetHeight);

const camera = new THREE.OrthographicCamera( -pad, pad, vert, -vert, -1, 1000 );
camera.position.set(1, 1, 1);

const controls = new TrackballControls(camera, canvas);
controls.rotateSpeed = 2.0;
controls.zoomSpeed = 1.2;
controls.noPan = true;

const renderer = new THREE.WebGLRenderer({canvas, alpha: true});

const material = new THREE.MeshPhongMaterial();

const light = new THREE.PointLight();
light.position.set(10, 10, 10);
scene.add(light);

const light2 = new THREE.PointLight();
light2.position.set(-10, -10, -5);
scene.add(light2);

const ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

const axesHelper = new THREE.AxesHelper( 1 );
scene.add( axesHelper );

let mesh;

export function display3D(board) {
    const {indices, position, normal} = board.get3d();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position,3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normal,3));
    geometry.setIndex(indices);

    if (mesh)
        scene.remove(mesh);

    mesh = new THREE.Mesh(geometry,material);
    scene.add(mesh);

    onResize();
    animate();
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

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', onResize);

const [top, side, bottom] = document.getElementById('positions').children;

top.addEventListener('click', () => {
    camera.position.set(0, 0, 5);
    camera.up.set(1, 0, 0)
    controls.update();
})

side.addEventListener('click', () => {
    camera.position.set(-5, 0, 0);
    camera.up.set(0, 0, 1);
    controls.update();
})
      
bottom.addEventListener('click', () => {
    camera.position.set(0, -5, 0);
    camera.up.set(0, 0, 1);
    controls.update();
})