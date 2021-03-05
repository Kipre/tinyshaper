import*as ui from './ui.js';
import*as surf from './surf.js';
import*as trid from './3d.js';

fetch('../board.json').then(res=>res.json()).then(board=>{
    let editorView = true;
    let stop;
    const logicBoard = new surf.Board(board);
    ui.setup(board, logicBoard);

    document.addEventListener('dimschange', ()=>{
        if (editorView) {
            logicBoard.initialize(board);
            ui.setup(board, logicBoard);
        } else {
            stop();
            logicBoard.initialize(board);
            stop = trid.show(logicBoard);
        }
    }
    );

    document.addEventListener('viewtoggle', ()=>{
        if (editorView) {
            document.dispatchEvent(new Event('pointselected'));
            logicBoard.initialize(board);
            stop = trid.show(logicBoard);
        } else {
            stop();
            ui.setup(board, logicBoard);
        }
        editorView ^= true;
    }
    );

}
)
