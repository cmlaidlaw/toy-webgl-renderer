ForwardRenderer = function( canvasId, assets, scene ) {

    //
    // Renderer 'constants'.
    //

    this.GL_VERTEX_POSITION_ATTRIBUTE = 0;
    this.GL_VERTEX_NORMAL_ATTRIBUTE = 1;
    this.GL_TEXTURE_COORD_ATTRIBUTE = 2;

    this.SHADOW_MAP_SIZE = 512;


    //
    // Renderer runtime data.
    //

    // Viewport 
    this.viewportWidth = 0;
    this.viewportHeight = 0;
    this.viewportAspectRatio = 1;

    // WebGL context handle.
    this.gl = null;

    // Shaders and extensions.
    this.shaderPrograms = {};
    this.extensions = {};

    // Matrices and matrix stacks.
    this.projectionMatrix = Mat4.create();
    this.projectionMatrxStack = [];
    this.viewMatrix = Mat4.create();
    this.viewMatrixStack = [];
    this.modelMatrix = Mat4.create();
    this.modelMatrixStack = [];
    this.normalMatrix = Mat3.create();

    // Shadow values to avoid costly GL state changes.
    this.activeShader = null;
    this.activeMesh = null;
    this.activeMaterial = null;
    this.activeTexture = null;

    this.data = {
        meshes: {},
        materials: {},
        textures: {}
    };

    this._init( canvasId, assets, scene );

};

ForwardRenderer.prototype._init = function( canvasId, assets, scene ) {

    'use strict';

    var canvas = document.getElementById( canvasId ),
        gl,
        ok;

    this.viewportWidth = canvas.width;
    this.viewportHeight = canvas.height;
    this.viewportAspectRatio = canvas.width / canvas.height;

    this.gl = gl = GLU.init( canvasId );

    if ( this.gl === null ) {
        console.error( '<ForwardRenderer> Fatal error: Could not initialize WebGL ' +
                       'context.' );
        return false;
    }

    ok = this._initExtensions();
    if ( ! ok ) {
        console.error( '<ForwardRenderer> Fatal error: Could not initialize required ' +
                       'extensions.' );
        //return false;
    }

    ok = this._initShaders( assets.shaders, assets.programs );
    if ( ! ok ) {
        console.error( '<ForwardRenderer> Fatal error: Could not initialize shader ' +
                       'programs.' );
        return false;
    }

    ok = this._initBuffers( assets.meshes );
    if ( ! ok ) {
        console.error( '<ForwardRenderer> Fatal error: Could not initialize mesh ' +
                       'buffers.' );
        return false;
    }

    ok = this._initMaterials( assets.materials );
    if ( ! ok ) {
        console.error( '<ForwardRenderer> Fatal error: Could not initialize material ' +
                       'buffers.' );
        return false;
    }

    ok = this._initTextures( assets.textures );
    if ( ! ok ) {
        console.error( '<ForwardRenderer> Fatal error: Could not initialize texture ' +
                       'buffers.' );
        return false;
    }

    ok = this._initShadowMaps( scene );
    if ( ! ok ) {
        console.error( '<ForwardRenderer> Fatal error: Could not initialize shadow ' +
                       'maps.' );
        return false;
    }

    gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
    gl.enable( gl.CULL_FACE );

    return true;

};

ForwardRenderer.prototype._initExtensions = function() {

    'use strict';

    var gl = this.gl;

    this.extensions.depthTexture = gl.getExtension( 'WEBGL_depth_texture' );

    if ( ! this.extensions.depthTexture ) {
        console.error( 'Could not fetch "WEBGL_depth_texture" extension.' );
        return false;
    }

    return true;

};

ForwardRenderer.prototype._initShaders = function( shaders, programs ) {

    'use strict';

    var gl = this.gl,
        programName,
        program;

    for ( programName in programs ) {

        if ( programs.hasOwnProperty( programName )
             && ! this.shaderPrograms.hasOwnProperty( programName ) ) {

            program = programs[ programName ];

            this.shaderPrograms[ programName ] = this._initShader( shaders[ program[0] ],
                                                                   shaders[ program[1] ] );

        }

    }

    for ( programName in this.shaderPrograms ) {
        if ( this.shaderPrograms[ programName ] === null ) {
            console.error( '<ForwardRenderer> Error initializing shader program ' +
                           '"' + programName + '".' );
            return false;
        }
    }

    return true;

};

