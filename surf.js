class P {
    x = 0;
    y = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new P(this.x + other.x, this.y + other.y);
    }

    mul(scalar) {
        return new P(this.x * scalar, this.y * scalar);
    }

    print() {
        console.log(this.dest)
    }

    at(i) {
        if (i == 0) {
            return this.x;
        } else if (i == 1) {
            return this.y;
        } else {
            throw new Error("Axis out of bounds");
        }
    }

    get dest() {
        return [this.x, this.y]
    }

    assignAt(axis, val) {
        if (axis == 0) {
            this.x = val;
        } else if (axis == 1) {
            this.y = val;
        } else {
            throw new Error("Axis out of bounds");
        }
        return this;
    }


}


class BezierCurve {

    constructor(points) {
        this.a = new P(...points[0]);
        this.b = new P(...points[1]);
        this.c = new P(...points[2]);
        this.d = new P(...points[3]);
    }

    evaluate(t) {
        const opp = 1 - t;
        var accumulator = this.a.mul(opp ** 3);
        accumulator = accumulator.add(this.b.mul(3 * opp ** 2 * t));
        accumulator = accumulator.add(this.c.mul(3 * opp * t ** 2));
        accumulator = accumulator.add(this.d.mul(t ** 3));
        return accumulator;
    }

    project(nbPoints = 50) {
        var values = [];
        for (var k = 0; k < nbPoints; k++) {
            values.push(this.evaluate(k / nbPoints))
        }
        return values
    }

    get points() {
        return [this.a, this.b, this.c, this.d];
    }

    get dest() {
        return [this.a.dest, this.b.dest, this.c.dest, this.d.dest];
    }

    getT(x, axis = 0, precision = 0.001) {
        var [l, h] = [0, 1];
        var m, em, el, eh = 0;
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
        var pos = (t, a, b) => a.mul(t).add(b.mul(1 - t))
        const b12 = pos(t, this.b, this.c)
        const b11 = pos(t, this.a, this.b)
        const b13 = pos(t, this.c, this.d)
        const b22 = pos(t, b11, b12)
        const b23 = pos(t, b12, b13)
        const b33 = pos(t, b22, b23)
        return [new BezierCurve([this.a.dest, b11.dest, b22.dest, b33.dest]), new BezierCurve([b33.dest, b23.dest, b13.dest, this.d.dest])]
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

    plot(ctx) {
        ctx.beginPath();
        ctx.moveTo(...this.a.mul(500).dest);
        ctx.bezierCurveTo(...this.b.mul(500).dest, ...this.c.mul(500).dest, ...this.d.mul(500).dest);
        ctx.stroke();
    }
}


class BezierPath {

    curves = []

    constructor(points) {
        for (var i = 0; i < (points.length - 1) / 3; i++) {
            this.curves.push(new BezierCurve(points.slice(i * 3, (i + 1) * 3 + 1)))
        }
    }

    get(x, axis = 0) {
        var i = 0;
        while (i < this.curves.length) {
            if (this.curves[i].isIn(x, axis)) {
                break;
            }
            i++;
        }
        const t = this.curves[i].getT(x, axis);
        return this.curves[i].evaluate(t)
    }

    addPoint(x, axis = 0) {
        var i = 0;
        while (i < this.curves.length) {
            if (this.curves[i].isIn(x, axis)) {
                break;
            }
            i++;
        }
        var curve = this.curves[i];
        this.curves.splice(i, 1);
        const t = curve.getT(x, axis);
        var [c1, c2] = curve.split(1 - t, axis);
        this.curves.splice(i, 0, c1, c2);
    }

    get dest() {
        var result = [...this.curves[0].dest];
        for (var i = 1; i < this.curves.length; i++) {
            const [w, x, y, z] = this.curves[i].dest;
            result.push(x, y, z);
        }
        return result;
    }

    get points() {
        var result = [...this.curves[0].points];
        for (var i = 1; i < this.curves.length; i++) {
            const [w, x, y, z] = this.curves[i].points;
            result.push(x, y, z);
        }
        return result;
    }

