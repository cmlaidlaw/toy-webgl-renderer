Mat3 = {};

Mat3.create = function() {

    'use strict';

    return new Float32Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );

};

Mat3.createFrom = function( elements ) {

    'use strict';

    var out = [];

    if ( elements.length !== 9 ) {
        throw '<Mat4>: A 3x3 matrix requires 9 elements to create.';
    }

    // Transpose to convert row-major to column-major format
    return new Float32Array( [ elements[0],
                               elements[3],
                               elements[6],
                               elements[1],
                               elements[4],
                               elements[7],
                               elements[2],
                               elements[5],
                               elements[8] ] );

};

Mat3.copy = function( out, a ) {

    'use strict';

    if ( a.length !== out.length || a.length !== 16 ) {
        throw '<Mat3>: Cannot copy a 3x3 matrix into a matrix of different ' +
              'format.';
    }

    out[0]  = a[0];
    out[1]  = a[1];
    out[2]  = a[2];
    out[3]  = a[3];
    out[4]  = a[4];
    out[5]  = a[5];
    out[6]  = a[6];
    out[7]  = a[7];
    out[8]  = a[8];

    return out;

};

Mat3.identity = function( out ) {

    if ( out.length !== 9 ) {
        throw '<Mat3>: The identity of a 3x3 matrices is a ' +
              '3x3 matrix.';
    }

    out[0]  = 1;
    out[1]  = 0;
    out[2]  = 0;
    out[3]  = 0;
    out[4]  = 1;
    out[5]  = 0;
    out[6]  = 0;
    out[7]  = 0;
    out[8]  = 1;

    return out;

};

Mat3.transpose = function( out, a ) {

    'use strict';

    var a0,
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8;

    if ( a.length !== out.length || a.length !== 9 ) {
        throw '<Mat3>: Cannot transpose a 3x3 matrix into a matrix of different ' +
              'format.';
    }

    a0 = a[0];
    a1 = a[1];
    a2 = a[2];
    a3 = a[3];
    a4 = a[4];
    a5 = a[5];
    a6 = a[6];
    a7 = a[7];
    a8 = a[8];


    out[0] = a0;
    out[1] = a3;
    out[2] = a6;
    out[3] = a1;
    out[4] = a4;
    out[5] = a7;
    out[6] = a2;
    out[7] = a5;
    out[8] = a8;

    return out;

};

