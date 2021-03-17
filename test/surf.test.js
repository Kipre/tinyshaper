import bro from './brotest/brotest.js';
import {P, BezierPath, BezierCurve, Board, v3} from '../js/surf.js';

const p1 = new P({x:1, y:2});
const p2 = new P({x:3, y:4});

bro.test('adds two points', () => {
  bro.expect(p1.add(p2)).toEqual(P.fromPair(4, 6));
});

bro.describe('v3 opps', () => {
    bro.test('add', () => {
      bro.expect(v3.add([1, 2, 3], [3, 5.3, 4])).toEqual([4, 7.3, 7]);
      bro.expect(v3.add([0, 0, 0.5], [-1, 3, -4])).toEqual([-1, 3, -3.5]);
    });

    bro.test('sub', () => {
      bro.expect(v3.sub([1, 2, 3], [3, 5.3, 4])).toEqual([-2, -3.3, -1]);
      bro.expect(v3.sub([0, 0, 0.5], [-1, 3, -4])).toEqual([1, -3, 4.5]);
    });

    bro.test('norm', () => {
      bro.expect(v3.norm([0, 0, 0])).toEqual(0);
      bro.expect(v3.norm([1, 0, 0])).toEqual(1);
      bro.expect(v3.norm([1, 1, 1])).toEqual(3);
      bro.expect(v3.norm([2, -1, 1])).toEqual(6);
      bro.expect(v3.norm([2, 0.5, 1])).toEqual(5.25);
    });
});