    project(nbPoints=10) {
        var result = [];
        this.curves.forEach((curve) => {
            result.push(...curve.project(nbPoints))
        });
        return result;
    }

    intercalate(factors, other) {
        console.assert(this.curves.length == other.curves.length);
        console.assert(factors.length == this.curves.length + 1);

        const a = this.points;
        const b = other.points;
        var inBetween = []

        var factorsArray = [factors[0], factors[0]]
        var i;
        for (i = 1; i < factors.length - 1; i++) {
            factorsArray.push(factors[i], factors[i], factors[i])
        }
        factorsArray.push(factors[i], factors[i])

        for (i = 0; i < factorsArray.length; i++) {
            inBetween.push(a[i].mul(1 - factorsArray[i]).add(b[i].mul(factorsArray[i])).dest)
        }
        return new BezierPath(inBetween)
    }

    intercalateZero(factors, axis = 1) {
        var tmp = this.points;
        tmp = tmp.map((p) => {
            var a = p.dest;
            a[axis] = 0;
            return a;
        });
        var other = new BezierPath(tmp);
        return other.intercalate(factors, this);
    }

    plot(ctx) {
        this.curves.forEach((c) => c.plot(ctx))
    }
}

class Board {

    constructor(board) {
        this.x = new BezierPath(board['x'].map((p) => p.slice(0, 2)));
        this.x0 = new BezierPath(board['x0'].map((p) => p.slice(0, 2)));
        this.yUp = new BezierPath(board['y'].slice(0, 7).map((p) => p.slice(0, 2)));
        this.yDown = new BezierPath(board['y'].reverse().slice(0, 7).map((p) => p.slice(0, 2)));
        this.z = new BezierPath(board['z'].map((p) => p.slice(0, 2)));
        this.length = board['length'];
        this.width = board['width'];
        this.thickness = board['thickness'];
        this.x_cut = board['z'][6][0];
        this.x0_cut = board['z'][3][0];

        this.yUp.addPoint(this.x0_cut);
        this.yDown.addPoint(this.x0_cut);

        var y_factors = [];
        const x = this.x.dest;
        const x0 = this.x0.dest;
        for (var i = 0; i < x.length; i++) {
            const a = x[i][1];
            const b = x0[i][1];
            y_factors.push([b, b, a, a])
        }
        this.y_paths = y_factors.map((factors) => this.yDown.intercalate(factors, this.yUp));

        var z_factors = [];
        for (var i = 0; i < x.length; i++) {
            const a = x[i][0];
            const b = x0[i][0];
            z_factors.push([b, b, a, a])
        }
        this.z_paths = z_factors.map((factors) => this.z.intercalateZero(factors))
    }

    getCut(x) {
        var result = [];
        for (var i = 0; i < this.x.dest.length; i++) {
            const a = this.z_paths[i].get(x).at(1);
            const b = this.y_paths[i].get(x).at(1);
            result.push([a, b])
        }
        return new BezierPath(result)
    }

    getFullCut(x) {
        var result = [];
        for (var i = 0; i < this.x.dest.length; i++) {
            const a = this.z_paths[i].get(x).at(1);
            const b = this.y_paths[i].get(x).at(1);
            result.push([a, b])
        }
        for (var i = result.length-2; i >= 0 ; i--) {
            let [a, b] = result[i]
            result.push([-a, b])
        }
        return new BezierPath(result)
    }

