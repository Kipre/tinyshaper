const { abs, cos, sin, acos, atan2, atan, sqrt, pow, PI } = Math;

const listeners = [];
export const profiles = {};

addBoardChangeListener(() => {
    profiles.z = {
        width: board.length,
        height: board.width,
    };
    profiles.yUp = {
        width: board.length,
        height: -board.thickness,
    };
    profiles.x = {
        width: board.width,
        height: -board.thickness,
        half: true
    };
    profiles.x0 = {
        height: (evaluate(board.yDown, roots(board.yDown, {x: board.z[3].x})[0]) - evaluate(board.yUp, roots(board.yUp, {x: board.z[3].x})[0])) * board.thickness,
        width: board.z[3].y * board.width,
        half: true
    }
});

export function commitBoardChanges() {
    for (const listener of listeners) {
        listener(board);
    }
}

export function addBoardChangeListener(func) {
    listeners.push(func);
}

export const board = await (await fetch('board.json')).json();
commitBoardChanges();

const nbSlices=30, nbPoints=15;
const nbPointsPerSlice = nbPoints * 4 + 1;

const slices = Array.from({length: nbSlices}, (x, i) => (1 - cos(PI * (i / (nbSlices - 1))))/2);


/**
 * Cube root function yielding real roots
 */
function crt(v) {
  return v < 0 ? -pow(-v, 1 / 3) : pow(v, 1 / 3);
}


function inUnitInterval(t) {
    return 0 <= t && t <= 1;
}


/**
 * Find a t for a given x or y
 * https://github.com/Pomax/BezierInfo-2/blob/b479e2aa867d1321200951cc13a025a8701f94c6/docs/js/graphics-element/lib/bezierjs/bezier.js#L504 
 */
export function roots(points, {x, y}) {
    let target, pa, pb, pc, pd;
    if (x !== undefined) {
        [pa, pb, pc, pd] = points.map(({x, y}) => x);
        target = x;
    } else if (y !== undefined) {
        [pa, pb, pc, pd] = points.map(({x, y}) => y);
        target = y;
    } else {
        throw new Error('No target provided');
    }

    if (target === pa) return [0];
    if (target === pd) return [1];


    let d = -pa + 3 * pb - 3 * pc + pd,
    a = 3 * pa - 6 * pb + 3 * pc,
    b = -3 * pa + 3 * pb,
    c = pa - target;



    if (abs(d - 0) < 0.000001) {
      // this is not a cubic curve.
      if (abs(a - 0) < 0.000001) {
        // in fact, this is not a quadratic curve either.
        if (abs(b - 0) < 0.000001) {
          // in fact in fact, there are no solutions.
          return [];
      }
        // linear solution:
        return [-c / b].filter(inUnitInterval);
    }
      // quadratic solution:
      const q = sqrt(b * b - 4 * a * c),
      a2 = 2 * a;
      return [(q - b) / a2, (-b - q) / a2].filter(inUnitInterval);
  }

    // at this point, we know we need a cubic solution:

    a /= d;
    b /= d;
    c /= d;

    const p = (3 * b - a * a) / 3,
    p3 = p / 3,
    q = (2 * a * a * a - 9 * a * b + 27 * c) / 27,
    q2 = q / 2,
    discriminant = q2 * q2 + p3 * p3 * p3;

    let u1, v1, x1, x2, x3;
    if (discriminant < 0) {
      const mp3 = -p / 3,
      mp33 = mp3 * mp3 * mp3,
      r = sqrt(mp33),
      t = -q / (2 * r),
      cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
      phi = acos(cosphi),
      crtr = crt(r),
      t1 = 2 * crtr;
      x1 = t1 * cos(phi / 3) - a / 3;
      x2 = t1 * cos((phi + 2 * PI) / 3) - a / 3;
      x3 = t1 * cos((phi + 4 * PI) / 3) - a / 3;
      return [x1, x2, x3].filter(inUnitInterval);
  } else if (discriminant === 0) {
      u1 = q2 < 0 ? crt(-q2) : -crt(q2);
      x1 = 2 * u1 - a / 3;
      x2 = -u1 - a / 3;
      return [x1, x2].filter(inUnitInterval);
  } else {
      const sd = sqrt(discriminant);
      u1 = crt(-q2 + sd);
      v1 = crt(q2 + sd);
      return [u1 - v1 - a / 3].filter(inUnitInterval);
  }
}

