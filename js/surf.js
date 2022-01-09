const { abs, cos, sin, acos, atan2, atan, sqrt, pow, PI } = Math;

export const v3 = (function() {
    return {
        sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
        add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
        norm: (a) => {
            const norm = sqrt(a.map(e => e**2).reduce((a, b) => a+b));
            return a.map(e => e/norm);
        },
        cross: (a, b) => [a[1]*b[2] - a[2]*b[1],
                          a[0]*b[2] - a[2]*b[0],
                          a[0]*b[1] - a[1]*b[0]]
    };
})();

export class P {
    x = 0;
    y = 0;

    constructor(props) {
        this.x = props.x;
        this.y = props.y;
        if (this.y === undefined) {
            throw new Error('bad construction');
        }
    }

    static fromPair(a, b) {
        return new P({x: a, y: b});
    }

    add(other) {
        return new P({x: this.x + other.x, y: this.y + other.y});
    }

    mul(scalar) {
        return new P({x: this.x * scalar, y: this.y * scalar});
    }

    mulPair(a, b) {
        return new P({x: this.x * a, y: this.y * b});
    }

    norm() {
        return sqrt(this.x**2 + this.y**2);
    }

    at(i) {
        return [this.x, this.y][i];
    }

}


export class BezierCurve {

    constructor(points) {
        this.a = new P(points[0]);
        this.b = new P(points[1]);
        this.c = new P(points[2]);
        this.d = new P(points[3]);
    }

    evaluate(t) {
        const opp = 1 - t;
        let acc = this.a.mul(opp ** 3); // As for accumulator
        acc = acc.add(this.b.mul(3 * opp ** 2 * t));
        acc = acc.add(this.c.mul(3 * opp * t ** 2));
        acc = acc.add(this.d.mul(t ** 3));
        return acc;
    }

    project(nbPoints = 50, normal = false) {
        return [...Array(nbPoints)].map((e, i) => {
            const p = this.evaluate(i / nbPoints);
            return normal? [p, this.normal(i / nbPoints)]: p;
        });
    }

    normal(t) {
        const opp = 1 - t;
        let acc = this.b.add(this.a.mul(-1)).mul(3*opp*opp);
        acc = acc.add(this.c.add(this.b.mul(-1)).mul(6*t*opp));
        acc = acc.add(this.d.add(this.c.mul(-1)).mul(3*t*t));
        return P.fromPair(-acc.y, acc.x).mul(1/acc.norm());
    }

    get points() {
        return [this.a, this.b, this.c, this.d];
    }

    /** Dichotomic search */
    getT(x, axis = 0, precision = 0.001) {
        let [l, h] = [0, 1];
        let m, em, el, eh = 0;
        el = this.evaluate(l).at(axis) - x;
        while (abs(l - h) > precision) {
            m = (l + h) / 2;
            em = this.evaluate(m).at(axis) - x;
            if (em * el > 0) {
                l = m;
                el = em;
            } else {
                h = m;
                eh = em
            }
        }
        return m;
    }

    split(t, axis = 0) {
        const pos = (t, a, b) => a.mul(t).add(b.mul(1 - t))
        const b12 = pos(t, this.b, this.c)
        const b11 = pos(t, this.a, this.b)
        const b13 = pos(t, this.c, this.d)
        const b22 = pos(t, b11, b12)
        const b23 = pos(t, b12, b13)
        const b33 = pos(t, b22, b23)
        return [new BezierCurve([this.a, b11, b22, b33]), new BezierCurve([b33, b23, b13, this.d])]
    }

    isIn(x, axis = 0) {
        if ((this.a.at(axis) <= x) & (this.d.at(axis) >= x)) {
            return true;
        } else if ((this.a.at(axis) >= x) & (this.d.at(axis) <= x)) {
            return true;
        } else {
            return false;
        }
    }

    reversed() {
        return new BezierCurve([this.d, this.c, this.b, this.a]);
    }
}


export class BezierPath {

    curves = [];
    index = 0;

