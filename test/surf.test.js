const P = require('../lib/surf').P;
const BezierPath = require('../lib/surf').BezierPath;
const BezierCurve = require('../lib/surf').BezierCurve;
const Board = require('../lib/surf').Board;

var p1 = new P(1, 2, 1, 1, 4)
var p2 = new P(3, 4, 1, 1, 5)

var c1 = new BezierCurve([[0, 1.2899999999999996, 0, 1, 7],
                          [0.22, 1.1499999999999995, 1, 1, -1],
                          [0.32999999999999996, 0.9000000000000005, 1, 1, -2],
                          [0.5, 1.0000000000000004, 0, 0, 6]])

var board = require('../boardd.json')

var rBoard = new Board(board);

test('adds two points', () => {
  expect(p1.add(p2).dest).toStrictEqual([4, 6]);
});

test('reverse bezier curve', () => {
  expect(c1.reversed().dest).toStrictEqual([[0.5, 1.0000000000000004],
                                            [0.32999999999999996, 0.9000000000000005],
                                            [0.22, 1.1499999999999995],
                                            [0, 1.2899999999999996]]);
});
