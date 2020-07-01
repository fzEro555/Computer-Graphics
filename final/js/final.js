let obj;
let obj_index = 0;
let ModelMaterialsArray = [];
let ModelAttributeArray = [];
let shaderProgram = null;
let gl = null;
let angle = 0;
let antiFlag = 1;
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


function myMain() {
    const canvas = document.getElementById('drawSurface');
    gl = canvas.getContext('webgl2');

    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    loadExternalJSON('./model/rust.json');
    loadExternalJSON('./model/farmhouse.json');
    loadExternalJSON('./model/crate.json');
    
    setTimeout(() => {
        for(var i=0; i < ModelAttributeArray.length; i++){
            makeModelBuffers(ModelAttributeArray[i], gl);
            makeModelTexture(ModelAttributeArray[i], gl);
        }
        setUpWebGL(gl);
    }  , 500);
    
}

function makeModelTexture(model, gl){
    model.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, model.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, model.matImg.width, model.matImg.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, model.matImg);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, null);
}


function makeModelBuffers(om, gl){
    om.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, om.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(om.vertices), gl.STATIC_DRAW);

    om.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, om.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(om.normals), gl.STATIC_DRAW);

    om.textCoorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, om.textCoorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(om.textureCoords), gl.STATIC_DRAW);


    om.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, om.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(om.indexs), gl.STATIC_DRAW);
}

function setUpWebGL(gl) {
    const vertexSource = fetch('./shaders/vertex.glsl')
        .then(function(response){
            console.log('response object is returning vertex source...');
            return response.text();
        });

    const fragSource = fetch('./shaders/frag.glsl')
        .then(function(response){
            console.log('response object is returning frag source...');
            return response.text();
        });
    Promise.all([vertexSource, fragSource, obj])
        .then(function(sourcesText) {
            console.log('===Resolved Promise.all===');

            let vertexShader = gl.createShader(gl.VERTEX_SHADER);

            gl.shaderSource(vertexShader, sourcesText[0]);
            gl.compileShader(vertexShader);


            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, sourcesText[1]);
            gl.compileShader(fragmentShader);

            shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);
        })
        .then(function(){
        gl.useProgram(shaderProgram);

        let vertexAttribLocation = gl.getAttribLocation(shaderProgram, "v_position");
        let normalAttribLocation = gl.getAttribLocation(shaderProgram, "v_normal");
        let textCoorAttribLocation = gl.getAttribLocation(shaderProgram, "v_texcoord");

        let modelMatrixLocation = gl.getUniformLocation(shaderProgram, "u_modelMatrix");
        let viewMatrixLocation = gl.getUniformLocation(shaderProgram, "u_viewMatrix");
        let projMatrixLocation = gl.getUniformLocation(shaderProgram, "u_projectionMatrix");

        let ambientLightColorLocation = gl.getUniformLocation(shaderProgram, "u_ambientLightColorLocation");
        gl.uniform3fv(ambientLightColorLocation, [1.0, 1.0, 1.0]);
        let diffuseLightColorLocation = gl.getUniformLocation(shaderProgram, "u_diffuseLightColor");
        gl.uniform3fv(diffuseLightColorLocation, [1.0, 1.0, 1.0]);
        let diffuseLightDirectionLocation = gl.getUniformLocation(shaderProgram, "u_diffuseLightDirection");
        gl.uniform3fv(diffuseLightDirectionLocation, [0.0, 1.0, 1.0]);
        let texLocation = gl.getUniformLocation(shaderProgram, "textureImg");


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
        projectionMatrix = glMatrix.mat4.create();
        glMatrix.mat4.perspective(projectionMatrix, Math.PI / 3, 800 / 600, 0.1, 100.0);

        drawLoop();

        function drawLoop(){
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            for(var i=0; i<ModelAttributeArray.length; i++) {
                drawModel(ModelAttributeArray[i]);
            }
            requestAnimationFrame(drawLoop);
        }

        function drawModel(om){
            gl.bindBuffer(gl.ARRAY_BUFFER, om.vertexBuffer);
            gl.vertexAttribPointer(vertexAttribLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vertexAttribLocation);

            gl.bindBuffer(gl.ARRAY_BUFFER, om.normalBuffer);
            gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(normalAttribLocation);

            gl.bindBuffer(gl.ARRAY_BUFFER, om.textCoorBuffer);
            gl.vertexAttribPointer(textCoorAttribLocation, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(textCoorAttribLocation);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, om.texture);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, om.indexBuffer);
            if(om.objIndex == 0){
                gl.uniform1i(texLocation, 0);
                let modelMatirx = glMatrix.mat4.create();
                glMatrix.mat4.translate(modelMatirx, modelMatirx, [-4.0, -4.0, -20.0]);
                glMatrix.mat4.scale(modelMatirx, modelMatirx, [0.5, 0.5, 0.5]);

                gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatirx);
                gl.uniformMatrix4fv(viewMatrixLocation, false, camera.cameraMatrix);
                gl.uniformMatrix4fv(projMatrixLocation, false, projectionMatrix);

                gl.drawElements(gl.TRIANGLES, om.indexs.length, gl.UNSIGNED_SHORT, 0);
            }else if(om.objIndex == 1){
                gl.uniform1i(texLocation, 0);

                if(antiFlag != -1){
                    angle = angle + 2;
                    if(angle > 360)
                        angle = 0;
                }
                let modelMatirx = glMatrix.mat4.create();
                glMatrix.mat4.translate(modelMatirx, modelMatirx, [-4.0, -4.0, 0.0]);
                glMatrix.mat4.rotate(modelMatirx, modelMatirx, 30 * Math.PI/ 180.0, [1.0, 0.0, 0.0]);
                glMatrix.mat4.rotate(modelMatirx, modelMatirx, angle* Math.PI/ 180.0, [0.0, 1.0, 0.0]);
                glMatrix.mat4.scale(modelMatirx, modelMatirx, [2.0, 2.0, 2.0]);

                gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatirx);
                gl.uniformMatrix4fv(viewMatrixLocation, false, camera.cameraMatrix);
                gl.uniformMatrix4fv(projMatrixLocation, false, projectionMatrix);

                gl.drawElements(gl.TRIANGLES, om.indexs.length, gl.UNSIGNED_SHORT, 0);
            }else if(om.objIndex == 2){
                gl.uniform1i(texLocation, 0);
                let modelMatirx = glMatrix.mat4.create();
                glMatrix.mat4.translate(modelMatirx, modelMatirx, [4.0, -4.0, 0]);
                glMatrix.mat4.rotate(modelMatirx, modelMatirx, 30, [1, 0, 0]);
                glMatrix.mat4.scale(modelMatirx, modelMatirx, [0.03, 0.03, 0.03]);

                gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatirx);
                gl.uniformMatrix4fv(viewMatrixLocation, false, camera.cameraMatrix);
                gl.uniformMatrix4fv(projMatrixLocation, false, projectionMatrix);

                gl.drawElements(gl.TRIANGLES, om.indexs.length, gl.UNSIGNED_SHORT, 0);
            }
        }

    });
}

