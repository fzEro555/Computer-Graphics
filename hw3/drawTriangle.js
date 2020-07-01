let gl
let canvas
let vertex_buffer
let vertices = [
    0.0, 0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
];
let shaderProgram

const sliderX = document.getElementById("XSlider")
const sTextX = document.getElementById("XText")

sliderX.addEventListener('change', function(){
    console.log(sliderX.value)
    sTextX.value = sliderX.value
    drawTriangle()
})
const sliderAngle = document.getElementById("AngleSlider")
const sTextAngle = document.getElementById("AngleText")

sliderAngle.addEventListener('change', function () {
    console.log(sliderAngle.value)
    sTextAngle.value = sliderAngle.value
    drawTriangle()
})


function drawTriangle(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    let u_delta=gl.getUniformLocation(shaderProgram, "delta")
    gl.uniform1f(u_delta, sliderX.value)
    var radian = Math.PI * sliderAngle.value / 180.0;
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);
    var u_CosB = gl.getUniformLocation(shaderProgram, 'u_CosB');
    var u_SinB = gl.getUniformLocation(shaderProgram, 'u_SinB');
    gl.uniform1f(u_CosB, cosB);
    gl.uniform1f(u_SinB,sinB);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function initWebGL() {
    /*================Creating a canvas=================*/
    canvas = document.getElementById('draw_surface');
    gl = canvas.getContext('webgl2');

    vertex_buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    /*=========================Shaders========================*/

    let vertCode =
        '#version 300 es \n' +
        'in vec3 coordinates;' +
        'uniform float delta;' +
        'uniform float u_CosB, u_SinB;' +
        'void main(void) { ' +
        'gl_Position = vec4((coordinates.x + delta)*u_CosB - coordinates.y*u_SinB, (coordinates.x + delta)*u_SinB + coordinates.y*u_CosB, coordinates.z, 1.0); ' +
        '}';


    let vertShader = gl.createShader(gl.VERTEX_SHADER); // Attach vertex shader source code
    gl.shaderSource(vertShader, vertCode);

    gl.compileShader(vertShader);

    let success = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(vertShader));
    }

    let fragCode =
        '#version 300 es \n' +
        'precision mediump float; \n' +
        'out vec4 outFragColor;' +
        'void main(void) {' +
        'outFragColor = vec4(0.0, 0.5, 0.3, 1.0);' +
        '}';

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER); // Attach fragment shader source code
    gl.shaderSource(fragShader, fragCode);

    gl.compileShader(fragShader);

    shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertShader);

    gl.attachShader(shaderProgram, fragShader);

    gl.linkProgram(shaderProgram);

    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    var ANGLE = 0
    var radian = Math.PI * ANGLE / 180.0;
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);
    var u_CosB = gl.getUniformLocation(shaderProgram, 'u_CosB');
    var u_SinB = gl.getUniformLocation(shaderProgram, 'u_SinB');
    gl.uniform1f(u_CosB, cosB);
    gl.uniform1f(u_SinB,sinB);

    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);


    /*============= Drawing the Triangle ===============*/ // Clear the canvas
    gl.clearColor(0.5, 0.5, 0.5, 0.9);

    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}