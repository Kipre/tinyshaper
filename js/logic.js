import*as ui from './ui.js';
import*as surf from './surf.js';
import*as trid from './3d.js';

const board = JSON.parse('{"y": [{"x": 0,"y": 1.2899999999999994,"freedomX": 0,"freedomY": 1,"number": 7,"continuity": false},{"x": 0.22,"y": 1.1499999999999992,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 0.30100303150125207,"y": 0.9411888757084487,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 0.5,"y": 1.0000000000000002,"freedomX": 0,"freedomY": 0,"number": 6,"continuity": false},{"x": 0.7899956827614031,"y": 1.0857046831997414,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 0.94,"y": 1.181111111111111,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 1,"y": 1.871111111111112,"freedomX": 0,"freedomY": 1,"number": 5,"continuity": false},{"x": 1,"y": 1.67,"freedomX": 0,"freedomY": 1,"number": 3,"continuity": false},{"x": 0.95,"y": 0.5899999999999995,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 0.7800181867458014,"y": 0.007334874530120277,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 0.5,"y": 0,"freedomX": 0,"freedomY": 0,"number": 4,"continuity": false},{"x": 0.2276789244760775,"y": -0.007133254250691643,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 0.13,"y": 0.6258333333333332,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 0,"y": 0.9758333333333337,"freedomX": 0,"freedomY": 1,"number": 0,"continuity": false}],"x": [{"x": 0,"y": 1.0000000000000004,"freedomX": 0,"freedomY": 0,"number": 6,"continuity": false},{"x": 0.4866666666666667,"y": 0.9747222222222227,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 0.8322222222222223,"y": 0.7276851851851853,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 0.9088888888888889,"y": 0.6194444444444446,"freedomX": 1,"freedomY": 1,"number": 8,"continuity": false},{"x": 0.9677777777777777,"y": 0.5491203703703705,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 0.9999999999999999,"y": 0.3858796296296297,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 0.9999999999999999,"y": 0.24263888888888893,"freedomX": 0,"freedomY": 1,"number": 2,"continuity": false},{"x": 0.9977777777777777,"y": 0.10361111111111113,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 0.98,"y": 0.025601851851851924,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 0.9533333333333335,"y": -0.04472222222222234,"freedomX": 1,"freedomY": 1,"number": 9,"continuity": false},{"x": 0.8433333333333334,"y": -0.04472222222222234,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 0.37,"y": 0,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 0,"y": 0,"freedomX": 0,"freedomY": 0,"number": 4,"continuity": false}],"x0": [{"x": 0,"y": 1,"freedomX": 0,"freedomY": 0,"number": 10,"continuity": false},{"x": 0.37,"y": 1,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 0.8377777777777778,"y": 0.8659259259259259,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 0.92,"y": 0.6900925925925926,"freedomX": 1,"freedomY": 1,"number": 11,"continuity": false},{"x": 0.9877777777777778,"y": 0.5579629629629631,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 1,"y": 0.38999999999999996,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 1,"y": 0.23000000000000004,"freedomX": 0,"freedomY": 1,"number": 1,"continuity": false},{"x": 1,"y": 0.13000000000000003,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 1.0022222222222221,"y": 0.07842592592592605,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 0.9988888888888888,"y": 0,"freedomX": 1,"freedomY": 1,"number": 12,"continuity": false},{"x": 0.7988888888888888,"y": 0,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 0.18,"y": 0,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 0,"y": 0,"freedomX": 0,"freedomY": 0,"number": 13,"continuity": false}],"z": [{"x": 0,"y": 0,"freedomX": 0,"freedomY": 0,"number": 0,"continuity": false},{"x": 0,"y": 0.2167399267399267,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 0.026666666666666672,"y": 0.3697802197802199,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 0.06,"y": 0.4925274725274724,"freedomX": 1,"freedomY": 1,"number": 1,"continuity": false},{"x": 0.10222222222222223,"y": 0.6610622710622711,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 0.2811111111111111,"y": 1.0183150183150182,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 0.5,"y": 0.9999999999999999,"freedomX": 1,"freedomY": 0,"number": 2,"continuity": false},{"x": 0.7433333333333333,"y": 0.9725274725274724,"freedomX": 1,"freedomY": 1,"number": -1},{"x": 0.9733333333333334,"y": 0.717985347985348,"freedomX": 1,"freedomY": 1,"number": -2},{"x": 1,"y": 0,"freedomX": 0,"freedomY": 0,"number": 3,"continuity": false}],"length": 170,"width": 25,"thickness": 6}');

let editorView = true;
var stop;
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
});

document.getElementById('view').onclick = ()=>{
    if (editorView) {
        logicBoard.initialize(board);
        stop = trid.show(logicBoard);
    } else {
        stop();
        ui.setup(board, logicBoard);
    }
    editorView ^= true;
}

ui.svg(document.getElementById('controls'))