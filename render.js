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

function renderScene() {

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
    useDepthOnlyShader();

    // 2.
    setDepthBufferDrawingState();

    // 3.
    setupShadowMapTarget();

    // 4.
    renderLightDepthBuffers();

    // 5.
    setupScreenTarget();

    // 6.
    setDefaultCameraTransform();

    // 7.
    renderSceneDepthBuffer();

    // 8.
    setColorDrawingState();

    // 9.
    renderPointLights();

    // 10.
    renderSpotLights();

    // 11.
//    drawDebugInset();

};

function renderLightDepthBuffers() {

    'use strict';

    var i;

    /*
     * 1. Draw the cube map depth buffers for each point light.
     * 2. Draw 2D depth buffers for each spot light.
     */

    // 1.
    for ( i = 0; i < SCENE.lights.point.count; i++ ) {
        drawPointLightDepthBuffer( i );
    }

    // 2.
    for ( i = 0; i < SCENE.lights.spot.count; i++ ) {
        drawSpotLightDepthBuffer( i );    
    }
};

function renderSceneDepthBuffer() {

    'use strict';

    /*
     * 1. Set the scene camera's matrix uniforms.
     * 2. Draw entities with materials and textures disabled.
     */

    // 1.
    setCameraMatrixUniforms();

    // 2.
    drawEntities( false, false );

};

function renderPointLights() {

    'use strict';

    /*
     * 1. Switch to the point light shader.
     * 2. Set the scene camera's matrix uniforms.
     * 3. Draw entities with materials and textures enabled.
     */

    // 1.
    usePointLightShader();

    // 2.
    setCameraMatrixUniforms();

    // 3.
    for ( i = 0; i < SCENE.lights.point.count; i++ ) {
        setPointLightUniforms( i );
        drawEntities( true, true );
    }

};

function renderSpotLights() {

    'use strict';

    /*
     * 1. Switch to the spot light shader.
     * 2. Set the scene camera's matrix uniforms.
     * 3. Draw entities with materials and textures enabled.
     */

    // 1.
    useSpotLightShader();

    // 2.
    setCameraMatrixUniforms();

    // 3.
    for ( i = 0; i < SCENE.lights.spot.count; i++ ) {

        // Bind the light's depth map for the shadow.

        GL.activeTexture( GL.TEXTURE1 );
        GL.bindTexture( GL.TEXTURE_2D, SCENE.lights.spot.depthTextures[i] );
        GL.activeTexture( GL.TEXTURE0 );

        setSpotLightUniforms( i );
        drawEntities( true, true );

        // Unbind the light's depth map.

        GL.activeTexture( GL.TEXTURE1 );
        GL.bindTexture( GL.TEXTURE_2D, null );
        GL.activeTexture( GL.TEXTURE0 );

    }

};





// THE BELOW OPERATE ON AN ENTITY-BY-ENTITY BASIS AND ARE CALLED FROM THE
// SCENE-LEVEL 'render*' FUNCTIONS.

function drawPointLightDepthBuffer( index ) {
    // do something with cube maps
};

function drawSpotLightDepthBuffer( index ) {

    'use strict';

    var type = SCENE.lights.spot,
        index3 = index * 3,
        position,
        direction,
        angle;

    GL.bindFramebuffer( GL.FRAMEBUFFER, type.framebuffers[ index ] );

    GL.clear( GL.DEPTH_BUFFER_BIT );

    // Set up the projection and view matrices using setSpotLightCameraTransform()

    position = Vec3.create( [ type.positions[ index3 ],
                              type.positions[ index3 + 1 ],
                              type.positions[ index3 + 2 ] ] );

    direction = Vec3.create( [ type.directions[ index3 ],
                               type.directions[ index3 + 1 ],
                               type.directions[ index3 + 2 ] ] );

    angle = type.angles[ index ];

    setSpotLightCameraTransform( position, direction, angle );

    setCameraMatrixUniforms();

    drawEntities( false, false );

// Not sure exactly what effect the below three lines have, but things still appear
// to work when they are disabled?
    GL.activeTexture( GL.TEXTURE0 );
    GL.bindTexture( GL.TEXTURE_2D, type.depthTextures[ index ] );
    GL.bindTexture( GL.TEXTURE_2D, null );

    Mat4.copy( type.projectionMatrices[ index ], GLProjectionMatrix );
    Mat4.copy( type.viewMatrices[ index ], GLViewMatrix );

    GL.bindFramebuffer( GL.FRAMEBUFFER, null );

};

function drawEntities( drawMaterials, drawTextures ) {

    'use strict';

    var i;

    Mat4.identity( GLModelMatrix );

    for ( i = 0; i < entities.length; i++ ) {

        drawEntity( entities[i], drawMaterials, drawTextures );

    }

};

