let gl = null;
let vd = {}
let shaderProgram = null;

vd.vertices = [

    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,
    /*
    // Front face
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,
    // Back face
    -0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5, -0.5, -0.5,
    // Top face
    -0.5,  0.5, -0.5,
    -0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5, -0.5,
    // Bottom face
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5,
    // Right face
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5, -0.5,  0.5,
    // Left face
     -0.5, -0.5, -0.5,
     -0.5, -0.5,  0.5,
     -0.5,  0.5,  0.5,
     -0.5,  0.5, -0.5
     */
];

vd.colors = [

    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    1.0, 1.0, 1.0,
    0.0, 0.0, 1.0,
    1.0, 0.0, 1.0,
    1.0, 1.0, 0.0,
    0.0, 1.0, 1.0,
    0.0, 0.0, 0.0,
    /*
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,  // front face color
    1.0, 0.0, 0.0,

    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,  // 2nd face color
    0.0, 1.0, 0.0,

    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,  // 3rd face color
    1.0, 1.0, 1.0,

    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,   // 4th face color
    0.0, 0.0, 1.0,

    1.0, 0.0, 1.0,
    1.0, 0.0, 1.0,
    1.0, 0.0, 1.0,  // 5th face color
    1.0, 0.0, 1.0,

    1.0, 1.0, 0.0,
    1.0, 1.0, 0.0,
    1.0, 1.0, 0.0,  // 6th face color
    1.0, 1.0, 0.0
    */
];

vd.indices = [
    0, 1, 2, 1, 2, 3,
    0, 4, 6, 0, 2, 6,
    0, 1, 4, 1, 4, 5,
    4, 5, 6, 5, 6, 7,
    2, 3, 6, 3, 6, 7,
    1, 3, 7, 1, 5, 7,
    /*
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
    */
]

const xTranslate = document.getElementById("xTranslate");
const yTranslate = document.getElementById("yTranslate");
const zTranslate = document.getElementById("zTranslate");
const bodyRotate = document.getElementById("yBodyRotate");
const upperArmRotate = document.getElementById("yUpperArmRotate");
const lowerArmRotate = document.getElementById("yLowerArmRotate");
const headRotate = document.getElementById("HeadRotate");


xTranslate.addEventListener("change", updateData, false);
yTranslate.addEventListener("change", updateData, false);
zTranslate.addEventListener("change", updateData, false);
bodyRotate.addEventListener("change", updateData, false);
upperArmRotate.addEventListener("change", updateData, false);
lowerArmRotate.addEventListener("change", updateData, false);
headRotate.addEventListener("change", updateData, false);


function initGL() {
    const canvas = document.getElementById('drawSurface');
    gl = canvas.getContext('webgl2');
    attachData(gl, vd);
    createProgram(gl)

    gl.clearColor(0.0, 0.0, 0.0, 0.5);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (var i = 0; i < 4; i++) {
        draw(gl, vd, i)
    }
}

function attachData(gl, vd){
    vd.VBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vd.VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vd.vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    vd.CBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vd.CBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vd.colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    vd.IBO = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vd.IBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(vd.indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

}

function createProgram(gl){
    let vertCode =
        '#version 300 es \n' +
        'in vec3 v_position;' +
        'uniform mat4 u_modelMatrix;' +
        'uniform mat4 u_projMatrix;' +
        'in vec3 v_color;' +
        'out vec4 inFragColor;' +

        'void main(void) { ' +
        ' gl_Position = u_projMatrix * u_modelMatrix * vec4(v_position, 1.0); ' +
        ' inFragColor = vec4(v_color, 1.0);' +
        '}';

    let vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    let success = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(vertShader));
    }

    let fragCode =
        '#version 300 es \n' +
        'precision mediump float; \n' +
        'in vec4 inFragColor; ' +
        'out vec4 outFragColor;' +
        'void main(void) {' +
        ' outFragColor = vec4(inFragColor);' +
        '}';
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
}


