let gl = null;
let shaderProgram = null;
let vertexPositionBuffer = null;
let vertexTextureCoordsBuffer = null;
let indexBuffer = null;
let vertexNormalBuffer = null;
let vertexPositions = null;
let vertexNormals = null;
let vertexTextureCoords = null;
let indices = null;
let projectionMatrix = null;
let angle = 0;
let delta = 0;
let flag = true;
let stop;

class Camera {
    positionVector
    upVector
    viewDirectionVector
    cameraMatrix
    delta = 0.25
    constructor() {
        this.cameraMatrix = glMatrix.mat4.create();
        this.viewDirectionVector = glMatrix.vec3.fromValues(0.0, 0.0, -1.0);
        this.upVector = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
        this.positionVector = glMatrix.vec3.fromValues(0.0, 0.0, 10.0);
        this.updateCameraMatrix();
    }

    moveForward() {
        let deltaForward = glMatrix.vec3.create();
        glMatrix.vec3.scale(deltaForward, this.viewDirectionVector, this.delta);
        glMatrix.vec3.add(this.positionVector, this.positionVector, deltaForward);
        this.updateCameraMatrix();
    }

    moveBackward() {
        let deltaBackward = glMatrix.vec3.create();
        glMatrix.vec3.scale(deltaBackward, this.viewDirectionVector, this.delta);
        glMatrix.vec3.sub(this.positionVector, this.positionVector, deltaBackward);
        this.updateCameraMatrix();
    }

    strafeLeft() {
        let deltaLeft = glMatrix.vec3.create();
        glMatrix.vec3.cross(deltaLeft, this.upVector, this.viewDirectionVector);
        glMatrix.vec3.scale(deltaLeft, deltaLeft, this.delta);
        glMatrix.vec3.add(this.positionVector, this.positionVector, deltaLeft);
        this.updateCameraMatrix();
    }

    strafeRight() {
        let deltaRight = glMatrix.vec3.create();
        glMatrix.vec3.cross(deltaRight, this.viewDirectionVector, this.upVector);
        glMatrix.vec3.scale(deltaRight, deltaRight, this.delta);
        glMatrix.vec3.add(this.positionVector, this.positionVector, deltaRight);
        this.updateCameraMatrix();
    }

    Up() {
        let deltaUp = glMatrix.vec3.create();
        glMatrix.vec3.scale(deltaUp, this.upVector, this.delta);
        glMatrix.vec3.add(this.positionVector, this.positionVector, deltaUp);
        this.updateCameraMatrix();
    }

    Down() {
        let deltaDown = glMatrix.vec3.create();
        glMatrix.vec3.scale(deltaDown, this.upVector, this.delta);
        glMatrix.vec3.sub(this.positionVector, this.positionVector, deltaDown);
        this.updateCameraMatrix();
    }

    rotateLeft() {
        glMatrix.vec3.rotateY(this.viewDirectionVector, this.viewDirectionVector, this.positionVector, Math.PI/90);
        this.updateCameraMatrix();
    }

    rotateRight() {
        glMatrix.vec3.rotateY(this.viewDirectionVector, this.viewDirectionVector, this.positionVector, -Math.PI/90);
        this.updateCameraMatrix();
    }

    updateCameraMatrix() {
        let deltaMove = glMatrix.vec3.create();
        glMatrix.vec3.add(deltaMove, this.positionVector, this.viewDirectionVector);
        glMatrix.mat4.lookAt(this.cameraMatrix, this.positionVector, deltaMove, this.upVector);
    }
}

let camera = new Camera();
document.addEventListener("keydown", ProcessKeyPressedEvent, false);


function ProcessKeyPressedEvent(e) {
    if (e.code === "KeyW") {
        camera.moveForward();
    } else if (e.code === "KeyS") {
        camera.moveBackward();
    } else if (e.code === "KeyA") {
        camera.strafeLeft();
    } else if (e.code === "KeyD") {
        camera.strafeRight();
    } else if (e.code === "KeyI") {
        camera.Up();
    } else if (e.code === "KeyK") {
        camera.Down();
    } else if (e.code === "KeyJ") {
        camera.rotateRight();
    } else if (e.code === "KeyL") {
        camera.rotateLeft();
    }
}


