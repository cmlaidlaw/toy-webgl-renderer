DeferredRenderer = function( canvasId, assets, scene ) {

    //
    // Renderer 'constants'.
    //

    this.GL_VERTEX_POSITION_ATTRIBUTE = 0;
    this.GL_VERTEX_NORMAL_ATTRIBUTE = 1;
    this.GL_TEXTURE_COORD_ATTRIBUTE = 2;

    this.SHADOW_MAP_SIZE = 512;

    this.G_BUFFER_POSITION = 0;
    this.G_BUFFER_NORMAL = 1;
    this.G_BUFFER_COLOR = 2;
    this.G_BUFFER_DEPTH = 3;

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

DeferredRenderer.prototype._init = function( canvasId, assets, scene ) {

    'use strict';

    var canvas = document.getElementById( canvasId ),
        gl,
        ok;

    this.viewportWidth = canvas.width;
    this.viewportHeight = canvas.height;
    this.viewportAspectRatio = canvas.width / canvas.height;

    this.gl = gl = GLU.init( canvasId );

    if ( this.gl === null ) {
        console.error( '<DeferredRenderer> Fatal error: Could not initialize WebGL ' +
                       'context.' );
        return false;
    }

    ok = this._initExtensions();
    if ( ! ok ) {
        console.error( '<DeferredRenderer> Fatal error: Could not initialize required ' +
                       'extensions.' );
        //return false;
    }

    ok = this._initShaders( assets.shaders, assets.programs );
    if ( ! ok ) {
        console.error( '<DeferredRenderer> Fatal error: Could not initialize shader ' +
                       'programs.' );
        return false;
    }

    ok = this._initGBuffer();
    if ( ! ok ) {
        console.error( '<DeferredRenderer> Fatal error: Could not initialize G-Buffer.' );
        return false;
    }

    ok = this._initBuffers( assets.meshes );
    if ( ! ok ) {
        console.error( '<DeferredRenderer> Fatal error: Could not initialize mesh ' +
                       'buffers.' );
        return false;
    }

    ok = this._initMaterials( assets.materials );
    if ( ! ok ) {
        console.error( '<DeferredRenderer> Fatal error: Could not initialize material ' +
                       'buffers.' );
        return false;
    }

    ok = this._initTextures( assets.textures );
    if ( ! ok ) {
        console.error( '<DeferredRenderer> Fatal error: Could not initialize texture ' +
                       'buffers.' );
        return false;
    }

    ok = this._initShadowMaps( scene );
    if ( ! ok ) {
        console.error( '<DeferredRenderer> Fatal error: Could not initialize shadow ' +
                       'maps.' );
        return false;
    }

    gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
    gl.enable( gl.CULL_FACE );

    return true;

};

DeferredRenderer.prototype._initExtensions = function() {

    'use strict';

    var gl = this.gl;

    this.extensions.depthTexture = gl.getExtension( 'WEBGL_depth_texture' );
    if ( ! this.extensions.depthTexture ) {
        console.error( 'Could not fetch "WEBGL_depth_texture" extension.' );
        return false;
    }

    this.extensions.drawBuffers = gl.getExtension('WEBGL_draw_buffers');
    if ( ! this.extensions.drawBuffers ) {
        console.error( 'Could not fetch "WEBGL_draw_buffers" extension.' );
        return false;
    }
    

    return true;

};

DeferredRenderer.prototype._initShaders = function( shaders, programs ) {

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
            console.error( '<DeferredRenderer> Error initializing shader program ' +
                           '"' + programName + '".' );
            return false;
        }
    }

    return true;

};