ForwardRenderer.prototype._initShader = function( vertexShaderSource, fragmentShaderSource ) {

    'use strict';

    var gl = this.gl,
        vertexShader,
        fragmentShader,
        shaderProgram,
        i,
        attribCount,
        attrib,
        uniformCount,
        uniform;

    vertexShader = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource( vertexShader, vertexShaderSource );
    gl.compileShader( vertexShader );

    if ( ! gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) ) {
        console.error( 'Error compiling vertex shader: ' + gl.getShaderInfoLog( vertexShader ) );    
        return false;
    }

    fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource( fragmentShader, fragmentShaderSource );
    gl.compileShader( fragmentShader );

    if ( ! gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) ) {
        console.error( 'Error compiling fragment shader: ' + gl.getShaderInfoLog( fragmentShader ) );
        return false;
    }

    // Create the shader program

    shaderProgram = gl.createProgram();

    // Bind the attributes statically so that 'a_VertexPosition' is always attribute 0.

    gl.bindAttribLocation( shaderProgram, this.GL_VERTEX_POSITION_ATTRIBUTE, 'a_VertexPosition' );
    gl.bindAttribLocation( shaderProgram, this.GL_VERTEX_NORMAL_ATTRIBUTE, 'a_VertexNormal' );
    gl.bindAttribLocation( shaderProgram, this.GL_TEXTURE_COORD_ATTRIBUTE, 'a_TextureCoord' );

    // Attach and link.

    gl.attachShader( shaderProgram, vertexShader );
    gl.attachShader( shaderProgram, fragmentShader );
    gl.linkProgram( shaderProgram );

    if ( ! gl.getProgramParameter( shaderProgram, gl.LINK_STATUS ) ) {
        console.error( 'Error linking shader program.' );
        return false;
    }

    // Now iterate over all of the active attributes and uniforms and store handles
    // to which we can bind data.

    shaderProgram.attribs = {};
    attribCount = gl.getProgramParameter( shaderProgram, gl.ACTIVE_ATTRIBUTES );

    for ( i = 0; i < attribCount; i++ ) {
        attrib = gl.getActiveAttrib( shaderProgram, i );
        shaderProgram.attribs[ attrib.name ] = gl.getAttribLocation( shaderProgram, attrib.name );
    }

    shaderProgram.uniforms = {};
    uniformCount = gl.getProgramParameter( shaderProgram, gl.ACTIVE_UNIFORMS );

    for ( i = 0; i < uniformCount; i++ ) {
        uniform = gl.getActiveUniform( shaderProgram, i ) ;
        shaderProgram.uniforms[ uniform.name ] = gl.getUniformLocation( shaderProgram, uniform.name );
    }

    return shaderProgram;

};

ForwardRenderer.prototype._initBuffers = function( meshes ) {

    'use strict';

    var gl = this.gl,
        meshName,
        meshData,
        vertexIndexBuffer,
        vertexPositionBuffer,
        vertexNormalBuffer,
        textureCoordBuffer;

    try {

        for ( meshName in meshes ) {

            if ( meshes.hasOwnProperty( meshName )
                 && ! this.data.meshes.hasOwnProperty( meshName ) ) {

                meshData = meshes[ meshName ];

                vertexIndexBuffer = gl.createBuffer();
                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer );
                gl.bufferData( gl.ELEMENT_ARRAY_BUFFER,
                               new Uint16Array( meshData.vertexIndices ),
                               gl.STATIC_DRAW );

                vertexPositionBuffer = gl.createBuffer();
                gl.bindBuffer( gl.ARRAY_BUFFER, vertexPositionBuffer );
                gl.bufferData( gl.ARRAY_BUFFER,
                               new Float32Array( meshData.vertexPositions ),
                               gl.STATIC_DRAW );

                vertexNormalBuffer = gl.createBuffer();
                gl.bindBuffer( gl.ARRAY_BUFFER, vertexNormalBuffer );
                gl.bufferData( gl.ARRAY_BUFFER,
                               new Float32Array( meshData.vertexNormals ),
                               gl.STATIC_DRAW );

                textureCoordBuffer = gl.createBuffer();
                gl.bindBuffer( gl.ARRAY_BUFFER, textureCoordBuffer);
                gl.bufferData( gl.ARRAY_BUFFER,
                               new Float32Array( meshData.textureCoords ),
                               gl.STATIC_DRAW );

                this.data.meshes[ meshName ] = {
            
                    vertexIndexBuffer: vertexIndexBuffer,
                    vertexIndexLength: meshData.vertexIndices.length,
                    vertexPositionBuffer: vertexPositionBuffer,
                    vertexPositionLength: meshData.vertexPositions.length,
                    vertexNormalBuffer: vertexNormalBuffer,
                    vertexNormalLength: meshData.vertexNormals.length,
                    textureCoordBuffer: textureCoordBuffer,
                    textureCoordLength: meshData.textureCoords.length

                };

            }

        }

    } catch ( e ) {
        return false;
    }

    return true;

};