function drawEntity( entity, drawMaterials, drawTextures ) {

    'use strict';

    var meshName = entity.model.meshes[0],
        mesh = GLMeshes[ meshName ],
        materialName = entity.model.materials[0],
        material = GLMaterials[ materialName ],
        textureName = entity.model.textures[0],
        texture = GLTextures[ textureName ];

    pushModelMatrix();

    Mat4.translate( GLModelMatrix,
                    GLModelMatrix,
                    [ entity.position[0], entity.position[1], entity.position[2], 1 ] );

    Mat4.rotateX( GLModelMatrix,
                  GLModelMatrix,
                  entity.rotation[0] );

    Mat4.rotateY( GLModelMatrix,
                  GLModelMatrix,
                  entity.rotation[1] );

    Mat4.rotateZ( GLModelMatrix,
                  GLModelMatrix,
                  entity.rotation[2] );

    Mat4.toMat3( GLNormalMatrix, GLModelMatrix );
    Mat3.invert( GLNormalMatrix, GLNormalMatrix );
    Mat3.transpose( GLNormalMatrix, GLNormalMatrix );

    setModelMatrixUniforms();

    if ( drawMaterials ) {

        if ( GLActiveMaterial !== materialName ) {

            setMaterialUniforms( material );
            GLActiveMaterial = materialName;

        }

    }

    if ( drawTextures ) {

        if ( GLActiveTexture !== textureName ) {

            GL.activeTexture( GL.TEXTURE0 );
            GL.bindTexture( GL.TEXTURE_2D, texture );
            GLActiveTexture = entity.model.textures[0];

        }

    }

    if ( GLActiveMesh !== meshName ) {

        // This is a tricky switch statement: everything falls through to the
        // default case ( vertex position attribute only ) and accumulates the
        // attributes needed on the way... in other words, the top cases
        // accumulate the most attributes.

        switch ( SHADER ) {

            case SHADERS.pointLight:
            case SHADERS.spotLight:
                GL.bindBuffer( GL.ARRAY_BUFFER, mesh.vertexNormalBuffer );
                GL.vertexAttribPointer( SHADER.attribs[ 'a_VertexNormal' ], 3, GL.FLOAT, false, 0, 0 );

            case SHADERS.DEBUG_flatColor:
            case SHADERS.DEBUG_depthGrayscale:
                GL.bindBuffer( GL.ARRAY_BUFFER, mesh.textureCoordBuffer );
                GL.vertexAttribPointer( SHADER.attribs[ 'a_TextureCoord' ], 2, GL.FLOAT, false, 0, 0 );

            default:
                GL.bindBuffer( GL.ARRAY_BUFFER, mesh.vertexPositionBuffer );
                GL.vertexAttribPointer( SHADER.attribs[ 'a_VertexPosition' ], 3, GL.FLOAT, false, 0, 0 );
                break;

        }

        GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, mesh.vertexIndexBuffer );

        GLActiveMesh = meshName;

    }

    GL.drawElements( GL.TRIANGLES, mesh.vertexIndexLength, GL.UNSIGNED_SHORT, 0 );

    popModelMatrix();

};

function drawDebugInset() {

    pushModelMatrix();

    GL.disable( GL.DEPTH_TEST );
    GL.disable( GL.BLEND );

    useDepthGrayscaleShader();

    GLU.orthographic( GLProjectionMatrix, -1, 1, -1, 1, 1, 10 );
    GL.uniformMatrix4fv( SHADER.uniforms[ 'u_ProjectionMatrix' ], false, GLProjectionMatrix );

    Mat4.identity( GLViewMatrix );
    GL.uniformMatrix4fv( SHADER.uniforms[ 'u_ViewMatrix' ], false, GLViewMatrix );

    Mat4.identity( GLModelMatrix );
    Mat4.translate( GLModelMatrix, GLModelMatrix, [ 0, 0, -1, 0 ] );
    GL.uniformMatrix4fv( SHADER.uniforms[ 'u_ModelMatrix' ], false, GLModelMatrix );

    GL.bindBuffer( GL.ARRAY_BUFFER, insetVertexPositions );
    GL.bufferData( GL.ARRAY_BUFFER, new Float32Array( [ -1, 1, 0, -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0 ] ), GL.STATIC_DRAW );
    GL.vertexAttribPointer( SHADER.attribs[ 'a_VertexPosition' ], 3, GL.FLOAT, false, 0, 0 );

    GL.bindBuffer( GL.ARRAY_BUFFER, insetTextureCoords );
    GL.bufferData( GL.ARRAY_BUFFER, new Float32Array( [ 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1 ] ), GL.STATIC_DRAW );
    GL.vertexAttribPointer( SHADER.attribs[ 'a_TextureCoord' ], 2, GL.FLOAT, false, 0, 0 );

    GL.viewport( 400, 240, 240, 240 );

    GL.activeTexture( GL.TEXTURE0 );
    GL.bindTexture( GL.TEXTURE_2D, SCENE.lights.spot.depthTextures[0] );
    GLActiveTexture = 'buffer';

    GL.drawArrays( GL.TRIANGLES, 0, 6 );


    GL.viewport( 0, 0, 240, 240 );

    GL.activeTexture( GL.TEXTURE0 );
    GL.bindTexture( GL.TEXTURE_2D, SCENE.lights.spot.depthTextures[1] );
    GLActiveTexture = 'buffer';

    GL.drawArrays( GL.TRIANGLES, 0, 6 );


    popModelMatrix();

};