export function evaluate([{x: x0, y: y0}, {x: x1, y: y1}, {x: x2, y: y2}, {x: x3, y: y3}], t) {
    const opp = 1 - t;
    const [a, b, c, d] = [opp ** 3, 3 * opp ** 2 * t, 3 * opp * t ** 2, t ** 3];
    const x = x0 * a + x1 * b + x2 * c + x3 * d;
    const y = y0 * a + y1 * b + y2 * c + y3 * d;
    return {x, y};
}

export function siblingPosition(self, parent, sibling, xFactor=1, yFactor=1) {
    const norm = sqrt((xFactor * (parent.x - sibling.x)) ** 2 + (yFactor * (parent.y - sibling.y)) ** 2);
    let alpha = 0;
    if (abs(self.y - parent.y) > 0.00001) {
        alpha = -atan((xFactor * (self.x - parent.x)) / (yFactor * (self.y - parent.y))) + PI / 2;
    } else if (self.x > parent.x) {
        alpha += PI;
    }
    if (self.y > parent.y) {
        alpha += PI;
    }
    return {x: (norm / xFactor) * cos(alpha) + parent.x, y: (norm / yFactor) * sin(alpha) + parent.y};
}



function getY(points, x) {
    return evaluate(points, roots(points, {x})[0]).y;
}

function projectSegment(points) {
    const result = [];
    const step = 1/nbPoints;
    for (let t=0; t + (step / 2) < 1; t += step) {
        result.push(evaluate(points, t));
    }
    return result;
}


function project(points) {
    const result = [];
    const {length} = points;
    for (let i = 0; i < length - 1; i+=3) {
        result.push(...projectSegment(points.slice(i)))
    }
    result.push(points.at(-1));
    return result;
}


export function getPositions(attribute) {
    let positions;
    if (!attribute) {
        positions = new Float32Array(nbPointsPerSlice * nbSlices * 3);
    } else {
        positions = attribute.array;
    }


    const xRatio = board.width / board.length,
        yRatio = board.thickness / board.length;

    const xTail = project(board.x0);
    const xMiddle = project(board.x);

    let middle = board.z[6].x;
    const tail = board.z[3].x;

    let cut, zStart, idx = 0;
    
    for (const x of slices) {
        if (x <= tail) {
            cut = xTail;
            zStart = 0;
        } else if (x >= middle) {
            cut = xMiddle;
            zStart = 6;
        } else {
            const t = (tail - x) / (tail - middle);
            cut = xMiddle.map((p, i) => ({
                x: (1 - t) * xTail[i].x + t * p.x,
                y: (1 - t) * xTail[i].y + t * p.y,
            }));
            zStart = 3;
        }

        const width = getY(board.z.slice(zStart), x);
        const yStart = x < 0.5 ? 0 : 3;
        let zPosition = getY(board.yDown.slice(yStart), x);
        const thickness = getY(board.yUp.slice(yStart), x) - zPosition;

        const xFactor = xRatio * width;
        const yFactor = yRatio * thickness;
        zPosition *= yRatio;

        const currentX = 0.5 - x;
        const end = idx + 3* nbPointsPerSlice;
        let i = 0;
        while (idx < end) {
            const x = cut[i].x* xFactor,
                y = cut[i++].y* yFactor + zPosition;
            positions[idx++] = x;
            positions[idx++] = currentX;
            positions[idx++] = y;
        }
    }
    
    return positions;
}

export function getIndices() {
    const logitudinal = nbSlices - 1;
    const perpendicular = nbPointsPerSlice - 1;
    
    const indices = new Uint16Array(logitudinal * perpendicular * 6);

    let idx = 0;
    for (let s=0; s<logitudinal; s++) {
        for (let p=0; p<perpendicular; p++) {

            const point = s * nbPointsPerSlice + p;
            const nextPoint = point + 1;
            const pointInNextSlice = point + nbPointsPerSlice;

            indices[idx++] = point;
            indices[idx++] = pointInNextSlice;
            indices[idx++] = nextPoint;
            indices[idx++] = nextPoint;
            indices[idx++] = pointInNextSlice;
            indices[idx++] = pointInNextSlice + 1;
        }
    }
    return indices;
}
