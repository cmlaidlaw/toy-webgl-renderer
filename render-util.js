function setupShadowMapTarget() {

    'use strict';

    /*
     * 1. Reshape the viewport to the correct size for shadow maps.
     */

    GL.viewport( 0, 0, GLShadowMapWidth, GLShadowMapHeight );

    /*
     * 2. Use front-face culling for greater z-buffer accuracy.
     */

    GL.cullFace( GL.FRONT );

};

function setupScreenTarget() {

    'use strict';

    /*
     * 1. Reshape the viewport to the correct size for the visible scene.
     */

    GL.viewport( 0, 0, GLViewportWidth, GLViewportHeight );

    /*
     * 2. Use back-face culling.
     */

    GL.cullFace( GL.BACK );

};

function setDepthBufferDrawingState() {

    'use strict';

    /*
     * 1. Disable color writing and blending; enable depth writing.
     */

    GL.colorMask( false, false, false, false );
    GL.disable( GL.BLEND );

    /*
     * 2. Enable depth writing and testing and then set the test function to GL.LEQUAL.
     */

    GL.depthMask( true );
    GL.enable( GL.DEPTH_TEST );
    GL.depthFunc( GL.LEQUAL );

};

function setColorDrawingState() {

    'use strict';

    /*
     * 1. Enable color writing and blending.
     */

    GL.colorMask( true, true, true, true );
    GL.enable( GL.BLEND );
    GL.blendFunc( GL.ONE, GL.ONE );

    /*
     * 2. Disable depth writing and change the depth testing function
     *    to 'GL.EQUAL' instead of 'GL.LEQUAL' to avoid z-fighting.
     */

    GL.depthMask( false );
    GL.depthFunc( GL.EQUAL );

};

function setDefaultCameraTransform() {

    GLU.perspective( GLProjectionMatrix,
                     45,
                     GLViewportWidth / GLViewportHeight,
                     0.5,
                     50 );

    Mat4.identity( GLViewMatrix );

    Mat4.rotateX( GLViewMatrix,
                  GLViewMatrix,
                  CAMERA.rotation[0] );

    Mat4.rotateY( GLViewMatrix,
                  GLViewMatrix,
                  CAMERA.rotation[1] );

    Mat4.rotateZ( GLViewMatrix,
                  GLViewMatrix,
                  CAMERA.rotation[2] );

    Mat4.translate( GLViewMatrix,
                    GLViewMatrix,
                    [ -CAMERA.position[0], -CAMERA.position[1], -CAMERA.position[2], 1 ] );

};

function setPointLightCameraTransform() {

};

function setSpotLightCameraTransform( position, direction, angle ) {

    // Note that GLU.perspective() accepts angles in degrees for convenience,
    // but we store the spot light angles in radians so a conversion is necessary.

    GLU.perspective( GLProjectionMatrix,
                     ( ( 180 / Math.PI ) / angle ),
                     GLShadowMapWidth / GLShadowMapHeight,
                     1.0,
                     50 );

    Mat4.identity( GLViewMatrix );

    position = Vec3.create( position );

    direction = Vec3.create( direction );

    target = Vec3.create();

    Vec3.add( target, position, direction );

    GLU.lookAt( GLViewMatrix,
                position,
                target,
                [ 0, 1, 0 ] );

};