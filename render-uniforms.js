function setCameraMatrixUniforms() {

    GL.uniformMatrix4fv( SHADER.uniforms[ 'u_ProjectionMatrix' ], false, GLProjectionMatrix );
    GL.uniformMatrix4fv( SHADER.uniforms[ 'u_ViewMatrix' ], false, GLViewMatrix );

};

function setModelMatrixUniforms() {

    GL.uniformMatrix4fv( SHADER.uniforms[ 'u_ModelMatrix' ], false, GLModelMatrix );

    switch ( SHADER ) {
        case SHADERS.pointLight:
        case SHADERS.spotLight:
            GL.uniformMatrix3fv( SHADER.uniforms[ 'u_NormalMatrix' ], false, GLNormalMatrix );
        default:
            break;
    }

};

function setFlatColorUniforms( index ) {

    'use strict';

    GL.uniform1i( SHADER.uniforms[ 'u_Sampler' ], 0 );

};

function setDepthGrayscaleUniforms() {
    'use strict';

    GL.uniform1i( SHADER.uniforms[ 'u_Sampler' ], 0 );
};

function setPointLightUniforms( index ) {

    'use strict';

    var x = index * 3,
        y = x + 1,
        z = x + 2,
        type = SCENE.lights.spot;

    GL.uniform1i( SHADER.uniforms[ 'u_Sampler' ], 0 );
    GL.uniform1i( SHADER.uniforms[ 'u_ShadowMapSampler' ], 1 );

    GL.uniformMatrix4fv( SHADER.uniforms[ 'u_LightProjectionMatrix' ],
                         false,
                         type.projectionMatrices[ index ] );

    GL.uniformMatrix4fv( SHADER.uniforms[ 'u_LightViewMatrix' ],
                         false,
                         type.viewMatrices[ index ] );

    GL.uniform3fv( SHADER.uniforms[ 'u_LightPosition' ],
                   [ type.positions[ x ],
                     type.positions[ y ],
                     type.positions[ z ] ] );

    GL.uniform3fv( SHADER.uniforms[ 'u_LightDiffuseColor' ],
                   [ type.diffuseColors[ x ],
                     type.diffuseColors[ y ],
                     type.diffuseColors[ z ] ] );

    GL.uniform3fv( SHADER.uniforms[ 'u_LightSpecularColor' ],
                   [ type.specularColors[ x ],
                     type.specularColors[ y ],
                     type.specularColors[ z ] ] );

    GL.uniform1f( SHADER.uniforms[ 'u_LightIntensity' ], type.intensities[ index ] );

};

function setSpotLightUniforms( index ) {

    'use strict';

    var x = index * 3,
        y = x + 1,
        z = x + 2,
        type = SCENE.lights.spot,
        inverseView = Mat4.create();;

    GL.uniform1i( SHADER.uniforms[ 'u_Sampler' ], 0 );
    GL.uniform1i( SHADER.uniforms[ 'u_ShadowMapSampler' ], 1 );

    GL.uniformMatrix4fv( SHADER.uniforms[ 'u_LightProjectionMatrix' ],
                         false,
                         type.projectionMatrices[ index ] );

    GL.uniformMatrix4fv( SHADER.uniforms[ 'u_LightViewMatrix' ],
                         false,
                         type.viewMatrices[ index ] );

    GL.uniform3fv( SHADER.uniforms[ 'u_LightPosition' ],
                   [ type.positions[ x ],
                     type.positions[ y ],
                     type.positions[ z ] ] );

    GL.uniform3fv( SHADER.uniforms[ 'u_LightDirection' ],
                   [ type.directions[ x ],
                     type.directions[ y ],
                     type.directions[ z ] ] );

    GL.uniform1f( SHADER.uniforms['u_LightAngle' ], type.angles[ index ] );

    GL.uniform1f( SHADER.uniforms[ 'u_LightExponent' ], type.exponents[ index ] );

    GL.uniform3fv( SHADER.uniforms[ 'u_LightDiffuseColor' ],
                   [ type.diffuseColors[ x ],
                     type.diffuseColors[ y ],
                     type.diffuseColors[ z ] ] );

    GL.uniform3fv( SHADER.uniforms[ 'u_LightSpecularColor' ],
                   [ type.specularColors[ x ],
                     type.specularColors[ y ],
                     type.specularColors[ z ] ] );

    GL.uniform1f( SHADER.uniforms[ 'u_LightIntensity' ], type.intensities[ index ] );

};

function setMaterialUniforms( material ) {

    GL.uniform3fv( SHADER.uniforms[ 'u_MaterialAmbientColor' ], material.ambientColor );
    GL.uniform3fv( SHADER.uniforms[ 'u_MaterialDiffuseColor' ], material.diffuseColor );
    GL.uniform3fv( SHADER.uniforms[ 'u_MaterialEmissiveColor' ], material.emissiveColor );
    GL.uniform3fv( SHADER.uniforms[ 'u_MaterialSpecularColor' ], material.specularColor );
    GL.uniform1f( SHADER.uniforms[ 'u_MaterialShininess' ], material.shininess );

};