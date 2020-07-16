"use strict";

function main() {
    const opt = getQueryParams();
    const canvas = document.getElementById("3d-canvas");
    const gl = canvas.getContext("webgl");

    var resize = () => {
        let actual = canvas.getBoundingClientRect();
        canvas.height = Math.floor(actual.height);
        canvas.width = Math.floor(actual.width);
    }

    window.addEventListener('resize', resize);
    resize();

    if (!gl) {
        return;
    }

    const data = {
        tolerance: 0.15,
        numDivisions: 30,
        numPoints: 15,
        distance: 5,
        triangles: false
    };

    function generateMesh(bufferInfo) {
        const arrays = rBoard.get3d(data.numDivisions, data.numPoints);
        const extents = getExtents(arrays.position);
        if (!bufferInfo) {
            bufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays);
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.position), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_texcoord.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays.texcoord), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrays.indices), gl.STATIC_DRAW);
            bufferInfo.numElements = arrays.indices.length;
        }
        return {
            bufferInfo: bufferInfo,
            extents: extents,
        };
    }

    const programInfo = webglUtils.createProgramInfo(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

    const texInfo = loadImageAndCreateTextureInfo("https://webglfundamentals.org/webgl/resources/uv-grid.png", render);

    let worldMatrix = m4.identity();
    let projectionMatrix;
    let extents;
    let bufferInfo;

    function update() {
        const info = generateMesh(bufferInfo);
        extents = info.extents;
        bufferInfo = info.bufferInfo;
        render();
    }
    update();

    function render() {
        // webglUtils.resizeCanvasToDisplaySize(gl.canvas, window.devicePixelRatio);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute the projection matrix
        const fieldOfViewRadians = Math.PI * .2;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 3000);

        // Compute the camera's matrix using look at.
        const midY = lerp(extents.min[1], extents.max[1], .5);
        const sizeToFitOnScreen = (extents.max[1] - extents.min[1]) * data['distance'];
        const distance = sizeToFitOnScreen / Math.tan(fieldOfViewRadians * .5);
        const cameraPosition = [0, midY, distance];
        const target = [0, midY, 0];
        const up = [0, -1, 0]; // we used 2d points as input which means orientation is flipped
        const cameraMatrix = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        const viewMatrix = m4.inverse(cameraMatrix);

        const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        gl.useProgram(programInfo.program);

        // Setup all the needed attributes.
        // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer for each attribute
        webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

        // Set the uniforms
        // calls gl.uniformXXX, gl.activeTexture, gl.bindTexture
        webglUtils.setUniforms(programInfo, {
            u_matrix: m4.multiply(viewProjectionMatrix, worldMatrix),
            u_texture: texInfo.texture,
        });

        // calls gl.drawArrays or gl.drawElements.
        webglUtils.drawBufferInfo(gl, bufferInfo, data.triangles ? gl.TRIANGLE : gl.LINES);
    }

    function getExtents(positions) {
        const min = positions.slice(0, 3);
        const max = positions.slice(0, 3);
        for (let i = 3; i < positions.length; i += 3) {
            min[0] = Math.min(positions[i + 0], min[0]);
            min[1] = Math.min(positions[i + 1], min[1]);
            min[2] = Math.min(positions[i + 2], min[2]);
            max[0] = Math.max(positions[i + 0], max[0]);
            max[1] = Math.max(positions[i + 1], max[1]);
            max[2] = Math.max(positions[i + 2], max[2]);
        }
        return {
            min: min,
            max: max,
        };
    }

    // Ramer Douglas Peucker algorithm
    function simplifyPoints(points, start, end, epsilon, newPoints) {
        const outPoints = newPoints || [];

        // find the most distant point from the line formed by the endpoints
        const s = points[start];
        const e = points[end - 1];
        let maxDistSq = 0;
        let maxNdx = 1;
        for (let i = start + 1; i < end - 1; ++i) {
            const distSq = v2.distanceToSegmentSq(points[i], s, e);
            if (distSq > maxDistSq) {
                maxDistSq = distSq;
                maxNdx = i;
            }
        }

        // if that point is too far
        if (Math.sqrt(maxDistSq) > epsilon) {

            // split
            simplifyPoints(points, start, maxNdx + 1, epsilon, outPoints);
            simplifyPoints(points, maxNdx, end, epsilon, outPoints);

        } else {

            // add the 2 end points
            outPoints.push(s, e);
        }

        return outPoints;
    }



      // webglLessonsUI.setupUI(document.querySelector("#ui"), data, [
      //   { type: "slider",   key: "distance",   change: update, min: 0.001, max: 5,           precision: 3, step: 0.001, },
      //   { type: "slider",   key: "divisions",  change: update, min: 1    , max: 60,                                     },
      //   { type: "slider",   key: "startAngle", change: update, min: 0    , max: Math.PI * 2, precision: 3, step: 0.001, uiMult: 180 / Math.PI, uiPrecision: 0  },
      //   { type: "slider",   key: "endAngle",   change: update, min: 0    , max: Math.PI * 2, precision: 3, step: 0.001, uiMult: 180 / Math.PI, uiPrecision: 0  },
      //   { type: "checkbox", key: "capStart",   change: update, },
      //   { type: "checkbox", key: "capEnd",     change: update, },
      //   { type: "checkbox", key: "triangles",  change: render, },
      // ]);

    /* eslint brace-style: 0 */
    gl.canvas.addEventListener('mousedown', (e) => { e.preventDefault();
        startRotateCamera(e); });
    window.addEventListener('mouseup', stopRotateCamera);
    window.addEventListener('mousemove', rotateCamera);
    gl.canvas.addEventListener('touchstart', (e) => { e.preventDefault();
        startRotateCamera(e.touches[0]); });
    window.addEventListener('touchend', (e) => { stopRotateCamera(e.touches[0]); });
    window.addEventListener('touchmove', (e) => { rotateCamera(e.touches[0]); });

    let lastPos;
    let moving;

    function startRotateCamera(e) {
        lastPos = getRelativeMousePosition(gl.canvas, e);
        moving = true;
    }

    function rotateCamera(e) {
        if (moving) {
            const pos = getRelativeMousePosition(gl.canvas, e);
            const size = [4 / gl.canvas.width, 4 / gl.canvas.height];
            const delta = v2.mult(v2.sub(lastPos, pos), size);

            // this is bad but it works for a basic case so phffttt
            worldMatrix = m4.multiply(m4.xRotation(delta[1] * 5), worldMatrix);
            worldMatrix = m4.multiply(m4.yRotation(delta[0] * 5), worldMatrix);

            lastPos = pos;

            render();
        }
    }

    function stopRotateCamera(e) {
        moving = false;
    }

    function clamp(v, min, max) {
        return Math.max(Math.min(v, max), min);
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function getQueryParams() {
        var params = {};
        if (window.location.search) {
            window.location.search.substring(1).split("&").forEach(function(pair) {
                var keyValue = pair.split("=").map(function(kv) {
                    return decodeURIComponent(kv);
                });
                params[keyValue[0]] = keyValue[1];
            });
        }
        return params;
    }

    function getRelativeMousePosition(canvas, e) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
        const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
        return [
            (x - canvas.width / 2) / window.devicePixelRatio,
            (y - canvas.height / 2) / window.devicePixelRatio,
        ];
    }

    // creates a texture info { width: w, height: h, texture: tex }
    // The texture will start with 1x1 pixels and be updated
    // when the image has loaded
    function loadImageAndCreateTextureInfo(url, callback) {
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        // Fill the texture with a 1x1 blue pixel.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        var textureInfo = {
            width: 1, // we don't know the size until it loads
            height: 1,
            texture: tex,
        };
        var img = new Image();
        img.addEventListener('load', function() {
            textureInfo.width = img.width;
            textureInfo.height = img.height;

            gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

            // Check if the image is a power of 2 in both dimensions.
            if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
                // Yes, it's a power of 2. Generate mips.
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }

            if (callback) {
                callback();
            }
        });
        img.crossOrigin = 'anonymous'
        img.src = url;

        return textureInfo;
    }

    function isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
}