    constructor(points=[]) {
        let a, b, c;
        while (points.length > 1) {
            [a, b, c, ...points] = points
            this.curves.push(new BezierCurve([a, b, c, points[0]]));
        }
    }

    containingCurve(x, axis) {
        for (const [i, curve] of this.curves.entries()) {
            if (curve.isIn(x, axis)) return [curve, i];
        }
        throw new Error('Containing curve not found');}

    get(x, axis = 0, normal = false) {
        const [curve, ] = this.containingCurve(x, axis);
        const t = curve.getT(x, axis);
        return normal? curve.normal(t): curve.evaluate(t);
    }

    addPoint(x, axis = 0) {
        const [curve, i] = this.containingCurve(x, axis);
        this.curves.splice(i, 1);
        const t = curve.getT(x, axis);
        const [c1, c2] = curve.split(1 - t, axis);
        this.curves.splice(i, 0, c1, c2);
    }

    get points() {
        var result = [...this.curves[0].points];
        for (var i = 1; i < this.curves.length; i++) {
            const [w, x, y, z] = this.curves[i].points;
            result.push(x, y, z);
        }
        return result;
    }

    project(nbPoints = 10, normal = false) {
        var result = [];
        this.curves.forEach((curve) => {
            result.push(...curve.project(nbPoints, normal))
        });
        return result;
    }

    intercalate(factors, other) {
        // Sanity checks 
        console.assert(this.curves.length == other.curves.length);
        console.assert(factors.length == this.curves.length + 1);
        
        const a = this.points,
              b = other.points;
        // Make factors array [f1, f2, f3] -> [f1, f1, f2, f2, f2, f3, f3]
        const factorsArray = factors.reduce((r, e) => r.push(e, e, e) && r, []).slice(1, -1);
        // Compute the weighted middles
        const inBetween = factorsArray.map((e, i) => a[i].mul(1 - e).add(b[i].mul(e)));
        return new BezierPath(inBetween);
    }

    intercalateZero(factors, axis = 1) {
        const other = new BezierPath(this.points.map((p) => {
            const multipliers = [1, 1];
            multipliers[axis] = 0;
            return p.mulPair(...multipliers);
        }));
        return other.intercalate(factors, this);
    }

    reversed() {
        var newPath = new BezierPath();
        newPath.curves = this.curves.reduce((acc, ele) => { acc.unshift(ele.reversed()); return acc }, []);
        return newPath;
    }

    concatenate(other) {
        const result = new BezierPath([])
        result.curves = [...this.curves]
        const beginning = this.curves[this.curves.length - 1].d
        const end = other.curves[0].a
        result.curves.push(new BezierCurve([beginning, beginning, end, end]), ...other.curves)
        return result
    }
}

export class Board {

    constructor(board) {
        this.initialize(board);
    }

    initialize(board) {
        this.board = board;
        this.x = new BezierPath(board['x']);
        this.x0 = new BezierPath(board['x0']);
        this.yUp = new BezierPath(board['yUp']);
        this.yDown = new BezierPath(board['yDown']);
        this.z = new BezierPath(board['z']);
        this.length = board['length'];
        this.width = board['width'];
        this.thickness = board['thickness'];
        this.x_cut = board['z'][6].x;
        this.x0_cut = board['z'][3].x;

        this.yUp.addPoint(this.x0_cut);
        this.yDown.addPoint(this.x0_cut);

        const x0 = this.x0.points;
        const x = this.x.points;

        this.y_paths = x
            .map((p, i)=>[x0[i].y, x0[i].y, p.y, p.y])
            .map((factors) => this.yDown.intercalate(factors, this.yUp));

        this.z_paths = x
            .map((p, i)=>[x0[i].x, x0[i].x, p.x, p.x])
            .map((factors) => this.z.intercalateZero(factors));
    }

    get y() {
        return this.yUp.concatenate(this.yDown.reversed())
    }

