#version 300 es
precision mediump float;

in vec2 o_texcoord;
in vec3 o_normal;

uniform vec3 u_ambientLightColor;
uniform vec3 u_diffuseLightColor;
uniform vec3 u_diffuseLightDirection;
uniform sampler2D textureImg;

out vec4 outColor;

void main(){
    vec3 normal = normalize(o_normal);
    vec4 color = texture(textureImg, vec2(o_texcoord.s, o_texcoord.t));
    vec3 lightDirection = normalize(u_diffuseLightDirection);
    float cosTheta = max(dot(lightDirection, normal), 0.0);
    vec3 diffuseReflection = u_diffuseLightColor * color.rgb * cosTheta;
    vec3 ambientReflection = u_ambientLightColor * color.rgb;

    outColor = vec4(ambientReflection + diffuseReflection, color.a);
}