function initGL(){
    const canvas = document.getElementById('drawSurface');
    gl = canvas.getContext('webgl2');

    projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projectionMatrix, Math.PI / 3, 800 / 600, 0.1, 100.0);

    vertexPositionBuffer = gl.createBuffer();
    vertexNormalBuffer = gl.createBuffer();
    vertexTextureCoordsBuffer = gl.createBuffer();
    indexBuffer = gl.createBuffer();

    updateBufferObject()

    createProgram(gl)

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    var vertexPosition = gl.getAttribLocation(shaderProgram, "v_position");
    gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    var vertexNormal = gl.getAttribLocation(shaderProgram, "v_normal");
    gl.vertexAttribPointer(vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordsBuffer);
    var vertexTextureCoords = gl.getAttribLocation(shaderProgram, "v_TextureCoords");
    gl.vertexAttribPointer(vertexTextureCoords, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexTextureCoords);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    let uDiffuseDirectionLocation = gl.getUniformLocation(shaderProgram, 'u_diffuseLightDirection');
    gl.uniform3fv(uDiffuseDirectionLocation, [5.0, 5.0, -1.0]);
    // color of diffuse light --white light
    let uDiffuseColorLocation = gl.getUniformLocation(shaderProgram, 'u_diffuseLightColor');
    gl.uniform3fv(uDiffuseColorLocation, [1.0, 1.0, 1.0]);
    // color of ambient light
    let uAmbientColorLocation = gl.getUniformLocation(shaderProgram, 'u_ambientLightColor');
    gl.uniform3fv(uAmbientColorLocation, [0.2, 0.3, 0.2]);

    let materialColor = gl.getUniformLocation(shaderProgram, 'cubeColor')
    gl.uniform3fv(materialColor, [1.0, 1.0, 0.0])

    drawLoop();
}


function updateBufferObject(){
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}


function createProgram(gl) {
    let vertCode =
        '#version 300 es \n' +
        'in vec3 v_position;' +
        'in vec3 v_normal;' +
        'in vec2 v_TextureCoords;' +
        'out vec4 outColor;' +
        'uniform mat4 u_modelMatrix;' +
        'uniform mat4 u_viewMatrix;' +
        'uniform mat4 u_projectionMatrix;' +
        'uniform mat4 u_normalMatrix;' +
        'uniform vec3 cubeColor;' +
        'uniform vec3 u_ambientLightColor;' +
        'uniform vec3 u_diffuseLightColor;' +
        'uniform vec3 u_diffuseLightDirection;' +
        'void main(void) { ' +
        'gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(v_position, 1.0);' +
        'vec3 normal = normalize(vec3((transpose(inverse(u_modelMatrix))) * vec4(v_normal, 0.0)));' +
        'vec3 lightDirection = normalize(u_diffuseLightDirection);' +
        'float cosTheta = max(dot(lightDirection, normal), 0.0);' +
        'vec3 diffuseReflection = u_diffuseLightColor * cubeColor * cosTheta;' +
        'vec3 ambientReflection = u_ambientLightColor * cubeColor;' +
        'outColor = vec4(ambientReflection + diffuseReflection, 1.0);' +
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
        'in vec4 outColor;' +
        'out vec4 outFragColor;' +
        'void main(void) {' +
        'outFragColor = vec4(outColor);' +
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


function drawLoop(now) {
    gl.clearColor(0.3, 0.4, 0.5, 0.1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    angle = angle + 0.05;

    if (flag == true) {
        if (delta < 4) {
            delta += 0.05;
        } else {
            flag = false;
        }
    } else {
        if (delta > -4) {
            delta -= 0.05;
        } else {
            flag = true;
        }
    }

    gl.clearColor(0.3, 0.4, 0.5, 0.9);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawFloor();
    drawCube(angle);
    drawRing(delta);
    drawCone(delta, angle);
    drawTorus(delta);
    drawBullet(delta * 3);
    drawPerfumeBottle(delta, angle);
    stop = requestAnimationFrame(drawLoop);
}


function useData(model){
    vertexPositions = model.vertexPositions;
    vertexNormals = model.vertexNormals;
    vertexTextureCoords = model.vertexTextureCoords;
    indices = model.indices;
    updateBufferObject();
}


function utils(modelMatrix){
    let modelMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_modelMatrix');
    let viewMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_viewMatrix');
    let projectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_projectionMatrix');

    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    gl.uniformMatrix4fv(viewMatrixLocation, false, camera.cameraMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

    return indices.length;
}


function drawFloor() {
    let model = cube(50);
    useData(model);

    let modelMatrix = glMatrix.mat4.create();

    glMatrix.mat4.translate(modelMatrix, modelMatrix, [0, -0.5, 0]);
    glMatrix.mat4.scale(modelMatrix, modelMatrix, [1.0, 0.01, 1.0]);

    let count = utils(modelMatrix);
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
}


function drawCube(angle) {
    let model = cube(4);
    useData(model);

    let modelMatrix = glMatrix.mat4.create();

    glMatrix.mat4.translate(modelMatrix, modelMatrix, [5, 1, 0]);
    glMatrix.mat4.rotate(modelMatrix, modelMatrix, angle, [0, 1, 0]);
    glMatrix.mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3]);

    let count = utils(modelMatrix);
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
}


function drawRing(delta){
    let model = ring(5, 6, 32)
    useData(model);

    let modelMatrix = glMatrix.mat4.create();

    glMatrix.mat4.scale(modelMatrix, modelMatrix, [0.2, 0.2, 0.2]);
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [-8, 5, 0]);
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [delta, 0, 0]);

    let count = utils(modelMatrix);
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
}


