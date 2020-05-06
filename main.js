var board = JSON.parse('{"y": [[0, 1.2899999999999996, 0, 1, 7],[0.22, 1.1499999999999995, 1, 1, -1],[0.32999999999999996, 0.9000000000000005, 1, 1, -2],[0.5, 1.0000000000000004, 0, 0, 6],[0.79, 1.0700000000000005, 1, 1, -1],[0.94, 1.1811111111111112, 1, 1, -2],[1, 1.8711111111111112, 0, 1, 5],[1, 1.6700000000000002, 0, 1, 3],[0.95, 0.5900000000000001, 1, 1, -1],[0.78, 0.1, 1, 1, -2],[0.5, 0, 0, 0, 4],[0.2, 0.24, 1, 1, -1],[0.13, 0.6258333333333338, 1, 1, -2],[0, 0.9758333333333338, 0, 1, 0]    ],    "x": [[0, 1.0000000000000004, 0, 0, 6],[0.4866666666666667, 0.9747222222222227, 1, 1, -1],[0.8322222222222223, 0.7276851851851853, 1, 1, -2],[0.9088888888888889, 0.6194444444444446, 1, 1, 8],[0.9677777777777777, 0.5491203703703705, 1, 1, -1],[0.9999999999999999, 0.3858796296296297, 1, 1, -2],[0.9999999999999999, 0.24263888888888893, 0, 1, 2],[0.9977777777777777, 0.10361111111111113, 1, 1, -1],[0.98, 0.025601851851851924, 1, 1, -2],[0.9533333333333335, -0.04472222222222234, 1, 1, 9],[0.8433333333333334, -0.04472222222222234, 1, 1, -1],[0.37, 0, 1, 1, -2],[0, 0, 0, 0, 4]    ],    "x0": [[0, 1, 0, 0, 10],[0.37, 1, 1, 1, -1],[0.8377777777777778, 0.8659259259259259, 1, 1, -2],[0.92, 0.6900925925925926, 1, 1, 11],[0.9877777777777778, 0.5579629629629631, 1, 1, -1],[1, 0.38999999999999996, 1, 1, -2],[1, 0.23000000000000004, 0, 1, 1],[1, 0.13000000000000003, 1, 1, -1],[1.0022222222222221, 0.07842592592592605, 1, 1, -2],[0.9988888888888888, 0, 1, 1, 12],[0.7988888888888888, 0, 1, 1, -1],[0.18, 0, 1, 1, -2],[0, 0, 0, 0, 13]    ],    "z": [[0, 0, 0, 0, 0],[0, 0.21673992673992679, 1, 1, -1],[0.026666666666666672, 0.36978021978021974, 1, 1, -2],[0.06, 0.4925274725274724, 1, 1, 1],[0.10222222222222223, 0.6610622710622709, 1, 1, -1],[0.2811111111111111, 1.0183150183150182, 1, 1, -2],[0.5, 0.9999999999999999, 0, 0, 2],[0.7433333333333333, 0.9725274725274724, 1, 1, -1],[0.9733333333333334, 0.717985347985348, 1, 1, -2],[1, 0, 0, 0, 3]    ],    "length": 225,    "width": 27.3,    "thickness": 7.2,    "cut_x0": 0.2,    "cut_x": 0.5}');

var rBoard = new Board(board);

var disp = new CvsRedactor(rBoard);

ReactDOM.render(React.createElement(DimsForm, {length: 40}), document.getElementById('controls'));