ForwardRenderer.prototype._initMaterials = function( materials ) {

    'use strict';

    var materialName;

    this.data.materials[ 'default.mtl' ] = {
        ambientColor: [ 1.0, 1.0, 1.0 ],
        diffuseColor: [ 0.0, 0.0, 0.0 ],
        emissiveColor: [ 0, 0, 0 ],
        specularColor: [ 0.0, 0.0, 0.0 ],
        shininess: 1.0
    };

    try {

        for ( materialName in materials ) {

            if ( materials.hasOwnProperty( materialName )
                 && ! this.data.materials.hasOwnProperty( materialName ) ) {

                this.data.materials[ materialName ] = materials[ materialName ];

            }

        }

    } catch ( e ) {
        return false;
    }

    return true;

};

ForwardRenderer.prototype._initTextures = function( textures ) {

    'use strict';

    var gl = this.gl,
        textureName;

    try {

        for ( textureName in textures ) {

            if ( textures.hasOwnProperty( textureName )
                 && ! this.data.textures.hasOwnProperty( textureName ) ) {

                this.data.textures[ textureName ] = gl.createTexture();
                gl.bindTexture( gl.TEXTURE_2D, this.data.textures[ textureName ] );
                gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
                gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
                gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );
                gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[ textureName ] );
                gl.generateMipmap( gl.TEXTURE_2D );
                gl.bindTexture( gl.TEXTURE_2D, null );

            }

        }

    } catch ( e ) {
        return false;
    }

    return true;

};

ForwardRenderer.prototype._initShadowMaps = function( scene ) {

    var type,
        shadowMap;

    type = scene.lights.spot;

    for ( i = 0; i < 16; i++ ) {

        shadowMap = this._createShadowMap( this.SHADOW_MAP_SIZE );
        if ( shadowMap === null ) {
            console.error( '<ForwardRenderer> Fatal error: Could not initialize ' +
                           'shadow map.' );
            return false;
        }

        type.colorTextures[ i ] = shadowMap.colorTexture;
        type.depthTextures[ i ] = shadowMap.depthTexture;
        type.framebuffers[ i ] = shadowMap.framebuffer;

    }

    return true;

};

ForwardRenderer.prototype._createShadowMap = function( size ) {

    'use strict';

    var gl = this.gl,
        colorTexture = gl.createTexture(),
        depthTexture = gl.createTexture(),
        framebuffer = gl.createFramebuffer();

    // The color texture is used only to keep the WebGL context from throwing
    // a "framebuffer incomplete" INVALID_FRAMEBUFFER_OPERATION error

    gl.bindTexture( gl.TEXTURE_2D, colorTexture );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );

    gl.bindTexture( gl.TEXTURE_2D, depthTexture );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, size, size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null );

    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0 );
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0 );

    if ( ! gl.checkFramebufferStatus( gl.FRAMEBUFFER ) === gl.FRAMEBUFFER_COMPLETE ) {

        console.error( 'Incomplete framebuffer for shadow map.' );

        gl.bindTexture( gl.TEXTURE_2D, null );
        gl.bindFramebuffer( gl.FRAMEBUFFER, null );

        return null;

    }

    gl.bindTexture( gl.TEXTURE_2D, null );
    gl.bindFramebuffer( gl.FRAMEBUFFER, null );

    return { framebuffer: framebuffer, colorTexture: colorTexture, depthTexture: depthTexture };

};



ForwardRenderer.prototype._pushProjectionMatrix = function() {

    'use strict';

    var m;

    m = Mat4.create();
    Mat4.copy( m, this.glProjectionMatrix );
    this.glProjectionMatrixStack.push( m );

};

ForwardRenderer.prototype._popProjectionMatrix = function() {

    'use strict';

    var m;

    m = this.glProjectionMatrixStack.pop();
    Mat4.copy( this.glProjectionMatrix, m );

};

ForwardRenderer.prototype._pushViewMatrix = function() {

    'use strict';

    var m;

    m = Mat4.create();
    Mat4.copy( m, this.glViewMatrix );
    this.glViewMatrixStack.push( m );

};

ForwardRenderer.prototype._popViewMatrix = function() {

    'use strict';

    var m;

    m = this.glViewMatrixStack.pop();
    Mat4.copy( this.glViewMatrix, m );

};

ForwardRenderer.prototype._pushModelMatrix = function() {

    'use strict';

    var m;

    m = Mat4.create();
    Mat4.copy( m, this.modelMatrix );
    this.modelMatrixStack.push( m );

};

ForwardRenderer.prototype._popModelMatrix = function() {

    'use strict';

    var m;

    m = this.modelMatrixStack.pop();
    Mat4.copy( this.modelMatrix, m );

};



/*

    CONVENTIONS

    1. Functions beginning with 'render' operate at the scene level, and batch
       draw calls for visible entities.
    2. Functions beginning with 'draw' operate at the entity level, and produce
       OpenGL draw commands.

*/

