precision mediump float;

uniform sampler2D u_Sampler;
uniform sampler2D u_ShadowMapSampler;

uniform vec3 u_MaterialAmbientColor;
uniform vec3 u_MaterialDiffuseColor;
uniform vec3 u_MaterialSpecularColor;
uniform vec3 u_MaterialEmissiveColor;
uniform float u_MaterialShininess;

uniform vec3 u_LightAmbientColor;

uniform vec3 u_LightPosition;
uniform vec3 u_LightDiffuseColor;
uniform vec3 u_LightSpecularColor;
uniform float u_LightIntensity;

varying vec4 v_FragPosition_World;
varying vec4 v_FragPosition_Camera;
varying vec4 v_FragPosition_Shadow;
varying vec3 v_FragNormal_World;
varying vec2 v_FragTextureCoord;

varying mat4 v_ViewMatrix;

const mat4 c_DepthBiasMatrix = mat4( 0.5, 0.0, 0.0, 0.0,
                                     0.0, 0.5, 0.0, 0.0,
                                     0.0, 0.0, 0.5, 0.0,
                                     0.5, 0.5, 0.5, 1.0 );

vec4 fragPosition_Shadow;
float visibility;

vec3 cameraDirection;

vec4 surfaceColor;
vec3 ambientColor;
vec3 emissiveColor;
vec3 diffuseColor;
vec3 specularColor;

vec3 lightDirection_World;
vec3 lightDirection_Camera;
float lightDistance_World;
float lightAttenuation;

float diffuseCoefficient;
float specularCoefficient;

vec3 reflectionDirection;


void main() {

    fragPosition_Shadow = v_FragPosition_Shadow / v_FragPosition_Shadow.w;
    visibility = 1.0;

    if ( texture2D( u_ShadowMapSampler, fragPosition_Shadow.xy ).z < fragPosition_Shadow.z ) {
        visibility = 0.5;
    }

    cameraDirection = normalize( -v_FragPosition_Camera.xyz );

    surfaceColor  = texture2D( u_Sampler, vec2( v_FragTextureCoord.s, v_FragTextureCoord.t ) );
    diffuseColor  = vec3( 0.0, 0.0, 0.0 );
    specularColor = vec3( 0.0, 0.0, 0.0 );


    /*
     * Use world space for light direction on the diffuse component but camera space for light direction on the specular one.
     * This allows for specular highlights to shift as the camera moves, even though the diffuse component will remain static.
     */

    lightDirection_World = normalize( u_LightPosition - v_FragPosition_World.xyz );
    lightDirection_Camera = normalize( vec3( v_ViewMatrix * vec4( u_LightPosition, 1.0 ) ) - v_FragPosition_Camera.xyz );


    /*
     * Light distance is measured in world space.
     */

    lightDistance_World = length( u_LightPosition - v_FragPosition_World.xyz  );


    /*
     * Attenuation is an approximation of inverse square falloff.
     */

    lightAttenuation = u_LightIntensity / ( 1.0 + ( 0.1 * lightDistance_World ) + ( 0.01 * lightDistance_World * lightDistance_World ) );


    /*
     * Diffuse component.
     * World space vectors are used for both the light direction
     * and the normal.
     */

    diffuseCoefficient = max( dot( lightDirection_World, v_FragNormal_World ), 0.0 );
    diffuseColor = diffuseCoefficient * u_MaterialDiffuseColor * u_LightDiffuseColor * lightAttenuation;


    /*
     * Specular component.
     * The camera space light direction vector is used for the reflection.
     * This is what causes the highlight to slide across the surface as
     * the viewpoint changes.
     */

    specularCoefficient = 0.0;


    /*
     * Only apply specular highlights to surfaces which receive light.
     */

    if ( diffuseCoefficient > 0.0 ) {

        reflectionDirection = reflect( -lightDirection_Camera, v_FragNormal_World );
        specularCoefficient = pow( max( dot( cameraDirection, reflectionDirection ), 0.0 ), u_MaterialShininess );

    }

    specularColor = specularCoefficient * u_MaterialSpecularColor * u_LightSpecularColor;


    gl_FragColor = vec4( vec3( visibility )
                         * ( surfaceColor.rgb
                             * ( diffuseColor + specularColor ) ),
                         surfaceColor.a );

}