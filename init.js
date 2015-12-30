var canvas = document.querySelector('canvas');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
var gl = canvas.getContext("experimental-webgl");

if (!gl) {
    throw new Error("WebGL not supported");
}

function loadShader(type, shaderSource) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Error compiling shader" + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

var vertexShaderSource = `attribute vec3 position;
attribute vec2 uv;
varying vec3 vPos;
varying vec2 vUv;

void main() {
    vPos = position;
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}`;

var fragmentShaderSource = `precision highp float;
uniform sampler2D tDiffuse;
varying vec3 vPos;
varying vec2 vUv;
void main() {
    gl_FragColor = texture2D(tDiffuse, vUv);
}
`;

var vertexShader = loadShader(gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("Failed to setup shaders");
}
gl.useProgram(shaderProgram);

var vertexBuffer = gl.createBuffer();
var vertices = new Float32Array([
    -1.0, -1.0,  0.0,
    0.0,  1.0,  0.0,
    1.0, -1.0,  0.0,
]);

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);


var positionAttribute = gl.getAttribLocation(shaderProgram, 'position');
gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionAttribute);

var texture = gl.createTexture();
var worker = new Worker('worker.js');
worker.postMessage("test.jpg");

worker.onmessage = function(image) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "tDiffuse"), 0);
}

var uvs = new Float32Array([
    0.0, 0.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,
]);
var uvBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

var uvAttribute = gl.getAttribLocation(shaderProgram, 'uv');
gl.vertexAttribPointer(uvAttribute, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(uvAttribute);

var animate = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(animate);
}

animate();