import*as ui from './ui.js';
import*as surf from './surf.js';
import*as trid from './3d.js';

const svg = document.getElementById('vis');
const canvas = document.getElementById('threed');

const res = await fetch('board.json')
const board = await res.json();
const logicBoard = new surf.Board(board);

function update() {
    trid.display3D(new surf.Board(board));
}

ui.setup(board, update, 'z');
trid.display3D(logicBoard);


const showSvg = () => {
    document.documentElement.style.setProperty('--svg-opacity', 0);
    svg.classList.remove('hidden');
}
const hideSvg = () => svg.classList.add('hidden');


const [top, side, bottom] = document.getElementById('positions').children;

function moveTo({profile, ...destination}) {
    if (trid.alreadyWellOriented(destination)) return;
    trid.controls.removeEventListener('change', hideSvg);
    ui.setup(board, update, profile);
    showSvg();
    trid.tweenCameraTo(destination)
        .onComplete(() => trid.controls.addEventListener('change', hideSvg, {once: true}));
}

top.addEventListener('click', () => moveTo(trid.coords.top));
side.addEventListener('click', () => moveTo(trid.coords.side));
bottom.addEventListener('click', () => moveTo(trid.coords.bottom));
