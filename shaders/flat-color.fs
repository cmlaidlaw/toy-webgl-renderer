precision mediump float;

uniform sampler2D u_Sampler;

varying vec2 v_FragTextureCoord;

void main() {

    gl_FragColor = vec4( texture2D( u_Sampler,
                                    vec2( v_FragTextureCoord.s, v_FragTextureCoord.t ) ) );

}