/*
 * renderScene()
 *
 * Multi-pass renderer.
 * Makes one depth pass first, then makes one pass per light with depth
 * writing disabled, blending the results additively in the default Framebuffer.
 */

ForwardRenderer.prototype.renderScene = function( scene, entities ) {

    'use strict';

    var i;

    /*
     * The main render loop:                                            SHADER USED
     *
     * 1.  Use the depth-only shader.                                   depthOnly
     * 2.  Change the global state to the proper values for rendering   |
     *     to the depth buffer.                                         |
     * 3.  Reshape the viewport to fit the shadow map size and switch   |
     *     to the proper culling method for creating shadow maps.       |
     * 4.  Render the depth buffer for each light.                      |
     * 5.  Reshape the viewport to fit the screen and switch to the     |
     *     proper culling method for rendering to it.                   |
     * 6.  The default camera will be used to render the scene depth    |
     *     buffer as well as the lighting passes.                       |
     * 7.  Still using the depth-only shader and depth-buffer drawing   |
     *     state, render the scene depth buffer.                        |
     * 8.  Finally, change the global state to the proper values for    |
     *     drawing to the screen.                                       |
     * 9.  Use the point light shader and render each point light's     pointLight
     *     contribution to the scene.                                   |
     * 10. Use the spot light shader and render each spot light's       spotLight
     *     contribution to the scene.                                   |
     * 11. Draw debug insets over the scene.                            depthGrayscale
     */

    // 1.
    this.useDepthOnlyShader();

    // 2.
    this.setDepthBufferDrawingState();

    // 3.
    this.setupShadowMapTarget();

    // 4.
    this.renderLightDepthBuffers( scene, entities );

    // 5.
    this.setupScreenTarget();

    // 6.
    this.setDefaultCameraTransform();

    // 7.
    this.renderSceneDepthBuffer( scene, entities );

    // 8.
    this.setColorDrawingState();

    // 9.
    this.renderPointLights( scene, entities );

    // 10.
    this.renderSpotLights( scene, entities );

    // 11.
    this.drawDebugInset( scene );

};


//
// Shaders
//

ForwardRenderer.prototype.useDepthOnlyShader = function() {

    'use strict';

    var gl = this.gl;

    this.activeShader = this.shaderPrograms.depth;
    gl.useProgram( this.activeShader );

    gl.enableVertexAttribArray( this.GL_VERTEX_POSITION_ATTRIBUTE );
    gl.disableVertexAttribArray( this.GL_VERTEX_NORMAL_ATTRIBUTE );
    gl.disableVertexAttribArray( this.GL_TEXTURE_COORD_ATTRIBUTE );

};

ForwardRenderer.prototype.useFlatColorShader = function() {

    'use strict';

    var gl = this.gl;

    this.activeShader = this.shaderPrograms.DEBUG_flatColor;
    gl.useProgram( this.activeShader );

    gl.enableVertexAttribArray( this.GL_VERTEX_POSITION_ATTRIBUTE );
    gl.disableVertexAttribArray( this.GL_VERTEX_NORMAL_ATTRIBUTE );
    gl.enableVertexAttribArray( this.GL_TEXTURE_COORD_ATTRIBUTE );

};

ForwardRenderer.prototype.useDepthGrayscaleShader = function() {

    'use strict';

    var gl = this.gl;

    this.activeShader = this.shaderPrograms.DEBUG_depthGrayscale;
    gl.useProgram( this.activeShader );

    gl.enableVertexAttribArray( this.GL_VERTEX_POSITION_ATTRIBUTE );
    gl.disableVertexAttribArray( this.GL_VERTEX_NORMAL_ATTRIBUTE );
    gl.enableVertexAttribArray( this.GL_TEXTURE_COORD_ATTRIBUTE );

};

ForwardRenderer.prototype.usePointLightShader = function() {

    'use strict';

    var gl = this.gl;

    this.activeShader = this.shaderPrograms.pointLight;
    gl.useProgram( this.activeShader );

    gl.enableVertexAttribArray( this.GL_VERTEX_POSITION_ATTRIBUTE );
    gl.enableVertexAttribArray( this.GL_VERTEX_NORMAL_ATTRIBUTE );
    gl.enableVertexAttribArray( this.GL_TEXTURE_COORD_ATTRIBUTE );

};

ForwardRenderer.prototype.useSpotLightShader = function() {

    'use strict';

    var gl = this.gl;

    this.activeShader = this.shaderPrograms.spotLight;
    gl.useProgram( this.activeShader );

    gl.enableVertexAttribArray( this.GL_VERTEX_POSITION_ATTRIBUTE );
    gl.enableVertexAttribArray( this.GL_VERTEX_NORMAL_ATTRIBUTE );
    gl.enableVertexAttribArray( this.GL_TEXTURE_COORD_ATTRIBUTE );

};