DeferredRenderer.prototype._initShader = function( vertexShaderSource, fragmentShaderSource ) {

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

DeferredRenderer.prototype._initGBuffer = function() {

    'use strict';

    var gl = this.gl,
        i,
        texture,
        ext = this.extensions.drawBuffers,
        gBuffer = {
            framebuffer: gl.createFramebuffer(),
            textures: []
        };

    console.log( gBuffer );

/*
    this.G_BUFFER_POSITION = 0;
    this.G_BUFFER_NORMAL = 1;
    this.G_BUFFER_COLOR = 0;
    this.G_BUFFER_DEPTH = 3;
*/

    for ( i = 0; i < 4; i++ ) {
        texture = gl.createTexture();
        gl.bindTexture( gl.TEXTURE_2D, texture );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, this.viewportWidth, this.viewportHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
        gBuffer.textures.push( texture );
    }

    gl.bindFramebuffer( gl.FRAMEBUFFER, gBuffer.framebuffer );
    gl.framebufferTexture2D( gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL, gl.TEXTURE_2D, gBuffer.textures[0], 0 );
    gl.framebufferTexture2D( gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT1_WEBGL, gl.TEXTURE_2D, gBuffer.textures[1], 0 );
    gl.framebufferTexture2D( gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT2_WEBGL, gl.TEXTURE_2D, gBuffer.textures[2], 0 );
    gl.framebufferTexture2D( gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT3_WEBGL, gl.TEXTURE_2D, gBuffer.textures[3], 0 );

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        console.error( '<DeferredRenderer> Fatal error: could not complete the ' +
                       'framebuffer.' );
        return false;
    }

    ext.drawBuffersWEBGL( [
        ext.COLOR_ATTACHMENT0_WEBGL, // gl_FragData[0] == this.G_BUFFER_POSITION
        ext.COLOR_ATTACHMENT1_WEBGL, // gl_FragData[1] == this.G_BUFFER_NORMAL
        ext.COLOR_ATTACHMENT2_WEBGL, // gl_FragData[2] == this.G_BUFFER_COLOR
        ext.COLOR_ATTACHMENT3_WEBGL  // gl_FragData[3] == this.G_BUFFER_DEPTH
    ] );

    gl.bindTexture( gl.TEXTURE_2D, null );
    gl.bindFramebuffer( gl.FRAMEBUFFER, null );

    this.gBuffer = gBuffer;

    return true;

};