const v2 = (function() {
    // adds 1 or more v2s
    function add(a, ...args) {
        const n = a.slice();
        [...args].forEach(p => {
            n[0] += p[0];
            n[1] += p[1];
        });
        return n;
    }

    function sub(a, ...args) {
        const n = a.slice();
        [...args].forEach(p => {
            n[0] -= p[0];
            n[1] -= p[1];
        });
        return n;
    }

    function mult(a, s) {
        if (Array.isArray(s)) {
            let t = s;
            s = a;
            a = t;
        }
        if (Array.isArray(s)) {
            return [
                a[0] * s[0],
                a[1] * s[1],
            ];
        } else {
            return [a[0] * s, a[1] * s];
        }
    }

    function lerp(a, b, t) {
        return [
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
        ];
    }

    function min(a, b) {
        return [
            Math.min(a[0], b[0]),
            Math.min(a[1], b[1]),
        ];
    }

    function max(a, b) {
        return [
            Math.max(a[0], b[0]),
            Math.max(a[1], b[1]),
        ];
    }

    // compute the distance squared between a and b
    function distanceSq(a, b) {
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        return dx * dx + dy * dy;
    }

    // compute the distance between a and b
    function distance(a, b) {
        return Math.sqrt(distanceSq(a, b));
    }

    // compute the distance squared from p to the line segment
    // formed by v and w
    function distanceToSegmentSq(p, v, w) {
        const l2 = distanceSq(v, w);
        if (l2 === 0) {
            return distanceSq(p, v);
        }
        let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
        t = Math.max(0, Math.min(1, t));
        return distanceSq(p, lerp(v, w, t));
    }

    // compute the distance from p to the line segment
    // formed by v and w
    function distanceToSegment(p, v, w) {
        return Math.sqrt(distanceToSegmentSq(p, v, w));
    }

    return {
        add: add,
        sub: sub,
        max: max,
        min: min,
        mult: mult,
        lerp: lerp,
        distance: distance,
        distanceSq: distanceSq,
        distanceToSegment: distanceToSegment,
        distanceToSegmentSq: distanceToSegmentSq,
    };
}());