function draw(gl, vd, i){
    gl.bindBuffer(gl.ARRAY_BUFFER, vd.VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vd.vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, vd.CBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vd.colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vd.IBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(vd.indices), gl.STATIC_DRAW);


    let modelMatrixLocation = gl.getUniformLocation(shaderProgram, "u_modelMatrix");
    var torsoModelToWorldSpaceMatrix = null
    if (i == 0) {//torso
        torsoModelToWorldSpaceMatrix = transitionMatrix(0, 0, 0, 0, 0.5, 1.0, 0.3, bodyRotate.value, 0);
    }
    else if (i == 1) {//upper arm
        torsoModelToWorldSpaceMatrix = transitionMatrix(0.4, 0, 0, upperArmRotate.value, 0.3, 0.6, 0.2, bodyRotate.value, 0);
    }
    else if (i == 2) {//lower arm
        torsoModelToWorldSpaceMatrix = transitionMatrix(0.4, -0.6, 0, lowerArmRotate.value, 0.3, 0.4, 0.2, bodyRotate.value, upperArmRotate.value);
    }
    else if (i == 3) {//head
        torsoModelToWorldSpaceMatrix = transitionMatrix(0, 0.75, 0, headRotate.value, 0.4, 0.4, 0.4, bodyRotate.value, 0, true);
    }

    gl.uniformMatrix4fv(modelMatrixLocation, false, torsoModelToWorldSpaceMatrix);

    let u_projMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(u_projMatrix, 45 * Math.PI/180, 800/600, 0.1, 100.0)
    //let u_transMatrix = gl.getUniformLocation(shaderProgram, "u_transMatrix");
    let u_projMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_projMatrix')
    gl.uniformMatrix4fv(u_projMatrixLocation, false, u_projMatrix)


    gl.bindBuffer(gl.ARRAY_BUFFER, vd.VBO);
    var verLoc = gl.getAttribLocation(shaderProgram, 'v_position');
    gl.vertexAttribPointer(verLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(verLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, vd.CBO);
    var coLoc = gl.getAttribLocation(shaderProgram, 'v_color');
    gl.vertexAttribPointer(coLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coLoc);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);

}


function updateData() {
    gl.clearColor(0.0, 0.0, 0.0, 0.5);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (var i = 0; i < 4; i++) {
        draw(gl, vd, i);
    }
}

function transitionMatrix(translate_x, translate_y, translate_z, rotation, scale_x, scale_y, scale_z, body, upper, is_head = false) {
    translate = glMatrix.mat4.create();
    glMatrix.mat4.translate(translate, translate, [translate_x, translate_y, translate_z]);

    rotate = glMatrix.mat4.create();
    if (!is_head) {
        glMatrix.mat4.rotate(rotate, rotate, rotation * Math.PI / 180, [0.0, 0.0, 1.0]);
    }
    else {
        glMatrix.mat4.rotate(rotate, rotate, rotation * Math.PI / 180, [0.0, 1.0, 0.0]);
    }

    scale = glMatrix.mat4.create();
    glMatrix.mat4.scale(scale, scale, [scale_x, scale_y, scale_z]);

    body_rotate = glMatrix.mat4.create();
    glMatrix.mat4.rotate(body_rotate, body_rotate, body * Math.PI/180, [0.0, 1.0, 0.0]);

    body_translate = glMatrix.mat4.create();
    glMatrix.mat4.translate(body_translate, body_translate, [xTranslate.value, yTranslate.value, zTranslate.value]);

    upper_rotate = glMatrix.mat4.create();
    glMatrix.mat4.rotate(upper_rotate, upper_rotate, upper * Math.PI/180, [0.0, 0.0, 1.0]);
    transition = glMatrix.mat4.create();

    glMatrix.mat4.multiply(transition, transition, upper_rotate)
    glMatrix.mat4.multiply(transition, transition, body_translate);
    glMatrix.mat4.multiply(transition, transition, body_rotate);


    glMatrix.mat4.multiply(transition, transition, translate);
    glMatrix.mat4.multiply(transition, transition, rotate);
    glMatrix.mat4.multiply(transition, transition, scale);


    return transition;
}


