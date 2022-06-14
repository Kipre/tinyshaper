import {roots, evaluate} from './surf.js';

const {cos, PI} = Math;

const res = await fetch('board.json')
export const board = await res.json();

const nbSlices=30, nbPoints=15;
const nbPointsPerSlice = nbPoints * 4 * 2 //+ 1;

const slices = Array.from({length: nbSlices}, (x, i) => (1 - cos(PI * (i / (nbSlices - 1))))/2);


function getY(points, x) {
	return evaluate(points, roots(points, {x})[0]).y;
}

function projectSegment(points, last=false) {
	const result = [];
	const step = last ? 1/(nbPoints - 1) : 1/nbPoints;
	for (let t=0; t < 1; t += step) {
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
		const end = idx + 3* nbPointsPerSlice - 1;
        let inv = end;
		let i = 0;
        while (idx < inv - 4) {
        	const x = cut[i].x* xFactor,
        		y = cut[i++].y* yFactor + zPosition;
            positions[idx++] = x;
            positions[idx++] = currentX;
            positions[idx++] = y;

            positions[inv--] = y;
            positions[inv--] = currentX;
            positions[inv--] = - x;
        }
		idx = end + 1;
    }
    
    return positions;
}

export function getIndices() {
    const indices = new Uint16Array((nbSlices - 1) * nbPointsPerSlice * 6);

    let idx = 0;
    for (let s=0; s<nbSlices-1; s++) {
    	for (let p=0; p<nbPointsPerSlice; p++) {
            const np = (p+1) % nbPointsPerSlice; // next point in the slice

            const a = nbPointsPerSlice*s + p;
            const d = nbPointsPerSlice*(s+1) + np;

            indices[idx++] = a;
            indices[idx++] = nbPointsPerSlice*(s+1) + p;
            indices[idx++] = d;
            indices[idx++] = a;
            indices[idx++] = d;
            indices[idx++] = nbPointsPerSlice*s + np;
        }
    }
	return indices;
}
