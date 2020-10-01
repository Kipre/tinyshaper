class P {
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

    at(i) {
        return [this.x, this.y][i];
    }

}


class BezierCurve {

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

    project(nbPoints = 50) {
        return [...Array(nbPoints)].map((e, i) => this.evaluate(i / nbPoints));
    }

    get points() {
        return [this.a, this.b, this.c, this.d];
    }

    /** Dichotomic search */
    getT(x, axis = 0, precision = 0.001) {
        let [l, h] = [0, 1];
        let m, em, el, eh = 0;
        el = this.evaluate(l).at(axis) - x;
        while (Math.abs(l - h) > precision) {
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


class BezierPath {

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

    get(x, axis = 0) {
        const [curve, ] = this.containingCurve(x, axis);
        const t = curve.getT(x, axis);
        return curve.evaluate(t)
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

    project(nbPoints = 10) {
        var result = [];
        this.curves.forEach((curve) => {
            result.push(...curve.project(nbPoints))
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
        this.yUp = new BezierPath(board['y'].slice(0, 7));
        this.yDown = new BezierPath(board['y'].reduce(
            (acc, ele) => { acc.unshift(ele); return acc }, []
        ).slice(0, 7));
        this.z = new BezierPath(board['z']);
        this.length = board['length'];
        this.width = board['width'];
        this.thickness = board['thickness'];
        this.x_cut = board['z'][6].x;
        this.x0_cut = board['z'][3].x;
        this.continuity = board['continuity'];

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
        return (1 - Math.cos(Math.PI * x))/2
    }
    
    get3d(slices=30, nbPoints=15) {
        let points;

        const xs = Array.from({length: slices}, (x, i) => this.distribute(i/(slices - 1)));
        
        const normal = [],
            indices = [],
            position = [];

        const allPoints = [];
        for (const x of xs) {
            points = this.getFullCut(x).project(nbPoints);
            allPoints.push(...points.map((p) => [p.x, p.y, x]));
        }
        const nbPointsPerSlice = points.length;
        for (const p of allPoints) {
            const [a, b, c] = p;
            position.push(a * this.width, b * this.thickness, c * this.length - this.length / 2);
        }
        
        let i, j, k;
        for (let slice=0; slice<slices-1; slice++) {
            for (let n=1; n<=nbPointsPerSlice; n++) {
                const m = (n != nbPointsPerSlice)? n+1 : 1;
                indices.push(i = n + nbPointsPerSlice * slice,
                             k = n + nbPointsPerSlice * (slice + 1) , 
                             j = m + nbPointsPerSlice * slice);
                indices.push(m + nbPointsPerSlice * slice, 
                             n + nbPointsPerSlice * (slice + 1), 
                             m + nbPointsPerSlice * (slice + 1));
                const a = position.slice(i*3, i*(3 + 1));
                const b = position.slice(j*3, j*(3 + 1));
                const c = position.slice(k*3, k*(3 + 1));
                const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
                const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
                normal.push(u[1]*v[2] - u[2]*v[1],
                            u[0]*v[2] - u[2]*v[0],
                            u[0]*v[1] - u[1]*v[0]);
            }
        }



        return {
            indices: indices, 
            position: position, 
            normal:normal
        };
    }

    getOBJ(slices=30, nbPoints=15) {

        const xs = Array.from({length: slices}, (x, i) => this.distribute(i/(slices - 1)));
        
        let result = 'o board',
            verticles = '\n',
            indexes = '\n',
            points;

        const allPoints = []
        for (const x of xs) {
            points = this.getFullCut(x).project(nbPoints);
            allPoints = [...allPoints, ...points.map((p) => [p.x, p.y, x])]
        }
        const nbPointsPerSlice = points.length;
        for (const p of allPoints) {
            const [a, b, c] = p;
            verticles += `\nv ${(a * this.width).toFixed(10)} ${(b * this.thickness).toFixed(10)} ${(c * this.length).toFixed(10)}`;
        }

        for (let slice=0; slice<slices-1; slice++) {
            for (let i=1; i<=nbPointsPerSlice; i++) {
                const n = i;
                const m = (n != nbPointsPerSlice)? n+1 : 1;
                indexes += ` \nf ${n + nbPointsPerSlice * slice} ${m + nbPointsPerSlice * slice} ${n + nbPointsPerSlice * (slice + 1)}`;
                indexes += ` \nf ${m + nbPointsPerSlice * slice} ${n + nbPointsPerSlice * (slice + 1)} ${m + nbPointsPerSlice * (slice + 1)}`;
            }
        }

        return result + verticles + indexes;
    }
}

if ((typeof process !== 'undefined') && (process.release.name === 'node')) {
    module.exports.P = P;
    module.exports.BezierPath = BezierPath;
    module.exports.BezierCurve = BezierCurve;
    module.exports.Board = Board;
}