attribute vec3 a_VertexPosition;
attribute vec3 a_VertexNormal;
attribute vec2 a_TextureCoord;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;
uniform mat3 u_NormalMatrix;

uniform mat4 u_LightProjectionMatrix;
uniform mat4 u_LightViewMatrix;

varying vec4 v_FragPosition_World;
varying vec4 v_FragPosition_Camera;
varying vec4 v_FragPosition_Shadow;
varying vec3 v_FragNormal_World;
varying vec2 v_FragTextureCoord;

varying mat4 v_ViewMatrix;

varying mat4 v_LightProjectionMatrix;
varying mat4 v_LightViewMatrix;

const mat4 c_DepthBiasMatrix = mat4( 0.5, 0.0, 0.0, 0.0,
                                     0.0, 0.5, 0.0, 0.0,
                                     0.0, 0.0, 0.5, 0.0,
                                     0.5, 0.5, 0.5, 1.0 );

void main( void ) {

    v_FragPosition_World = u_ModelMatrix * vec4( a_VertexPosition, 1.0 );
    v_FragPosition_Camera = u_ViewMatrix * v_FragPosition_World;
    v_FragPosition_Shadow = c_DepthBiasMatrix
                            * ( u_LightProjectionMatrix
                                * ( u_LightViewMatrix * v_FragPosition_World ) );
    v_FragNormal_World = normalize( u_NormalMatrix * a_VertexNormal );
    v_FragTextureCoord = a_TextureCoord;

    v_ViewMatrix = u_ViewMatrix;

    gl_Position = u_ProjectionMatrix *  v_FragPosition_Camera;

}