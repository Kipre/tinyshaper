import bro from './brotest/brotest.js';
import {P, BezierPath, BezierCurve, Board, v3, roots, siblingPosition} from '../js/surf.js';

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
});

bro.describe('finds roots', () => {

  bro.test('simple cases', () => {
    bro.expect(roots([{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}], {y: 1.5})).toEqual([0.5]);
    bro.expect(roots([{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 3}, {x: 0, y: 4}], {y: 1})).toEqual([0.2725479543882378]);
    bro.expect(roots([{x: 1, y: 0}, {x: 2, y: 1}, {x: 3, y: 3}, {x: 4, y: 4}], {y: 1})).toEqual([0.2725479543882378]);
    bro.expect(roots([{x: 0, y: 0}, {x: 1, y: 1}, {x: 3, y: 3}, {x: 4, y: 4}], {x: 1})).toEqual([0.2725479543882378]);
  });

  bro.test('more involved ones', () => {
    bro.expect(roots([{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 1}, {x: 3, y: 0}], {x: 0.5})).toEqual([0.16666666666666666]);
    bro.expect(roots([{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: -1}, {x: 1, y: 0}], {y: 0})).toEqual([1, 0.4999999999999999]);
    bro.expect(roots([{x: 0, y: 0}, {x: 1, y: 0}, {x: -1, y: 1}, {x: 0, y: 1}], {x: 0})).toEqual([1, 0.4999999999999999]);
    bro.expect(roots([{x: -0.1, y: 0}, {x: 1, y: 0}, {x: -1, y: 1}, {x: 0.2, y: 1}], {x: 0})).toEqual([0.933000169651692,0.03337036105888136,0.5098199454799027]);
  })
});


bro.test('sibling position', () => {
  bro.expect(siblingPosition({x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0})).toEqual({x: 0, y: 0});
  bro.expect(siblingPosition({x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0})).toEqual({x: 2, y: 0});
  bro.expect(siblingPosition({x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2})).toEqual({x: 6.123233995736766e-17, y: 2});
  bro.expect(siblingPosition({x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0})).toEqual({x: -1.8369701987210297e-16, y: -1});
  bro.expect(siblingPosition({x: 0.1, y: 1}, {x: 0, y: 0}, {x: 1, y: 0})).toEqual({x: -0.09950371902099893, y:-0.9950371902099892});
  bro.expect(siblingPosition({x: -1, y: 0}, {x: 0, y: 0}, {x: 0, y: 1})).toEqual({x: 1, y: 0});
  bro.expect(siblingPosition({x: 1, y: 0}, {x: 0, y: 0}, {x: 0, y: 1})).toEqual({x: -1, y: 1.2246467991473532e-16});
});

