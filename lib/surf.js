class P {
    x = 0;
    y = 0;

    constructor(x, y, freedomX, freedomY, number) {
        this.x = x;
        this.y = y;
        this.freedomX = freedomX;
        this.freedomY = freedomY;
        this.number = number;

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
        return this.dest[i]
    }

    get dest() {
        return [this.x, this.y]
    }

    get fullDest() {
        return [this.x, this.y, this.freedomX, this.freedomY, this.number]
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

    reversed() {
        return new BezierCurve([this.d.dest, this.c.dest, this.b.dest, this.a.dest]);
    }
}


class BezierPath {

    curves = []

    constructor(points=[]) {
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

    project(nbPoints = 10) {
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

    reversed() {
        var newPath = new BezierPath();
        newPath.curves = this.curves.reduce((acc, ele) => { acc.unshift(ele.reversed()); return acc }, []);
        return newPath;
    }

    concatenate(other) {
        var result = new BezierPath([])
        result.curves = [...this.curves]
        const beginning = this.curves[this.curves.length - 1].d
        const end = other.curves[0].a
        result.curves.push(new BezierCurve([beginning.dest, beginning.dest, end.dest, end.dest]), ...other.curves)
        return result
    }
}

class Board {

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
        this.x_cut = board['z'][6][0];
        this.x0_cut = board['z'][3][0];
        this.continuity = board['continuity'];

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

    nonNested() {
        // For firebase serialization
        var copy = JSON.parse(JSON.stringify(this.board));
        copy['x'] = copy['x'].map((e) => Object({contents: e}));
        copy['x0'] = copy['x0'].map((e) => Object({contents: e}));
        copy['y'] = copy['y'].map((e) => Object({contents: e}));
        copy['z'] = copy['z'].map((e) => Object({contents: e}));
        return copy;
    }

    fromNonNested(board) {
        board['x'] = board['x'].map((e) => e['contents']);
        board['x0'] = board['x0'].map((e) => e['contents']);
        board['y'] = board['y'].map((e) => e['contents']);
        board['z'] = board['z'].map((e) => e['contents']);
        this.initialize(board);
    }

    get y() {
        return this.yUp.concatenate(this.yDown.reversed())
    }

    x0Thickness() {
        return (this.yUp.curves[0].d.at(1) - this.yDown.curves[0].d.at(1))*this.thickness
    }

    x0Width() {
        return this.board['z'][3][1]*this.width;
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
        for (var i = result.length - 2; i >= 0; i--) {
            let [a, b] = result[i]
            result.push([-a, b])
        }
        return new BezierPath(result)
    }

    distribute(x) {
        return (1 - Math.cos(Math.PI * x))/2
    }

    get3d(numDivisions=30, nbPoints=15) {
        const positions = [];
        const texcoords = [];
        const indices = [];

        var points = this.getFullCut(0.5).project()

        const quadsDown = points.length - 1;

        // generate points
        for (let division = 0; division <= numDivisions; ++division) {
            const u = division / numDivisions;
            let x = this.distribute(division / numDivisions)
            points = this.getFullCut(x).project()
            points.forEach((p, ndx) => {
                positions.push(p.x * this.width, p.y * this.thickness, x * this.length - this.length / 2);
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

    getOBJ(slices=30, nbPoints=15) {

        const xs = Array.from({length: slices}, (x, i) => this.distribute(i/(slices - 1)));
        
        var result = 'o board',
            verticles = '\n',
            indexes = '\n',
            points;

        var allPoints = []
        for (const x of xs) {
            points = this.getFullCut(x).project(nbPoints);
            allPoints = [...allPoints, ...points.map((e) => [...e.dest, x])]
        }
        const nbPointsPerSlice = points.length;
        for (const p of allPoints) {
            const [a, b, c] = p;
            verticles += `\nv ${(a * this.width).toFixed(10)} ${(b * this.thickness).toFixed(10)} ${(c * this.length).toFixed(10)}`;
        }

        for (var slice=0; slice<slices-1; slice++) {
            for (var i=1; i<=nbPointsPerSlice; i++) {
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