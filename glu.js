GLU = {};

GLU.init = function( canvasId ) {

    'use strict';

    var canvas = document.getElementById( canvasId ),
        gl = null,
        ext;

    if ( canvas === null ) {

        console.log( 'Could not fetch canvas.' );
        return null;

    } else {

        try {

            // Try to grab the standard context. If it fails, fallback to experimental.
            gl = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );

        } catch( e ) {

            console.log( 'Could not fetch GL context.' );
            return null;

        }

        // If we don't have a GL context, give up now
        if ( ! gl ) {

            console.log( 'Could not fetch GL context.' );
            return null;

        }

        return gl;

    }

};

GLU.frustum = function( out, left, right, bottom, top, near, far ) {

    'use strict';

    var rightLeft,
        topBottom,
        nearFar;

    if ( out.length !== 16 ) {
        throw '<GLU>: The result of a frustum calculation is a 4x4 matrix.';
    }

    rightLeft = 1 / (right - left);
    topBottom = 1 / (top - bottom);
    nearFar = 1 / ( near - far );

    out[0] = ( near * 2 ) * rightLeft;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = ( near * 2 ) * topBottom;
    out[6] = 0;
    out[7] = 0;
    out[8] = ( right + left ) * rightLeft;
    out[9] = ( top + bottom ) * topBottom;
    out[10] = ( far + near ) * nearFar;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = ( far * near * 2 ) * nearFar;
    out[15] = 0;

    return out;

};

GLU.perspective = function( out, yFOV, aspectRatio, near, far ) {

    'use strict';

    var f,
        nearFar;

    if ( out.length !== 16 ) {
        throw '<GLU>: The result of a perspective calculation is a 4x4 matrix.';
    }

    f = 1.0 / Math.tan( ( ( Math.PI / 180 ) * yFOV ) / 2 );
    nearFar = 1 / (near - far);

    out[0] = f / aspectRatio;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = ( far + near ) * nearFar;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = ( 2 * far * near ) * nearFar;
    out[15] = 0;

    return out;

};

GLU.orthographic = function( out, left, right, bottom, top, near, far ) { 

    'use strict';

    var leftRight = 1 / (left - right),
        bottomTop = 1 / (bottom - top),
        nearFar = 1 / (near - far);

    out[0] = -2 * leftRight;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bottomTop;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nearFar;
    out[11] = 0;
    out[12] = ( left + right ) * leftRight;
    out[13] = ( top + bottom ) * bottomTop;
    out[14] = ( far + near ) * nearFar;
    out[15] = 1;

    return out;

};

GLU.lookAt = function( out, eye, center, up ) {

    'use strict';

    var x0,
        x1,
        x2,
        y0,
        y1,
        y2,
        z0,
        z1,
        z2,
        length,
        eyeX,
        eyeY,
        eyeZ,
        upX,
        upY,
        upZ,
        centerX,
        centerY,
        centerZ;

    if ( out.length !== 16 ) {
        throw '<GLU>: The result of a lookAt calculation is a 4x4 matrix.';
    }

    eyeX = eye[0];
    eyeY = eye[1];
    eyeZ = eye[2];
    upX = up[0];
    upY = up[1];
    upZ = up[2];
    centerX = center[0];
    centerY = center[1];
    centerZ = center[2];

    if ( Math.abs( eyeX - centerX ) < 0.000001 &&
         Math.abs( eyeY - centerY ) < 0.000001 &&
         Math.abs( eyeZ - centerZ ) < 0.000001 ) {

        return mat4.identity(out);

    }

    z0 = eyeX - centerX;
    z1 = eyeY - centerY;
    z2 = eyeZ - centerZ;

    length = 1 / Math.sqrt( z0 * z0 + z1 * z1 + z2 * z2 );
    z0 *= length;
    z1 *= length;
    z2 *= length;

    x0 = upY * z2 - upZ * z1;
    x1 = upZ * z0 - upX * z2;
    x2 = upX * z1 - upY * z0;

    length = Math.sqrt( x0 * x0 + x1 * x1 + x2 * x2 );

    if ( ! length ) {

        x0 = 0;
        x1 = 0;
        x2 = 0;

    } else {

        length = 1 / length;

        x0 *= length;
        x1 *= length;
        x2 *= length;

    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    length = Math.sqrt( y0 * y0 + y1 * y1 + y2 * y2 );

    if ( ! length ) {

        y0 = 0;
        y1 = 0;
        y2 = 0;

    } else {

        length = 1 / length;

        y0 *= length;
        y1 *= length;
        y2 *= length;

    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -( x0 * eyeX + x1 * eyeY + x2 * eyeZ );
    out[13] = -( y0 * eyeX + y1 * eyeY + y2 * eyeZ );
    out[14] = -( z0 * eyeX + z1 * eyeY + z2 * eyeZ );
    out[15] = 1;

    return out;
};

GLU.getTriangleArea = function( a, b, c ) {

    'use strict';

    var a_b = Vec3.create(),
        a_c = Vec3.create(),
        crossProduct = Vec3.create();

    if ( a.length !== 3 || b.length !== 3 ) {
        throw '<GLU>: Three 3-dimensional vectors are required to calculate the area ' +
              'of a triangle.';
    }

    Vec3.subtract( a_b, b, a );
    Vec3.subtract( a_c, c, a );
    Vec3.cross( crossProduct, a_b, a_c );

    return 0.5 * Vec3.norm( crossProduct );

};