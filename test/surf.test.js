import bro from './brotest/brotest.js';
import {P, BezierPath, BezierCurve, Board} from '../js/surf.js';

const p1 = new P({x:1, y:2});
const p2 = new P({x:3, y:4});

bro.test('adds two points', () => {
  bro.expect(p1.add(p2)).toEqual(P.fromPair(4, 6));
});

