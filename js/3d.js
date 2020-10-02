const vs = `        
uniform mat4 u_worldViewProjection;
uniform vec3 u_lightWorldPos;
uniform mat4 u_world;
uniform mat4 u_viewInverse;
uniform mat4 u_worldInverseTranspose;

attribute vec4 position;
attribute vec3 normal;
attribute vec2 texcoord;

varying vec4 v_position;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

void main() {
  v_texCoord = texcoord;
  v_position = u_worldViewProjection * position;
  v_normal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
  v_surfaceToLight = u_lightWorldPos - (u_world * position).xyz;
  v_surfaceToView = (u_viewInverse[3] - (u_world * position)).xyz;
  gl_Position = v_position;
}`;

const fs = `        
precision mediump float;

varying vec4 v_position;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

uniform vec4 u_lightColor;
uniform vec4 u_ambient;
uniform sampler2D u_diffuse;
uniform vec4 u_specular;
uniform float u_shininess;
uniform float u_specularFactor;

vec4 lit(float l ,float h, float m) {
  return vec4(1.0,
              max(l, 0.0),
              (l > 0.0) ? pow(max(0.0, h), m) : 0.0,
              1.0);
}

void main() {
  vec4 diffuseColor = texture2D(u_diffuse, v_texCoord);
  vec3 a_normal = normalize(v_normal);
  vec3 surfaceToLight = normalize(v_surfaceToLight);
  vec3 surfaceToView = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLight + surfaceToView);
  vec4 litR = lit(dot(a_normal, surfaceToLight),
                    dot(a_normal, halfVector), u_shininess);
  vec4 outColor = vec4((
  u_lightColor * (diffuseColor * litR.y + diffuseColor * u_ambient +
                u_specular * litR.z * u_specularFactor)).rgb,
      diffuseColor.a);
  gl_FragColor = outColor;
}`;

export function show(logicBoard) {
    const parent = document.getElementById('canvases');
    parent.textContent = '';
    const canvas = document.createElement('canvas');
    canvas.width = parent.offsetWidth - 5;
    canvas.height = parent.offsetHeight - 5;
    parent.appendChild(canvas);
    let [xMov, yMov] = [-2.1, -0.47, ];
    let animId;
    let dragging = false

    const m4 = twgl.m4;
    const gl = canvas.getContext("webgl");
    const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

    const arrays = logicBoard.get3d();
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    const tex = twgl.createTexture(gl, {
        min: gl.NEAREST,
        mag: gl.NEAREST,
        src: [255, 255, 255, 255, 192, 192, 192, 255, 192, 192, 192, 255, 255, 255, 255, 255, ],
    });

    const uniforms = {
        u_lightWorldPos: [1, 60, -70],
        u_lightColor: [0.8, 0.7, 0.7, 1],
        u_ambient: [0.3, 0.3, 0.3, 1],
        u_specular: [1, 1, 1, 1],
        u_shininess: 150,
        u_specularFactor: 1,
        u_diffuse: tex,
    };

    canvas.onmousedown = ()=>{
        dragging = true;
    };

    canvas.onmouseup = ()=>{
        dragging = false;
    };
    canvas.addEventListener('mousemove', (e)=>{
        if (dragging) {
            [xMov,yMov] = [xMov + e.movementX / 300, 
                           Math.max(Math.min(yMov - e.movementY / 200, Math.PI/2), -Math.PI/2)];
            render(0);
        }
    });

    function render(time) {
        time *= 0.0005;
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fov = 30 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 500;
        const projection = m4.perspective(fov, aspect, zNear, zFar);
        const eye = [1, 40, -300];
        const target = [0, 0, 0];
        const up = [0, 1, 0];

        const camera = m4.lookAt(eye, target, up);
        const view = m4.inverse(camera);
        const viewProjection = m4.multiply(projection, view);
        const world = m4.multiply(m4.rotationX(yMov), m4.rotationY(time * 0 + xMov));
        
        uniforms.u_viewInverse = camera;
        uniforms.u_world = world;
        uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
        uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);

        gl.useProgram(programInfo.program);
        twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
        twgl.setUniforms(programInfo, uniforms);
        gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

//         animId = requestAnimationFrame(render);
    }

//     animId = requestAnimationFrame(render);
    render(0);

    return ()=>{
        cancelAnimationFrame(animId);
    }

}