function drawCone(delta, angle){
    let model = uvCone(2, 3, 32)
    useData(model);

    let modelMatrix = glMatrix.mat4.create();

    glMatrix.mat4.scale(modelMatrix, modelMatrix, [0.2, 0.2, 0.2]);
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [-8, 5, 0]);
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [delta, 0, 0]);
    glMatrix.mat4.rotate(modelMatrix, modelMatrix, angle, [1, 0, 0]);

    let count = utils(modelMatrix);
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
}


function drawTorus(delta){
    let model = uvTorus(2, 1, 3)
    useData(model);
    let modelMatrix = glMatrix.mat4.create();

    glMatrix.mat4.scale(modelMatrix, modelMatrix, [0.4, 0.4, 0.4]);
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [5, 5, 0]);
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [0, delta, 0]);

    let count = utils(modelMatrix);
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
}


function drawBullet(delta){
    let model = uvSphere(0.8, 32, 8)
    useData(model);
    let modelMatrix = glMatrix.mat4.create();

    glMatrix.mat4.scale(modelMatrix, modelMatrix, [0.4, 0.4, 0.4]);
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [-12, 8, 0]);
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [0, 0, delta]);

    let count = utils(modelMatrix);
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
}


function drawPerfumeBottle(delta, angle){
    let model1 = cube(4)
    useData(model1);
    let modelMatrix1 = glMatrix.mat4.create();

    glMatrix.mat4.scale(modelMatrix1, modelMatrix1, [0.4, 0.4, 0.4]);
    glMatrix.mat4.translate(modelMatrix1, modelMatrix1, [-12, 2, 0]);
    glMatrix.mat4.translate(modelMatrix1, modelMatrix1, [delta, 0, 0]);

    let count1 = utils(modelMatrix1);
    gl.drawElements(gl.TRIANGLES, count1, gl.UNSIGNED_SHORT, 0);

    let model2 = uvSphere(1.5,32,8);
    useData(model2);
    let modelMatrix2 = glMatrix.mat4.create();

    glMatrix.mat4.scale(modelMatrix2, modelMatrix2, [0.4, 0.4, 0.4]);
    glMatrix.mat4.translate(modelMatrix2, modelMatrix2, [-12, 5, 0]);
    glMatrix.mat4.translate(modelMatrix2, modelMatrix2, [delta, 0, 0]);
    glMatrix.mat4.rotate(modelMatrix2, modelMatrix2, angle, [0, 1, 0]);

    let count2 = utils(modelMatrix2);
    gl.drawElements(gl.TRIANGLES, count2, gl.UNSIGNED_SHORT, 0);
}