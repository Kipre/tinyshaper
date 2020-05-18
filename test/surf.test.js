const P = require('../lib/surf').P;

var p1 = new P(1, 2, 1, 1, 4)
var p2 = new P(3, 4, 1, 1, 5)

test('adds two points', () => {
  expect(p1.add(p2).dest).toStrictEqual([4, 6]);
});