#version 300 es
in vec3 v_position;
in vec3 v_normal;
in vec2 v_texcoord;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

out vec2 o_texcoord;
out vec3 o_normal;

void main(){
    gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(v_position, 1.0);
    o_normal = normalize(vec3((transpose(inverse(u_modelMatrix))) * vec4(v_normal, 0.0)));
    o_texcoord = v_texcoord;
}