//
// Uniforms
//

ForwardRenderer.prototype.setCameraMatrixUniforms = function() {

    'use strict';

    var gl = this.gl;

    gl.uniformMatrix4fv( this.activeShader.uniforms[ 'u_ProjectionMatrix' ], false, this.projectionMatrix );
    gl.uniformMatrix4fv( this.activeShader.uniforms[ 'u_ViewMatrix' ], false, this.viewMatrix );

};

ForwardRenderer.prototype.setModelMatrixUniforms = function() {

    'use strict';

    var gl = this.gl;

    gl.uniformMatrix4fv( this.activeShader.uniforms[ 'u_ModelMatrix' ], false, this.modelMatrix );

    switch ( this.activeShader ) {
        case this.shaderPrograms.pointLight:
        case this.shaderPrograms.spotLight:
            gl.uniformMatrix3fv( this.activeShader.uniforms[ 'u_NormalMatrix' ], false, this.normalMatrix );
        default:
            break;
    }

};

ForwardRenderer.prototype.setFlatColorUniforms = function() {

    'use strict';

    this.gl.uniform1i( this.activeShader.uniforms[ 'u_Sampler' ], 0 );

};

ForwardRenderer.prototype.setDepthGrayscaleUniforms = function() {

    'use strict';

    this.gl.uniform1i( this.activeShader.uniforms[ 'u_Sampler' ], 0 );
};

ForwardRenderer.prototype.setPointLightUniforms = function( scene, index ) {

    'use strict';

    var gl = this.gl,
        x = index * 3,
        y = x + 1,
        z = x + 2,
        type = scene.lights.spot;

    gl.uniform1i( this.activeShader.uniforms[ 'u_Sampler' ], 0 );
    gl.uniform1i( this.activeShader.uniforms[ 'u_ShadowMapSampler' ], 1 );

    gl.uniformMatrix4fv( this.activeShader.uniforms[ 'u_LightProjectionMatrix' ],
                         false,
                         type.projectionMatrices[ index ] );

    gl.uniformMatrix4fv( this.activeShader.uniforms[ 'u_LightViewMatrix' ],
                         false,
                         type.viewMatrices[ index ] );

    gl.uniform3fv( this.activeShader.uniforms[ 'u_LightPosition' ],
                   [ type.positions[ x ],
                     type.positions[ y ],
                     type.positions[ z ] ] );

    gl.uniform3fv( this.activeShader.uniforms[ 'u_LightDiffuseColor' ],
                   [ type.diffuseColors[ x ],
                     type.diffuseColors[ y ],
                     type.diffuseColors[ z ] ] );

    gl.uniform3fv( this.activeShader.uniforms[ 'u_LightSpecularColor' ],
                   [ type.specularColors[ x ],
                     type.specularColors[ y ],
                     type.specularColors[ z ] ] );

    gl.uniform1f( this.activeShader.uniforms[ 'u_LightIntensity' ],
                  type.intensities[ index ] );

};

ForwardRenderer.prototype.setSpotLightUniforms = function( scene, index ) {

    'use strict';

    var gl = this.gl,
        x = index * 3,
        y = x + 1,
        z = x + 2,
        type = scene.lights.spot,
        inverseView = Mat4.create();

    gl.uniform1i( this.activeShader.uniforms[ 'u_Sampler' ], 0 );
    gl.uniform1i( this.activeShader.uniforms[ 'u_ShadowMapSampler' ], 1 );

    gl.uniformMatrix4fv( this.activeShader.uniforms[ 'u_LightProjectionMatrix' ],
                         false,
                         type.projectionMatrices[ index ] );

    gl.uniformMatrix4fv( this.activeShader.uniforms[ 'u_LightViewMatrix' ],
                         false,
                         type.viewMatrices[ index ] );

    gl.uniform3fv( this.activeShader.uniforms[ 'u_LightPosition' ],
                   [ type.positions[ x ],
                     type.positions[ y ],
                     type.positions[ z ] ] );

    gl.uniform3fv( this.activeShader.uniforms[ 'u_LightDirection' ],
                   [ type.directions[ x ],
                     type.directions[ y ],
                     type.directions[ z ] ] );

    gl.uniform1f( this.activeShader.uniforms['u_LightAngle' ], type.angles[ index ] );

    gl.uniform1f( this.activeShader.uniforms[ 'u_LightExponent' ], type.exponents[ index ] );

    gl.uniform3fv( this.activeShader.uniforms[ 'u_LightDiffuseColor' ],
                   [ type.diffuseColors[ x ],
                     type.diffuseColors[ y ],
                     type.diffuseColors[ z ] ] );

    gl.uniform3fv( this.activeShader.uniforms[ 'u_LightSpecularColor' ],
                   [ type.specularColors[ x ],
                     type.specularColors[ y ],
                     type.specularColors[ z ] ] );

    gl.uniform1f( this.activeShader.uniforms[ 'u_LightIntensity' ],
                  type.intensities[ index ] );

};

