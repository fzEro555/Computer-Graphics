let gl
let canvas
let vertex_buffer
let ANGLE = 0
let vertices = [
    -0.5, -0.5, 0.0,
    -0.5, 0.5, 0.0,
    0.5, -0.5, 0.0,
    0.5, 0.5, 0.0,
    -0.5, 0.5, 0.0,
    0.5, -0.5, 0.0,
];

let vertices_color = [
    0.3, 0.4, 0.5,
    0.4, 0.5, 0.6,
    0.5, 0.6, 0.7,
    0.7, 0.8, 0.9,
    0.4, 0.5, 0.6,
    0.5, 0.6, 0.7,
];

let shaderProgram



// const sliderAngle = document.getElementById("AngleSlider")
// const sTextAngle = document.getElementById("AngleText")
//
// sliderAngle.addEventListener('change', function () {
//     console.log(sliderAngle.value)
//     sTextAngle.value = sliderAngle.value
//     ANGLE = 0
//     drawLoop(sliderAngle.value)
//
// })


function drawTriangle(gl, ANGLE){

    gl.clear(gl.COLOR_BUFFER_BIT);
    var radian = Math.PI * ANGLE / 180.0;
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);
    var u_CosB = gl.getUniformLocation(shaderProgram, 'u_CosB');
    var u_SinB = gl.getUniformLocation(shaderProgram, 'u_SinB');
    gl.uniform1f(u_CosB, cosB);
    gl.uniform1f(u_SinB,sinB);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function drawLoop(now){
    ANGLE -= 5
    drawTriangle(gl, ANGLE)
    /* Callback */
    stop = requestAnimationFrame(drawLoop)
}

function initWebGL() {
    /*================Creating a canvas=================*/
    canvas = document.getElementById('draw_surface');
    gl = canvas.getContext('webgl2');

    vertex_buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    var color_buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices_color), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    /*=========================Shaders========================*/

    let vertCode =
        '#version 300 es \n' +
        'in vec3 coordinates;' +
        'in vec3 a_Color;' +
        'out vec3 color;' +
        'uniform float u_CosB, u_SinB;' +
        'void main(void) { ' +
        'gl_Position = vec4(coordinates.x*u_CosB - coordinates.y*u_SinB, coordinates.x*u_SinB + coordinates.y*u_CosB, coordinates.z, 1.0); ' +
        'color = a_Color;' +
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
        'in vec3 color;' +
        'out vec4 outFragColor;' +
        'void main(void) {' +
        'outFragColor = vec4(color, 1.0);' +
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

    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);





    var colors = gl.getAttribLocation(shaderProgram, "a_Color");
    gl.vertexAttribPointer(colors, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colors);



    /*============= Drawing the Triangle ===============*/ // Clear the canvas
    gl.clearColor(0.5, 0.5, 0.5, 0.9);

    gl.enable(gl.DEPTH_TEST);

    //gl.clear(gl.COLOR_BUFFER_BIT);

    //gl.drawArrays(gl.TRIANGLES, 0, 6);
    drawLoop()
}