    get3d(numDivisions=30) {
        const positions = [];
        const texcoords = [];
        const indices = [];

        var points = this.getFullCut(0.5).project()

        const quadsDown = points.length;

        // generate points
        for (let division = 0; division <= numDivisions; ++division) {
            const u = division / numDivisions;
            points = this.getFullCut(division/numDivisions).project()
            points.forEach((p, ndx) => {
                positions.push(p.x*this.width, p.y*this.thickness, division*this.length/numDivisions - this.length/2);
                // note: this V is wrong. It's spacing by ndx instead of distance along curve
                const v = ndx / quadsDown;
                texcoords.push(u, v); // v?
            });
        }

        // generate indices
        for (let division = 0; division < numDivisions; ++division) {
            const column1Offset = division * points.length;
            const column2Offset = column1Offset + points.length;
            for (let quad = 0; quad < quadsDown; ++quad) {
                indices.push(column1Offset + quad, column1Offset + quad + 1, column2Offset + quad);
                indices.push(column1Offset + quad + 1, column2Offset + quad + 1, column2Offset + quad);
            }
        }

        return {
            position: positions,
            texcoord: texcoords,
            indices: indices,
        };
    }
}

var board = JSON.parse('{"y": [[0, 1.2899999999999996, 0, 1, 7],[0.22, 1.1499999999999995, 1, 1, -1],[0.32999999999999996, 0.9000000000000005, 1, 1, -2],[0.5, 1.0000000000000004, 0, 0, 6],[0.79, 1.0700000000000005, 1, 1, -1],[0.94, 1.1811111111111112, 1, 1, -2],[1, 1.8711111111111112, 0, 1, 5],[1, 1.6700000000000002, 0, 1, 3],[0.95, 0.5900000000000001, 1, 1, -1],[0.78, 0.1, 1, 1, -2],[0.5, 0, 0, 0, 4],[0.2, 0.24, 1, 1, -1],[0.13, 0.6258333333333338, 1, 1, -2],[0, 0.9758333333333338, 0, 1, 0]    ],    "x": [[0, 1.0000000000000004, 0, 0, 6],[0.4866666666666667, 0.9747222222222227, 1, 1, -1],[0.8322222222222223, 0.7276851851851853, 1, 1, -2],[0.9088888888888889, 0.6194444444444446, 1, 1, 8],[0.9677777777777777, 0.5491203703703705, 1, 1, -1],[0.9999999999999999, 0.3858796296296297, 1, 1, -2],[0.9999999999999999, 0.24263888888888893, 0, 1, 2],[0.9977777777777777, 0.10361111111111113, 1, 1, -1],[0.98, 0.025601851851851924, 1, 1, -2],[0.9533333333333335, -0.04472222222222234, 1, 1, 9],[0.8433333333333334, -0.04472222222222234, 1, 1, -1],[0.37, 0, 1, 1, -2],[0, 0, 0, 0, 4]    ],    "x0": [[0, 1, 0, 0, 10],[0.37, 1, 1, 1, -1],[0.8377777777777778, 0.8659259259259259, 1, 1, -2],[0.92, 0.6900925925925926, 1, 1, 11],[0.9877777777777778, 0.5579629629629631, 1, 1, -1],[1, 0.38999999999999996, 1, 1, -2],[1, 0.23000000000000004, 0, 1, 1],[1, 0.13000000000000003, 1, 1, -1],[1.0022222222222221, 0.07842592592592605, 1, 1, -2],[0.9988888888888888, 0, 1, 1, 12],[0.7988888888888888, 0, 1, 1, -1],[0.18, 0, 1, 1, -2],[0, 0, 0, 0, 13]    ],    "z": [[0, 0, 0, 0, 0],[0, 0.21673992673992679, 1, 1, -1],[0.026666666666666672, 0.36978021978021974, 1, 1, -2],[0.06, 0.4925274725274724, 1, 1, 1],[0.10222222222222223, 0.6610622710622709, 1, 1, -1],[0.2811111111111111, 1.0183150183150182, 1, 1, -2],[0.5, 0.9999999999999999, 0, 0, 2],[0.7433333333333333, 0.9725274725274724, 1, 1, -1],[0.9733333333333334, 0.717985347985348, 1, 1, -2],[1, 0, 0, 0, 3]    ],    "length": 225,    "width": 27.3,    "thickness": 7.2,    "cut_x0": 0.2,    "cut_x": 0.5}');

var rBoard = new Board(board);