ForwardRenderer.prototype.setMaterialUniforms = function( material ) {

    'use strict';

    var gl = this.gl;

    gl.uniform3fv( this.activeShader.uniforms[ 'u_MaterialAmbientColor' ], material.ambientColor );
    gl.uniform3fv( this.activeShader.uniforms[ 'u_MaterialDiffuseColor' ], material.diffuseColor );
    gl.uniform3fv( this.activeShader.uniforms[ 'u_MaterialEmissiveColor' ], material.emissiveColor );
    gl.uniform3fv( this.activeShader.uniforms[ 'u_MaterialSpecularColor' ], material.specularColor );
    gl.uniform1f( this.activeShader.uniforms[ 'u_MaterialShininess' ], material.shininess );

};



//
// Utility functions
//

ForwardRenderer.prototype.setupShadowMapTarget = function() {

    'use strict';

    var gl = this.gl;

    /*
     * 1. Reshape the viewport to the correct size for shadow maps.
     */

    gl.viewport( 0, 0, this.SHADOW_MAP_SIZE, this.SHADOW_MAP_SIZE );

    /*
     * 2. Use front-face culling for greater z-buffer accuracy.
     */

    gl.cullFace( gl.FRONT );

};

ForwardRenderer.prototype.setupScreenTarget = function() {

    'use strict';

    var gl = this.gl;

    /*
     * 1. Reshape the viewport to the correct size for the visible scene.
     */

    gl.viewport( 0, 0, this.viewportWidth, this.viewportHeight );

    /*
     * 2. Use back-face culling.
     */

    gl.cullFace( gl.BACK );

};

ForwardRenderer.prototype.setDepthBufferDrawingState = function() {

    'use strict';

    var gl = this.gl;

    /*
     * 1. Disable color writing and blending; enable depth writing.
     */

    gl.colorMask( false, false, false, false );
    gl.disable( gl.BLEND );

    /*
     * 2. Enable depth writing and testing and then set the test function to gl.LEQUAL.
     */

    gl.depthMask( true );
    gl.enable( gl.DEPTH_TEST );
    gl.depthFunc( gl.LEQUAL );

};

ForwardRenderer.prototype.setColorDrawingState = function() {

    'use strict';

    var gl = this.gl;

    /*
     * 1. Enable color writing and blending.
     */

    gl.colorMask( true, true, true, true );
    gl.enable( gl.BLEND );
    gl.blendFunc( gl.ONE, gl.ONE );

    /*
     * 2. Disable depth writing and change the depth testing function
     *    to 'GL.EQUAL' instead of 'GL.LEQUAL' to avoid z-fighting.
     */

    gl.depthMask( false );
    gl.depthFunc( gl.EQUAL );

};

ForwardRenderer.prototype.setDefaultCameraTransform = function() {

    'use strict';

    GLU.perspective( this.projectionMatrix,
                     45,
                     this.viewportAspectRatio,
                     0.5,
                     50 );

    Mat4.identity( this.viewMatrix );

    Mat4.rotateX( this.viewMatrix,
                  this.viewMatrix,
                  CAMERA.rotation[0] );

    Mat4.rotateY( this.viewMatrix,
                  this.viewMatrix,
                  CAMERA.rotation[1] );

    Mat4.rotateZ( this.viewMatrix,
                  this.viewMatrix,
                  CAMERA.rotation[2] );

    Mat4.translate( this.viewMatrix,
                    this.viewMatrix,
                    [ -CAMERA.position[0], -CAMERA.position[1], -CAMERA.position[2], 1 ] );

};

ForwardRenderer.prototype.setPointLightCameraTransform = function() {

};

ForwardRenderer.prototype.setSpotLightCameraTransform = function( position, direction, angle ) {

    'use strict';

    var position = Vec3.create( position ),
        direction = Vec3.create( direction ),
        target = Vec3.create();

    // Note that GLU.perspective() accepts angles in degrees for convenience,
    // but we store the spot light angles in radians so a conversion is necessary.

    GLU.perspective( this.projectionMatrix,
                     ( ( 180 / Math.PI ) / angle ),
                     this.SHADOW_MAP_SIZE / this.SHADOW_MAP_SIZE,
                     1.0,
                     50 );

    Mat4.identity( this.viewMatrix );

    Vec3.add( target, position, direction );

    GLU.lookAt( this.viewMatrix,
                position,
                target,
                [ 0, 1, 0 ] );

};





// Rendering

