import*as ui from './ui.js';
import*as surf from './surf.js';
import*as trid from './3d.js';

const res = await fetch('board.json')
const board = await res.json();
const logicBoard = new surf.Board(board);
ui.setup(board, () => trid.display3D(new surf.Board(board)));
trid.display3D(logicBoard);

