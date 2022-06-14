import*as ui from './ui.js';
import*as surf2 from './surf2.js';
import*as trid from './3d.js';

const {board} = surf2;

const svg = document.getElementById('vis');
const canvas = document.getElementById('threed');


function update() {
    surf2.getPositions(trid.getPositionsAttribute())
    trid.update();
}

ui.setup(board, update, 'z');
const positions = surf2.getPositions();
const indices = surf2.getIndices();
trid.display3D(positions, indices, board);


const showSvg = () => {
    document.documentElement.style.setProperty('--svg-opacity', 0);
    svg.classList.remove('hidden');
}
const hideSvg = () => {
    svg.classList.add('hidden');
    trid.controls.removeEventListener('change', hideSvg);
};


const [top, side, front] = document.getElementById('positions').children;

function moveTo({profile, ...destination}) {
    if (trid.alreadyWellOriented(destination)) return;
    trid.controls.removeEventListener('change', hideSvg);
    ui.setup(board, update, profile);
    showSvg();
    trid.tweenCameraTo(destination)
        .onComplete(() => trid.controls.addEventListener('change', hideSvg));
}

top.addEventListener('click', () => moveTo(trid.coords.top));
side.addEventListener('click', () => moveTo(trid.coords.side));
front.addEventListener('click', () => moveTo(trid.coords.front));