ForwardRenderer.prototype.renderLightDepthBuffers = function( scene, entities ) {

    'use strict';

    var i;

    /*
     * 1. Draw the cube map depth buffers for each point light.
     * 2. Draw 2D depth buffers for each spot light.
     */

    // 1.
    for ( i = 0; i < scene.lights.point.count; i++ ) {
        this.drawPointLightDepthBuffer( scene, entities, i );
    }

    // 2.
    for ( i = 0; i < scene.lights.spot.count; i++ ) {
        this.drawSpotLightDepthBuffer( scene, entities, i );    
    }
};

ForwardRenderer.prototype.renderSceneDepthBuffer = function( scene, entities ) {

    'use strict';

    /*
     * 1. Set the scene camera's matrix uniforms.
     * 2. Draw entities with materials and textures disabled.
     */

    // 1.
    this.setCameraMatrixUniforms();

    // 2.
    this.drawEntities( entities, false, false );

};

ForwardRenderer.prototype.renderPointLights = function( scene, entities ) {

    'use strict';

    /*
     * 1. Switch to the point light shader.
     * 2. Set the scene camera's matrix uniforms.
     * 3. Draw entities with materials and textures enabled.
     */

    // 1.
    this.usePointLightShader();

    // 2.
    this.setCameraMatrixUniforms();

    // 3.
    for ( i = 0; i < scene.lights.point.count; i++ ) {
        this.setPointLightUniforms( scene, i );
        this.drawEntities( entities, true, true );
    }

};

ForwardRenderer.prototype.renderSpotLights = function( scene, entities ) {

    'use strict';

    var gl = this.gl;

    /*
     * 1. Switch to the spot light shader.
     * 2. Set the scene camera's matrix uniforms.
     * 3. Draw entities with materials and textures enabled.
     */

    // 1.
    this.useSpotLightShader();

    // 2.
    this.setCameraMatrixUniforms();

    // 3.
    for ( i = 0; i < scene.lights.spot.count; i++ ) {

        // Bind the light's depth map for the shadow.

        gl.activeTexture( gl.TEXTURE1 );
        gl.bindTexture( gl.TEXTURE_2D, scene.lights.spot.depthTextures[i] );
        gl.activeTexture( gl.TEXTURE0 );

        this.setSpotLightUniforms( scene, i );
        this.drawEntities( entities, true, true );

        // Unbind the light's depth map.

        gl.activeTexture( gl.TEXTURE1 );
        gl.bindTexture( gl.TEXTURE_2D, null );
        gl.activeTexture( gl.TEXTURE0 );

    }

};





// THE BELOW OPERATE ON AN ENTITY-BY-ENTITY BASIS AND ARE CALLED FROM THE
// SCENE-LEVEL 'render*' FUNCTIONS.

ForwardRenderer.prototype.drawPointLightDepthBuffer = function( index ) {
    // do something with cube maps
};

ForwardRenderer.prototype.drawSpotLightDepthBuffer = function( scene, entities, index ) {

    'use strict';

    var gl = this.gl,
        type = scene.lights.spot,
        index3 = index * 3,
        position,
        direction,
        angle;

    gl.bindFramebuffer( gl.FRAMEBUFFER, type.framebuffers[ index ] );

    gl.clear( gl.DEPTH_BUFFER_BIT );

    // Set up the projection and view matrices using setSpotLightCameraTransform()

    position = Vec3.create( [ type.positions[ index3 ],
                              type.positions[ index3 + 1 ],
                              type.positions[ index3 + 2 ] ] );

    direction = Vec3.create( [ type.directions[ index3 ],
                               type.directions[ index3 + 1 ],
                               type.directions[ index3 + 2 ] ] );

    angle = type.angles[ index ];

    this.setSpotLightCameraTransform( position, direction, angle );

    this.setCameraMatrixUniforms();

    this.drawEntities( entities, false, false );

// Not sure exactly what effect the below three lines have, but things still appear
// to work when they are disabled?
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, type.depthTextures[ index ] );
    gl.bindTexture( gl.TEXTURE_2D, null );

    Mat4.copy( type.projectionMatrices[ index ], this.projectionMatrix );
    Mat4.copy( type.viewMatrices[ index ], this.viewMatrix );

    gl.bindFramebuffer( gl.FRAMEBUFFER, null );

};

ForwardRenderer.prototype.drawEntities = function( entities, drawMaterials, drawTextures ) {

    'use strict';

    var i;

    Mat4.identity( this.modelMatrix );

    for ( i = 0; i < entities.length; i++ ) {

        this.drawEntity( entities[i], drawMaterials, drawTextures );

    }

};

