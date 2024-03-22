Vec4 = {};

Vec4.create = function( elements ) {

    'use strict';

    if ( typeof elements === 'undefined' ) {

        return new Float32Array( [ 0, 0, 0, 0 ] );

    } else if ( elements.hasOwnProperty( 'length' ) && elements.length !== 4 ) {

        throw '<Vec4>: A 4-dimensional vector requires 4 elements to create.';

    }

    return new Float32Array( elements );    

};

Vec4.copy = function( out, a ) {

    'use strict';

    if ( a.length !== out.length || a.length !== 4 ) {
        throw '<Vec4>: Cannot copy a 4-dimensional vector into a vector of different ' +
              'dimensionality.';
    }

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];

    return out;

};

Vec4.add = function( out, a, b ) {

    'use strict';

    if ( a.length !== b.length || a.length !== out.length ) {
        if ( out.length !== 4 ) {
            throw '<Vec4>: The sum of two 4-dimensional vectors is a ' +
                  '4-dimensional vector.';
        } else {
            throw '<Vec4>: Cannot add vectors of unequal length.';
        }
    }

    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];

    return out;

};

Vec4.subtract = function( out, a, b ) {

    'use strict';

    if ( a.length !== b.length || a.length !== out.length ) {
        if ( out.length !== 4 ) {
            throw '<Vec4>: The difference of two 4-dimensional vectors is a ' +
                  '4-dimensional vector.';
        } else {
            throw '<Vec4>: Cannot subtract vectors of unequal length.';
        }
    }

    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];

    return out;

};

Vec4.multiply = function( out, a, b ) {

    'use strict';

    if ( a.length !== b.length || a.length !== out.length ) {
        if ( out.length !== 4 ) {
            throw '<Vec4>: The product of two 4-dimensional vectors is a ' +
                  '4-dimensional vector.';
        } else {
            throw '<Vec4>: Cannot multiply vectors of unequal length.';
        }
    }

    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];

    return out;

};

Vec4.divide = function( out, a, b ) {

    'use strict';

    if ( a.length !== b.length || a.length !== out.length ) {
        if ( out.length !== 4 ) {
            throw '<Vec4>: The quotient of two 4-dimensional vectors is a ' +
                  '4-dimensional vector.';
        } else {
            throw '<Vec4>: Cannot divide vectors of unequal length.';
        }
    }

    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];

    return out;

};

Vec4.scale = function( out, a, s ) {

    'use strict';

    if ( out.length !== 4 ) {
        throw '<Vec4>: The result of scaling a 4-dimensional vector is a ' +
              '4-dimensional vector.';
    }

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;

    return out;

};

Vec4.dot = function( a, b ) {

    if ( a.length !== b.length ) {
        throw '<Vec4>: The dot product is undefined for vectors of different ' +
              'dimensionality.';
    }

    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];

};

Vec4.norm = function( a ) {

    'use strict';

    return Math.sqrt( Math.pow( a[0], 2 ) +
                      Math.pow( a[1], 2 ) +
                      Math.pow( a[2], 2 ) +
                      Math.pow( a[3], 2 ) );

};

Vec4.distance = function( a, b ) {

    'use strict';

    return Math.sqrt( Math.pow( b[0] - a[0], 2 ) +
                      Math.pow( b[1] - a[1], 2 ) +
                      Math.pow( b[2] - a[2], 2 ) +
                      Math.pow( b[3] - a[3], 2 ) );

};

Vec4.invert = function( out, a ) {

    'use strict';

    if ( out.length !== 4 ) {
        throw '<Vec4>: The inverse of a 4-dimensional vector is a ' +
              '4-dimensional vector.';
    }

    out[0] = 1 / a[0];
    out[1] = 1 / a[1];
    out[2] = 1 / a[2];
    out[3] = 1 / a[3];

    return out;

};

Vec4.normalize = function( out, a ) {

    'use strict';

    var norm;

    if ( out.length !== 4 ) {
        throw '<Vec4>: The normalized vector of a 4-dimensional vector is ' +
              'a 4-dimensional vector.';
    }

    norm = Math.pow( a[0], 2 ) +
           Math.pow( a[1], 2 ) +
           Math.pow( a[2], 2 ) +
           Math.pow( a[3], 2 );

    if ( norm === 0 ) {
        throw '<Vec4>: Cannot normalize a vector with length 0.';
    }

    // This cleverness from gl-matrix: https://github.com/toji/gl-matrix/
    // I guess one division and two multiplications are faster than two
    // divisions?

    norm = 1 / Math.sqrt( norm );
    out[0] = a[0] * norm;
    out[1] = a[1] * norm;
    out[2] = a[2] * norm;
    out[3] = a[3] * norm;

    return out;

};

Vec4.premultiplyByMat4 = function( out, a, b ) {

    'use strict';

    var x,
        y,
        z,
        w;

    if ( b.length !== 16 ) {
        throw '<Vec4>: The premultiply term must be a 4x4 matrix.';
    }

    if ( out.length !== 4 ) {
        throw '<Vec4>: The product of a 4x4 matrix and a 4-dimensional vector is a ' +
              '4-dimensional vector.';
    }

    x = a[0];
    y = a[1];
    z = a[2];
    w = a[3];
    
    out[0] = b[0] * x + b[4] * y + b[8] * z + b[12] * w;
    out[1] = b[1] * x + b[5] * y + b[9] * z + b[13] * w;
    out[2] = b[2] * x + b[6] * y + b[10] * z + b[14] * w;
    out[3] = b[3] * x + b[7] * y + b[11] * z + b[15] * w;

    return out;

};

Vec4.print = function( a ) {

    'use strict';

    return '[ ' +
           a[0].toFixed( 4 ) +
           ', ' +
           a[1].toFixed( 4 ) +
           ', ' +
           a[2].toFixed( 4 ) +
           ', ' +
           a[3].toFixed( 4 ) +
           ' ]';

};