    get x0Thickness() {
        return (this.yUp.curves[0].d.y - this.yDown.curves[0].d.y)*this.thickness
    }

    get x0Width() {
        return this.z.points[3].y*this.width;
    }

    getCut(x) {
        var result = [];
        for (var i = 0; i < this.x.points.length; i++) {
            const a = this.z_paths[i].get(x).y;
            const b = this.y_paths[i].get(x).y;
            result.push([a, b])
        }
        return new BezierPath(result)
    }

    getFullCut(x) {
        const result = [];
        for (var i = 0; i < this.x.points.length; i++) {
            result.push(P.fromPair(this.z_paths[i].get(x).y, this.y_paths[i].get(x).y))
        }
        for (var i = result.length - 2; i >= 0; i--) {
            result.push(result[i].mulPair(-1, 1))
        }
        return new BezierPath(result)
    }

    distribute(x) {
        return (1 - cos(PI * x))/2
    }
    
    get3d(nbSlices=30, nbPoints=15) {
        let points;

        const xs = Array.from({length: nbSlices}, (x, i) => this.distribute(i/(nbSlices - 1)));
        
        const normal = [],
            indices = [],
            position = [];
        
        for (const x of xs) {
            points = this.getFullCut(x).project(nbPoints);
            for (const p of points) {
                position.push([p.x* this.width, p.y* this.thickness, x* this.length - this.length / 2]);
            }
        }

        const fNormal = (a, b, c) => {
            const [u, v] = [v3.sub(position[b], position[a]),
                            v3.sub(position[c], position[b])];
            return v3.cross(u, v);
        }

        const nbPointsPerSlice = points.length;
        const lastBatchOfNormals = [];
        for (let s=0; s<nbSlices-1; s++) {
            for (let p=0; p<nbPointsPerSlice; p++) {
                const np = (p+1) % nbPointsPerSlice; // next point in the slice
                const [a, b, c, d] = [nbPointsPerSlice*s + p, nbPointsPerSlice*s + np, 
                                      nbPointsPerSlice*(s+1) + p, nbPointsPerSlice*(s+1) + np,]
                indices.push(a, c, d, a, d, b);
                normal.push(...fNormal(a, b, d));
                if (s == nbSlices-2) {
                    lastBatchOfNormals.push(...fNormal(a, d, c))
                }
            }
        }
        normal.push(...lastBatchOfNormals);
        
        return {
            indices: indices, 
            position: position.flat(), 
            normal: normal
        };
    }

    getOBJ(nbSlices=30, nbPoints=15, withNormals = true) {

        const arrays = this.get3d2(nbSlices, nbPoints);
                
        let result = 'o board',
            vertices = '\n',
            indexes = '\n',
            normals = '\n';

        const nbPts = ~~(arrays.position.length / 3)
        for (let k=0; k<nbPts; k++) {
            const [a, b, c] = [3*k, 3*k +1, 3*k + 2];
            vertices += `\nv ${(arrays.position[a]).toFixed(10)} ${(arrays.position[b]).toFixed(10)} ${(arrays.position[c]).toFixed(10)}`;
            normals += `\nvn ${(arrays.normal[a]).toFixed(10)} ${(arrays.normal[b]).toFixed(10)} ${(arrays.normal[c]).toFixed(10)}`;
        }
        const nbInd = ~~(arrays.indices.length / 3)
        for (let k=0; k<nbInd; k++) {
            const [a, b, c] = [arrays.indices[3*k] + 1, 
                               arrays.indices[3*k + 1] + 1,
                               arrays.indices[3*k + 2] + 1];
            indexes += withNormals? `\nf ${a}//${a} ${b}//${b} ${c}//${c}` : `\nf ${a} ${b} ${c}`;
        }
        return result + vertices + (withNormals? normals: '') + indexes;
    }
}

// cube root function yielding real roots
function crt(v) {
  return v < 0 ? -pow(-v, 1 / 3) : pow(v, 1 / 3);
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

    const inUnitInterval = t => 0 <= t && t <= 1;

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
