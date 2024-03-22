precision mediump float;

uniform sampler2D u_Sampler;
uniform sampler2D u_ShadowMapSampler;

uniform vec3 u_MaterialAmbientColor;
uniform vec3 u_MaterialDiffuseColor;
uniform vec3 u_MaterialSpecularColor;
uniform vec3 u_MaterialEmissiveColor;
uniform float u_MaterialShininess;

uniform vec3 u_LightPosition;
uniform vec3 u_LightDirection;
uniform float u_LightAngle;
uniform float u_LightExponent;
uniform vec3 u_LightDiffuseColor;
uniform vec3 u_LightSpecularColor;
uniform float u_LightIntensity;

varying vec4 v_FragPosition_World;
varying vec4 v_FragPosition_Camera;
varying vec4 v_FragPosition_Shadow;
varying vec3 v_FragNormal_World;
varying vec2 v_FragTextureCoord;

varying mat4 v_ViewMatrix;



float visibility;
vec4 fragPosition_Shadow;
vec2 poissonDisk[4];

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

float spotAngle;
float spotCutoffAngle;
float spotEffect;

float diffuseCoefficient;
float specularCoefficient;

vec3 reflectionDirection;


void main() {

    visibility = 1.0;



    // Perform conversion from homogenous coordinates explicitly
    fragPosition_Shadow = v_FragPosition_Shadow / v_FragPosition_Shadow.w;

    poissonDisk[0] = vec2( -0.94201624, -0.39906216 );
    poissonDisk[1] = vec2( 0.94558609, -0.76890725 );
    poissonDisk[2] = vec2( -0.094184101, -0.92938870 );
    poissonDisk[3] = vec2( 0.34495938, 0.29387760 );

    // Use poisson disk-based PCF sampling to reduce aliasing.
    if ( v_FragPosition_Shadow.w > 0.0 ) {
        for (int i = 0; i < 4; i++ ) {
          if ( texture2D( u_ShadowMapSampler, fragPosition_Shadow.st + poissonDisk[i] / 700.0 ).z < fragPosition_Shadow.z ) {
            visibility -= 0.25;
          }
        }
    }

    surfaceColor  = texture2D( u_Sampler, v_FragTextureCoord.st );
    ambientColor  = u_MaterialAmbientColor;
    emissiveColor = u_MaterialEmissiveColor;
    diffuseColor  = vec3( 0.0, 0.0, 0.0 );
    specularColor = vec3( 0.0, 0.0, 0.0 );

    cameraDirection = normalize( -v_FragPosition_Camera.xyz );

    lightDirection_World = normalize( u_LightPosition - v_FragPosition_World.xyz );


    /*
     * The spot angle measures whether or not a fragment is within
     * the spot light's cone of influence.
     */

    spotAngle = dot( normalize( u_LightDirection ), normalize( -lightDirection_World ) );

    spotCutoffAngle = u_LightAngle;

    /*
     * Only process this fragment if it is within the spot light's
     * cone of influence.
     */

    if ( spotAngle > spotCutoffAngle ) {

        lightDirection_Camera = normalize( vec3( v_ViewMatrix * vec4( u_LightPosition, 1.0 ) ) - v_FragPosition_Camera.xyz );
        lightDistance_World = length( u_LightPosition - v_FragPosition_World.xyz  );


        /*
         * Spot effect is the "softness" of the transition from the
         * edge of the spot beam to its core.
         * The higher the exponent, the softer the transition will be.
         * An exponent of one will result in a crisp edge.
         */

        spotEffect = pow( spotAngle, u_LightExponent );


        /*
         * Attenuation now uses the product of the spot effect and
         * the light's intensity instead of the light's intensity
         * as its numerator.
         */

        lightAttenuation = ( u_LightIntensity * spotEffect ) / ( 1.0 + ( 0.1 * lightDistance_World ) + ( 0.01 * lightDistance_World * lightDistance_World ) );

        diffuseCoefficient = max( dot( lightDirection_World, v_FragNormal_World ), 0.0 );
        diffuseColor = diffuseCoefficient * u_MaterialDiffuseColor * u_LightDiffuseColor * lightAttenuation;


        specularCoefficient = 0.0;

        if ( diffuseCoefficient > 0.0 ) {

            reflectionDirection = reflect( -lightDirection_Camera, v_FragNormal_World );
            specularCoefficient = pow( max( dot( cameraDirection, reflectionDirection ), 0.0 ), u_MaterialShininess );

        }

        specularColor = specularCoefficient * u_MaterialSpecularColor * u_LightSpecularColor * spotEffect;

    }

    gl_FragColor = vec4( vec3( visibility )
                         * ( surfaceColor.rgb
                             * ( diffuseColor + specularColor ) ),
                         surfaceColor.a );

}