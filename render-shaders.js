function useDepthOnlyShader() {

    'use strict';

    SHADER = SHADERS.depth;
    GL.useProgram( SHADER );

    GL.enableVertexAttribArray( GLVertexPositionAttribute );
    GL.disableVertexAttribArray( GLVertexNormalAttribute );
    GL.disableVertexAttribArray( GLTextureCoordAttribute );

};

function useFlatColorShader() {

    'use strict';

    SHADER = SHADERS.DEBUG_flatColor;
    GL.useProgram( SHADER );

    GL.enableVertexAttribArray( GLVertexPositionAttribute );
    GL.disableVertexAttribArray( GLVertexNormalAttribute );
    GL.enableVertexAttribArray( GLTextureCoordAttribute );

};

function useDepthGrayscaleShader() {

    'use strict';

    SHADER = SHADERS.DEBUG_depthGrayscale;
    GL.useProgram( SHADER );

    GL.enableVertexAttribArray( GLVertexPositionAttribute );
    GL.disableVertexAttribArray( GLVertexNormalAttribute );
    GL.enableVertexAttribArray( GLTextureCoordAttribute );

};

function usePointLightShader() {

    'use strict';

    SHADER = SHADERS.pointLight;
    GL.useProgram( SHADER );

    GL.enableVertexAttribArray( GLVertexPositionAttribute );
    GL.enableVertexAttribArray( GLVertexNormalAttribute );
    GL.enableVertexAttribArray( GLTextureCoordAttribute );

};

function useSpotLightShader() {

    'use strict';

    SHADER = SHADERS.spotLight;
    GL.useProgram( SHADER );

    GL.enableVertexAttribArray( GLVertexPositionAttribute );
    GL.enableVertexAttribArray( GLVertexNormalAttribute );
    GL.enableVertexAttribArray( GLTextureCoordAttribute );

};