Mat3.invert = function( out, a ) {

    'use strict';

    var a0 = a[0],
        a1 = a[1],
        a2 = a[2],
        a3 = a[3],
        a4 = a[4],
        a5 = a[5],
        a6 = a[6],
        a7 = a[7],
        a8 = a[8],
        b1 = a8 * a4 - a5 * a7,
        b4 = -a8 * a3 + a5 * a6,
        b7 = a7 * a3 - a4 * a6,
        determinant = a0 * b1 + a1 * b4 + a2 * b7,
        i;

    if ( out.length !== 9 ) {
        throw '<Mat3>: The inverse of 3x3 matrix is a 3x3 matrix.';
    }

    if ( determinant === 0 ) {
        throw '<Mat3>: Cannot invert singular matrix.';
    }

    determinant = 1 / determinant;

    out[0] = b1 * determinant;
    out[1] = ( -a8 * a1 + a2 * a7 ) * determinant;
    out[2] = ( a5 * a1 - a2 * a4 ) * determinant;
    out[3] = b4 * determinant;
    out[4] = ( a8 * a0 - a2 * a6 ) * determinant;
    out[5] = ( -a5 * a0 + a2 * a3 ) * determinant;
    out[6] = b7 * determinant;
    out[7] = ( -a7 * a0 + a1 * a6 ) * determinant;
    out[8] = ( a4 * a0 - a1 * a3 ) * determinant;

    return out;

};
/*
Mat3.determinant = function( a ) {

    'use strict';

    var a0  = a[0],
        a1  = a[1],
        a2  = a[2],
        a3  = a[3],
        a4  = a[4],
        a5  = a[5],
        a6  = a[6].
        a7  = a[7],
        a8  = a[8],
        a9  = a[9],
        a10 = a[10],
        a11 = a[11],
        a12 = a[12],
        a13 = a[13],
        a14 = a[14],
        a15 = a[15],
        w,
        x,
        y,
        z;

    w =  a5  * a10 * a15 -
         a5  * a11 * a14 -
         a9  * a6  * a15 +
         a9  * a7  * a14 +
         a13 * a6  * a11 -
         a13 * a7  * a10;

    x = -a4  * a10 * a15 +
         a4  * a11 * a14 +
         a8  * a6  * a15 -
         a8  * a7  * a14 -
         a12 * a6  * a11 +
         a12 * a7  * a10;

    y =  a4  * a9  * a15 -
         a4  * a11 * a13 -
         a8  * a5  * a15 +
         a8  * a7  * a13 +
         a12 * a5  * a11 -
         a12 * a7  * a9;

    z = -a4  * a9  * a14 +
         a4  * a10 * a13 +
         a8  * a5  * a14 -
         a8  * a6  * a13 -
         a12 * a5  * a10 +
         a12 * a6  * a9;

    return a0 * w + a1 * x + a2 * y + a3 * z;

};

Mat3.multiply = function( out, a, b ) {

    'use strict';

    var a0,
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        b0,
        b1,
        b2,
        b3;

    if ( a.length !== b.length || a.length !== out.length ) {
        if ( out.length !== 16 ) {
            throw '<Mat3>: The product of two 3x3 matrices is a ' +
                  '3x3 matrix.';
        } else {
            throw '<Mat3>: Cannot multiply matrices of unequal formats.';
        }
    }

    a0 = a[0];
    a1 = a[1];
    a2 = a[2];
    a3 = a[3];
    a4 = a[4];
    a5 = a[5];
    a6 = a[6];
    a7 = a[7];
    a8 = a[8];
    a9 = a[9];
    a10 = a[10];
    a11 = a[11];
    a12 = a[12];
    a13 = a[13];
    a14 = a[14];
    a15 = a[15];

    b0 = b[0];
    b1 = b[1];
    b2 = b[2];
    b3 = b[3];

    out[0] = a0 * b0 + a4 * b1 + a8 * b2 + a12 * b3;
    out[1] = a1 * b0 + a5 * b1 + a9 * b2 + a13 * b3;
    out[2] = a2 * b0 + a6 * b1 + a10 * b2 + a14 * b3;
    out[3] = a3 * b0 + a7 * b1 + a11 * b2 + a15 * b3;

    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];

    out[4] = a0 * b0 + a4 * b1 + a8 * b2 + a12 * b3;
    out[5] = a1 * b0 + a5 * b1 + a9 * b2 + a13 * b3;
    out[6] = a2 * b0 + a6 * b1 + a10 * b2 + a14 * b3;
    out[7] = a3 * b0 + a7 * b1 + a11 * b2 + a15 * b3;

    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];

    out[8] = a0 * b0 + a4 * b1 + a8 * b2 + a12 * b3;
    out[9] = a1 * b0 + a5 * b1 + a9 * b2 + a13 * b3;
    out[10] = a2 * b0 + a6 * b1 + a10 * b2 + a14 * b3;
    out[11] = a3 * b0 + a7 * b1 + a11 * b2 + a15 * b3;


    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];

    out[12] = a0 * b0 + a4 * b1 + a8 * b2 + a12 * b3;
    out[13] = a1 * b0 + a5 * b1 + a9 * b2 + a13 * b3;
    out[14] = a2 * b0 + a6 * b1 + a10 * b2 + a14 * b3;
    out[15] = a3 * b0 + a7 * b1 + a11 * b2 + a15 * b3;

    return out;

};

Mat3.translate = function( out, a, b ) {

    //
    // Postmultiplies a translation matrix
    //

    'use strict';

    var a0,
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        a12,
        a13,
        a14,
        a15,
        x,
        y,
        z;

    if ( a.length !== 16 || out.length !== 16 ) {
        throw '<Mat4>: The translation of a 4x4 matrix is a ' +
              '4x4 matrix.';
    }

    if ( b.length !== 4 ) {
        throw '<Mat4>: The translation vector must be of type <Vec4>.';
    }

    a0  = a[0];
    a1  = a[1];
    a2  = a[2];
    a3  = a[3];
    a4  = a[4];
    a5  = a[5];
    a6  = a[6];
    a7  = a[7];
    a8  = a[8];
    a9  = a[9];
    a10 = a[10];
    a11 = a[11];
    x   = b[0];
    y   = b[1];
    z   = b[2];

    if (a === out) {

        out[12] = a0 * x + a4 * y + a8 * z + a[12];
        out[13] = a1 * x + a5 * y + a9 * z + a[13];
        out[14] = a2 * x + a6 * y + a10 * z + a[14];
        out[15] = a3 * x + a7 * y + a11 * z + a[15];

    } else {

        out[0]  = a0;
        out[1]  = a1;
        out[2]  = a2;
        out[3]  = a3;
        out[4]  = a4;
        out[5]  = a5;
        out[6]  = a6;
        out[7]  = a7;
        out[8]  = a8;
        out[9]  = a9;
        out[10] = a10;
        out[11] = a11;
        out[12] = a0 * x + a4 * y + a8 * z + a[12];
        out[13] = a1 * x + a5 * y + a9 * z + a[13];
        out[14] = a2 * x + a6 * y + a10 * z + a[14];
        out[15] = a3 * x + a7 * y + a11 * z + a[15];

    }

    return out;

};

Mat3.scale = function( out, a, b ) {

    //
    // Postmultiplies a scaling matrix
    //

    'use strict';

    var x,
        y,
        z;

    if ( a.length !== 16 || out.length !== 16 ) {
        throw '<Mat4>: The result of scaling a 4x4 matrix is a ' +
              '4x4 matrix.';
    }

    if ( b.length !== 4 ) {
        throw '<Mat4>: The scaling vector must be of type <Vec4>.';
    }

    x = b[0];
    y = b[1];
    z = b[2];

    out[0]  = a[0]  * x;
    out[1]  = a[1]  * x;
    out[2]  = a[2]  * x;
    out[3]  = a[3]  * x;
    out[4]  = a[4]  * y;
    out[5]  = a[5]  * y;
    out[6]  = a[6]  * y;
    out[7]  = a[7]  * y;
    out[8]  = a[8]  * z;
    out[9]  = a[9]  * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];

    return out;

};

Mat3.rotateX = function( out, a, theta ) {

    //
    // Postmultiplies a rotation matrix
    //

    'use strict';

    var a4,
        a5,
        a6,
        a7,
        a8,
        a9,
        a10,
        a11,
        sinTerm,
        cosTerm;

    if ( a.length !== 16 || out.length !== 16 ) {
        throw '<Mat4>: The result of rotating a 4x4 matrix is a ' +
              '4x4 matrix.';
    }

    a4  = a[4];
    a5  = a[5];
    a6  = a[6];
    a7  = a[7];
    a8  = a[8];
    a9  = a[9];
    a10 = a[10];
    a11 = a[11];
    sinTerm = Math.sin( theta );
    cosTerm = Math.cos( theta );

    if ( a !== out ) {

        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];

    }

    out[4]  = a4  * cosTerm + a8 * sinTerm;
    out[5]  = a5  * cosTerm + a9 * sinTerm;
    out[6]  = a6  * cosTerm + a10 * sinTerm;
    out[7]  = a7  * cosTerm + a11 * sinTerm;
    out[8]  = a8  * cosTerm - a4 * sinTerm;
    out[9]  = a9  * cosTerm - a5 * sinTerm;
    out[10] = a10 * cosTerm - a6 * sinTerm;
    out[11] = a11 * cosTerm - a7 * sinTerm;

    return out;

};

Mat3.rotateY = function( out, a, theta ) {

    //
    // Postmultiplies a rotation matrix
    //

    'use strict';

    var a0,
        a1,
        a2,
        a3,
        a8,
        a9,
        a10,
        a11,
        sinTerm,
        cosTerm;

    if ( a.length !== 16 || out.length !== 16 ) {
        throw '<Mat4>: The result of rotating a 4x4 matrix is a ' +
              '4x4 matrix.';
    }

    a0  = a[0];
    a1  = a[1];
    a2  = a[2];
    a3  = a[3];
    a8  = a[8];
    a9  = a[9];
    a10 = a[10];
    a11 = a[11];
    sinTerm = Math.sin( theta );
    cosTerm = Math.cos( theta );

    if ( a !== out ) {

        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];

    }

    out[0]  = a0 * cosTerm - a8 * sinTerm;
    out[1]  = a1 * cosTerm - a9 * sinTerm;
    out[2]  = a2 * cosTerm - a10 * sinTerm;
    out[3]  = a3 * cosTerm - a11 * sinTerm;
    out[8]  = a0 * sinTerm + a8 * cosTerm;
    out[9]  = a1 * sinTerm + a9 * cosTerm;
    out[10] = a2 * sinTerm + a10 * cosTerm;
    out[11] = a3 * sinTerm + a11 * cosTerm;

    return out;

};

Mat3.rotateZ = function( out, a, theta ) {

    //
    // Postmultiplies a rotation matrix
    //

    'use strict';

    var a0,
        a1,
        a2,
        a3,
        a4,
        a5,
        a6,
        a7,
        sinTerm,
        cosTerm;

    if ( a.length !== 16 || out.length !== 16 ) {
        throw '<Mat4>: The result of rotating a 4x4 matrix is a ' +
              '4x4 matrix.';
    }

    a0 = a[0];
    a1 = a[1];
    a2 = a[2];
    a3 = a[3];
    a4 = a[4];
    a5 = a[5];
    a6 = a[6];
    a7 = a[7];
    sinTerm = Math.sin( theta );
    cosTerm = Math.cos( theta );

    if ( a !== out ) {

        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];

    }

    out[0]  = a0 * cosTerm + a4 * sinTerm;
    out[1]  = a1 * cosTerm + a5 * sinTerm;
    out[2]  = a2 * cosTerm + a6 * sinTerm;
    out[3]  = a3 * cosTerm + a7 * sinTerm;
    out[4]  = a4 * sinTerm - a0 * sinTerm;
    out[5]  = a5 * cosTerm - a1 * sinTerm;
    out[6]  = a6 * cosTerm - a2 * sinTerm;
    out[7]  = a7 * cosTerm - a3 * sinTerm;

    return out;

};
*/

Mat3.print = function( a ) {

    'use strict';

    return '[ [ ' +
           a[0].toFixed( 4 ) +
           ', ' +
           a[3].toFixed( 4 ) +
           ', ' +
           a[6].toFixed( 4 ) +
           ' ],\n  [ ' +
           a[1].toFixed( 4 ) +
           ', ' +
           a[4].toFixed( 4 ) +
           ', ' +
           a[7].toFixed( 4 ) +
           ' ],\n  [ ' +
           a[2].toFixed( 4 ) +
           ', ' +
           a[5].toFixed( 4 ) +
           ', ' +
           a[8].toFixed( 4 ) +
           ' ] ]';

};