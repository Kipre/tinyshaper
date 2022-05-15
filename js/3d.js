import*as surf from './surf.js';
import {TrackballControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/TrackballControls.js';

const scene = new THREE.Scene();
const canvas = document.getElementById('threed');
const camera = new THREE.PerspectiveCamera(75,canvas.offsetWidth / canvas.offsetHeight,0.1,100);
const controls = new TrackballControls(camera,canvas);

const renderer = new THREE.WebGLRenderer({
    canvas
});

const material = new THREE.MeshPhongMaterial();

const light = new THREE.PointLight();
light.position.set(10, 10, 10);
scene.add(light);

const light2 = new THREE.PointLight();
light2.position.set(-10, -10, -5);
scene.add(light2);

const ambient = new THREE.AmbientLight(0x404040);
// soft white ambient
scene.add(ambient);

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

    init();
    animate();
}

function init() {
    const parent = document.querySelector('.content');
    const width = parent.offsetWidth;
    const height = parent.offsetHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.up = new THREE.Vector3(1,0,0);
    camera.position.set(0, 0, 560 / width);
    camera.updateProjectionMatrix();
    controls.update();
}

window.addEventListener('resize', init);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