ForwardRenderer.prototype.drawEntity = function( entity, drawMaterials, drawTextures ) {

    'use strict';

    var gl = this.gl,
        meshName = entity.model.meshes[0],
        mesh = this.data.meshes[ meshName ],
        materialName = entity.model.materials[0],
        material = this.data.materials[ materialName ],
        textureName = entity.model.textures[0],
        texture = this.data.textures[ textureName ];

    this._pushModelMatrix();

    Mat4.translate( this.modelMatrix,
                    this.modelMatrix,
                    [ entity.position[0], entity.position[1], entity.position[2], 1 ] );

    Mat4.rotateX( this.modelMatrix,
                  this.modelMatrix,
                  entity.rotation[0] );

    Mat4.rotateY( this.modelMatrix,
                  this.modelMatrix,
                  entity.rotation[1] );

    Mat4.rotateZ( this.modelMatrix,
                  this.modelMatrix,
                  entity.rotation[2] );

    Mat4.toMat3( this.normalMatrix, this.modelMatrix );
    Mat3.invert( this.normalMatrix, this.normalMatrix );
    Mat3.transpose( this.normalMatrix, this.normalMatrix );

    this.setModelMatrixUniforms();

    if ( drawMaterials ) {

        if ( this.activeMaterial !== materialName ) {

            this.setMaterialUniforms( material );
            this.activeMaterial = materialName;

        }

    }

    if ( drawTextures ) {

        if ( this.activeTexture !== textureName ) {

            gl.activeTexture( gl.TEXTURE0 );
            gl.bindTexture( gl.TEXTURE_2D, texture );
            this.activeTexture = entity.model.textures[0];

        }

    }

    if ( this.activeMesh !== meshName ) {

        // This is a tricky switch statement: everything falls through to the
        // default case ( vertex position attribute only ) and accumulates the
        // attributes needed on the way... in other words, the top cases
        // accumulate the most attributes.

        switch ( this.activeShader ) {

            case this.shaderPrograms.pointLight:
            case this.shaderPrograms.spotLight:
                gl.bindBuffer( gl.ARRAY_BUFFER, mesh.vertexNormalBuffer );
                gl.vertexAttribPointer( this.activeShader.attribs[ 'a_VertexNormal' ], 3, gl.FLOAT, false, 0, 0 );

            case this.shaderPrograms.DEBUG_flatColor:
            case this.shaderPrograms.DEBUG_depthGrayscale:
                gl.bindBuffer( gl.ARRAY_BUFFER, mesh.textureCoordBuffer );
                gl.vertexAttribPointer( this.activeShader.attribs[ 'a_TextureCoord' ], 2, gl.FLOAT, false, 0, 0 );

            default:
                gl.bindBuffer( gl.ARRAY_BUFFER, mesh.vertexPositionBuffer );
                gl.vertexAttribPointer( this.activeShader.attribs[ 'a_VertexPosition' ], 3, gl.FLOAT, false, 0, 0 );
                break;

        }

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, mesh.vertexIndexBuffer );

        this.activeMesh = meshName;

    }

    gl.drawElements( gl.TRIANGLES, mesh.vertexIndexLength, gl.UNSIGNED_SHORT, 0 );

    this._popModelMatrix();

};

ForwardRenderer.prototype.drawDebugInset = function( scene ) {

    var gl = this.gl;

    this._pushModelMatrix();

    gl.disable( gl.DEPTH_TEST );
    gl.disable( gl.BLEND );

    this.useDepthGrayscaleShader();

    GLU.orthographic( this.projectionMatrix, -1, 1, -1, 1, 1, 10 );
    gl.uniformMatrix4fv( this.activeShader.uniforms[ 'u_ProjectionMatrix' ], false, this.projectionMatrix );

    Mat4.identity( this.viewMatrix );
    gl.uniformMatrix4fv( this.activeShader.uniforms[ 'u_ViewMatrix' ], false, this.viewMatrix );

    Mat4.identity( this.modelMatrix );
    Mat4.translate( this.modelMatrix, this.modelMatrix, [ 0, 0, -1, 0 ] );
    gl.uniformMatrix4fv( this.activeShader.uniforms[ 'u_ModelMatrix' ], false, this.modelMatrix );

    gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [ -1, 1, 0, -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0 ] ), gl.STATIC_DRAW );
    gl.vertexAttribPointer( this.activeShader.attribs[ 'a_VertexPosition' ], 3, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [ 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1 ] ), gl.STATIC_DRAW );
    gl.vertexAttribPointer( this.activeShader.attribs[ 'a_TextureCoord' ], 2, gl.FLOAT, false, 0, 0 );

    gl.viewport( 0, 240, 240, 240 );

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, scene.lights.spot.depthTextures[0] );
    this.ctiveTexture = 'buffer';

    gl.drawArrays( gl.TRIANGLES, 0, 6 );


    gl.viewport( 0, 0, 240, 240 );

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, scene.lights.spot.depthTextures[1] );
    this.activeTexture = 'buffer';

    gl.drawArrays( gl.TRIANGLES, 0, 6 );


    this._popModelMatrix();

};