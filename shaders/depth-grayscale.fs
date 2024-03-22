precision mediump float;

uniform sampler2D u_Sampler;

varying vec2 v_FragTextureCoord;

vec3 depthValue;
float brightness = 0.5;
vec3 averageLuminance = vec3( 1.0, 1.0, 1.0 );
float contrast = 20.0;

void main() {

    depthValue = texture2D( u_Sampler, v_FragTextureCoord ).rrr;

    // Adjust brightness and contrast
    depthValue = mix( depthValue * brightness, mix( averageLuminance, depthValue, contrast ), 0.5 );

    gl_FragColor = vec4( depthValue, 1.0 );

}