/**
 * @function createModelAttributeArray - Extracts the Attributes from JSON and stores them in ModelAttribute Array
 * attributes include {vertices, normals, indices, and texture coordinates}
 * 
 * @param {JSON} obj2 3D Model in JSON Format
 */
function createModelAttributeArray(obj2) {
    // obj.mesh[x] is an array of attributes
    // vertices, normals, texture coord, indices

    // get number of meshes
    let numMeshIndexs = obj2.meshes.length;
    let idx = 0;
    for (idx = 0; idx < numMeshIndexs; idx++) {
        let modelObj = {};
        modelObj.objIndex = obj_index;

        modelObj.vertices = obj2.meshes[idx].vertices;
        
        modelObj.normals = obj2.meshes[idx].normals;

        // now get index array data from faces, [[x,y,z], [x,y,z], ...]
        // to [x,y,z,x,y,z,...]. use array concat to transform
        modelObj.indexs = [].concat(...obj2.meshes[idx].faces);

        //which material index to use for this set of indices?
        modelObj.matIndex = obj2.meshes[idx].materialindex;

        if (obj2.meshes[idx].texturecoords !== undefined)
            modelObj.textureCoords = obj2.meshes[idx].texturecoords[0];
        else
            console.log(`texture coords for ${idx} does not exist`);

        let texFileN = obj.materials[modelObj.matIndex].properties.find(x => x.key === '$tex.file').value;
        modelObj.matUrl = ('./texture/' + texFileN);
        modelObj.matImg = new Image();
        modelObj.matImg.src = modelObj.matUrl;

        // push onto array
        ModelAttributeArray.push(modelObj);
    }
    obj_index = obj_index + 1;
}
/**
 * @function createMaterialsArray - Extracts the Materials from JSON and stores them in ModelAttribute Array
 * attributes include {ambient, diffuse, shininess, specular and possible textures}
 * @param {JSON} obj2 3D Model in JSON Format
 * 
 */
function createMaterialsArray(obj2){
    console.log('In createMaterialsArray...');
    console.log(obj2.meshes.length);
    // length of the materials array
    // loop through array extracting material properties 
    // needed for rendering
    let itr = obj2.materials.length;
    let idx = 0;

    // each iteration creates a new group or set of attributes for one draw call
    for (idx = 0; idx < itr; idx++) {
        let met = {};
        // shading 
        met.shadingm = obj2.materials[idx].properties[1].value;
        met.ambient = obj2.materials[idx].properties[2].value;
        met.diffuse = obj2.materials[idx].properties[3].value;
        met.specular = obj2.materials[idx].properties[4].value;
        met.shininess = obj2.materials[idx].properties[5].value;

        // object containing all the illumination comp needed to 
        // illuminate faces using material properties for index idx
        ModelMaterialsArray.push(met);
    }
}

function loadExternalJSON(url) {
    fetch(url)
        .then((resp) => {
            // if the fetch does not result in an network error
            if (resp.ok)
                return resp.json(); // return response as JSON
            throw new Error(`Could not get ${url}`);
        })
        .then(function (ModelInJson) {
            // get a reference to JSON mesh model for debug or other purposes 
            obj = ModelInJson;
            createMaterialsArray(ModelInJson);
            createModelAttributeArray(ModelInJson);
        })
        .catch(function (error) {
            // error retrieving resource put up alerts...
            alert(error);
            console.log(error);
        });
}