DeferredRenderer.prototype._initBuffers = function( meshes ) {

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

DeferredRenderer.prototype._initMaterials = function( materials ) {

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

DeferredRenderer.prototype._initTextures = function( textures ) {

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

DeferredRenderer.prototype._initShadowMaps = function( scene ) {

    var type,
        shadowMap;

    type = scene.lights.spot;

    for ( i = 0; i < 16; i++ ) {

        shadowMap = this._createShadowMap( this.SHADOW_MAP_SIZE );
        if ( shadowMap === null ) {
            console.error( '<DeferredRenderer> Fatal error: Could not initialize ' +
                           'shadow map.' );
            return false;
        }

        type.colorTextures[ i ] = shadowMap.colorTexture;
        type.depthTextures[ i ] = shadowMap.depthTexture;
        type.framebuffers[ i ] = shadowMap.framebuffer;

    }

    return true;

};

DeferredRenderer.prototype._createShadowMap = function( size ) {

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



DeferredRenderer.prototype._pushProjectionMatrix = function() {

    'use strict';

    var m;

    m = Mat4.create();
    Mat4.copy( m, this.glProjectionMatrix );
    this.glProjectionMatrixStack.push( m );

};

DeferredRenderer.prototype._popProjectionMatrix = function() {

    'use strict';

    var m;

    m = this.glProjectionMatrixStack.pop();
    Mat4.copy( this.glProjectionMatrix, m );

};

DeferredRenderer.prototype._pushViewMatrix = function() {

    'use strict';

    var m;

    m = Mat4.create();
    Mat4.copy( m, this.glViewMatrix );
    this.glViewMatrixStack.push( m );

};

DeferredRenderer.prototype._popViewMatrix = function() {

    'use strict';

    var m;

    m = this.glViewMatrixStack.pop();
    Mat4.copy( this.glViewMatrix, m );

};

DeferredRenderer.prototype._pushModelMatrix = function() {

    'use strict';

    var m;

    m = Mat4.create();
    Mat4.copy( m, this.modelMatrix );
    this.modelMatrixStack.push( m );

};

DeferredRenderer.prototype._popModelMatrix = function() {

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

DeferredRenderer.prototype.renderScene = function( scene, entities ) {

    'use strict';

    // First fill the G-Buffer
    this.setGBufferRenderTarget();
    this.setGBufferDrawingState();
    this.useGBufferShader();
    this.renderGBuffer( entities );

    // Now draw to the screen
    this.setScreenRenderTarget();
    this.setScreenDrawingState();
    this.useFlatColorShader();
    this.renderDebugPanels();

};


//
// Shaders
//

DeferredRenderer.prototype.setGBufferRenderTarget = function() {

    'use strict';

    var gl = this.gl;

    gl.viewport( 0, 0, this.viewportWidth, this.viewportHeight );

    gl.cullFace( gl.BACK );

};

DeferredRenderer.prototype.setGBufferDrawingState = function() {

    'use strict';

    var gl = this.gl;

    gl.colorMask( true, true, true, true );
    gl.depthMask( true );

    gl.disable( gl.BLEND );

    gl.enable( gl.DEPTH_TEST );
    gl.depthFunc( gl.EQUAL );

};

DeferredRenderer.prototype.useGBufferShader = function() {

    'use strict';

    var gl = this.gl;

    this.activeShader = this.shaderPrograms.gBuffer;
    gl.useProgram( this.activeShader );

    gl.disableVertexAttribArray( this.GL_VERTEX_POSITION_ATTRIBUTE );
    gl.disableVertexAttribArray( this.GL_VERTEX_NORMAL_ATTRIBUTE );
    gl.disableVertexAttribArray( this.GL_TEXTURE_COORD_ATTRIBUTE );

};

DeferredRenderer.prototype.renderGBuffer = function( entities ) {

    this.setCameraMatrixUniforms();

    this.setGBufferSamplingUniforms();

    this.drawEntities( entities, true, true );

};


DeferredRenderer.prototype.setScreenRenderTarget = function() {

    'use strict';

    var gl = this.gl;

    gl.viewport( 0, 0, this.viewportWidth, this.viewportHeight );

    gl.cullFace( gl.BACK );

};

DeferredRenderer.prototype.setScreenDrawingState = function() {

    'use strict';

    var gl = this.gl;

    gl.colorMask( true, true, true, true );
    gl.depthMask( false );

    gl.disable( gl.BLEND );
    gl.disable( gl.DEPTH_TEST );

};

DeferredRenderer.prototype.useFlatColorShader = function() {

    'use strict';

    var gl = this.gl;

    this.activeShader = this.shaderPrograms.DEBUG_flatColor;
    gl.useProgram( this.activeShader );

    gl.enableVertexAttribArray( this.GL_VERTEX_POSITION_ATTRIBUTE );
    gl.disableVertexAttribArray( this.GL_VERTEX_NORMAL_ATTRIBUTE );
    gl.enableVertexAttribArray( this.GL_TEXTURE_COORD_ATTRIBUTE );

};


DeferredRenderer.prototype.setCameraMatrixUniforms = function() {

    'use strict';

    var gl = this.gl;

    gl.uniformMatrix4fv( this.activeShader.uniforms[ 'u_ProjectionMatrix' ], false, this.projectionMatrix );
    gl.uniformMatrix4fv( this.activeShader.uniforms[ 'u_ViewMatrix' ], false, this.viewMatrix );

};

DeferredRenderer.prototype.setGBufferSamplingUniforms = function() {

    'use strict';

    this.gl.uniform1i( this.activeShader.uniforms[ 'u_Sampler' ], 0 );

};

DeferredRenderer.prototype.setModelMatrixUniforms = function() {

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

DeferredRenderer.prototype.setMaterialUniforms = function( material ) {

    'use strict';

    var gl = this.gl;

    gl.uniform3fv( this.activeShader.uniforms[ 'u_MaterialAmbientColor' ], material.ambientColor );
    gl.uniform3fv( this.activeShader.uniforms[ 'u_MaterialDiffuseColor' ], material.diffuseColor );
    gl.uniform3fv( this.activeShader.uniforms[ 'u_MaterialEmissiveColor' ], material.emissiveColor );
    gl.uniform3fv( this.activeShader.uniforms[ 'u_MaterialSpecularColor' ], material.specularColor );
    gl.uniform1f( this.activeShader.uniforms[ 'u_MaterialShininess' ], material.shininess );

};

DeferredRenderer.prototype.drawEntities = function( entities, drawMaterials, drawTextures ) {

    'use strict';

    var i;

    Mat4.identity( this.modelMatrix );

    for ( i = 0; i < entities.length; i++ ) {

        this.drawEntity( entities[i], drawMaterials, drawTextures );

    }

};

DeferredRenderer.prototype.drawEntity = function( entity, drawMaterials, drawTextures ) {

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

DeferredRenderer.prototype.renderDebugPanels = function() {

    var gl = this.gl;

    this._pushModelMatrix();

    gl.disable( gl.DEPTH_TEST );
    gl.disable( gl.BLEND );

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
    gl.bindTexture( gl.TEXTURE_2D, this.gBuffer.textures[0] );
    this.ctiveTexture = 'buffer';

    gl.drawArrays( gl.TRIANGLES, 0, 6 );


    gl.viewport( 0, 0, 240, 240 );

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, this.gBuffer.textures[1] );
    this.activeTexture = 'buffer';

    gl.drawArrays( gl.TRIANGLES, 0, 6 );

    gl.viewport( 240, 240, 240, 240 );

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, this.gBuffer.textures[2] );
    this.activeTexture = 'buffer';

    gl.drawArrays( gl.TRIANGLES, 0, 6 );

    gl.viewport( 240, 0, 240, 240 );

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, this.gBuffer.textures[3] );
    this.activeTexture = 'buffer';

    gl.drawArrays( gl.TRIANGLES, 0, 6 );

    this._popModelMatrix();

};