attribute vec3 a_VertexPosition;
attribute vec2 a_TextureCoord;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;

varying vec2 v_FragTextureCoord;

void main( void ) {

    v_FragTextureCoord = a_TextureCoord;
    gl_Position = u_ProjectionMatrix * ( u_ViewMatrix * ( u_ModelMatrix * vec4( a_VertexPosition, 1.0 ) ) );

}