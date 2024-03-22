attribute vec3 a_VertexPosition;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;

void main( void ) {

    gl_Position = u_ProjectionMatrix * ( u_ViewMatrix * ( u_ModelMatrix * vec4( a_VertexPosition, 1.0 ) ) );

}