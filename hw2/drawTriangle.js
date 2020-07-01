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
    updateVertexData()
    updateVertexBufferObject()
    drawTriangle()
})

const sliderY = document.getElementById("YSlider")
const sTextY = document.getElementById("YText")

sliderY.addEventListener('change', function(){
    console.log(sliderY.value)
    sTextY.value = sliderY.value
    updateVertexData()
    updateVertexBufferObject()
    drawTriangle()
})

function updateVertexData(){
    vertices[0] = sliderX.value
    vertices[1] = sliderY.value
}

function updateVertexBufferObject(){
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function drawTriangle(){
    gl.clear(gl.COLOR_BUFFER_BIT);
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
        'void main(void) { ' +
        'gl_Position = vec4(coordinates, 1.0); ' +
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

    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);
    /*============= Drawing the Triangle ===============*/ // Clear the canvas
    gl.clearColor(0.5, 0.5, 0.5, 0.9);

    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}