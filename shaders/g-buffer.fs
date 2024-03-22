#extension GL_EXT_draw_buffers : require

precision highp float;

void main(void) {

    gl_FragData[0] = vec4( 1.0, 0.0, 0.0, 1.0 );
    gl_FragData[0] = vec4( 0.0, 1.0, 0.0, 1.0 );
    gl_FragData[0] = vec4( 0.0, 0.0, 1.0, 1.0 );
    gl_FragData[0] = vec4( 1.0, 1.0, 1.0, 1.0 );

}