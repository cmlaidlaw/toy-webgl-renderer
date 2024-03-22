Vec3 = {};

Vec3.create = function( elements ) {

    'use strict';

    if ( typeof elements === 'undefined' ) {

        return new Float32Array( [ 0, 0, 0 ] );

    } else if ( elements.hasOwnProperty( 'length' ) && elements.length !== 3 ) {

        throw '<Vec3>: A 3-dimensional vector requires 2 elements to create.';

    }

    return new Float32Array( elements );  

};

Vec3.copy = function( out, a ) {

    'use strict';

    if ( a.length !== out.length || a.length !== 3 ) {
        throw '<Vec3>: Cannot copy a 3-dimensional vector into a vector of different ' +
              'dimensionality.';
    }

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];

    return out;

};

Vec3.add = function( out, a, b ) {

    'use strict';

    if ( typeof out === 'undefined' || typeof a === 'undefined' || typeof b === 'undefined' ) {
        throw '<Vec3>: Insufficient arguments to add vectors: three 3-dimensional ' +
              'vectors are required ( out, a, b ).';
    } else if ( a.length !== b.length || a.length !== out.length ) {
        if ( out.length !== 3 ) {
            throw '<Vec3>: The sum of two 3-dimensional vectors is a ' +
                  '3-dimensional vector.';
        } else {
            throw '<Vec3>: Cannot add vectors of unequal length.';
        }
    }

    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];

    return out;

};

Vec3.subtract = function( out, a, b ) {

    'use strict';

    if ( a.length !== b.length || a.length !== out.length ) {
        if ( out.length !== 3 ) {
            throw '<Vec3>: The difference of two 3-dimensional vectors is a ' +
                  '3-dimensional vector.';
        } else {
            throw '<Vec3>: Cannot subtract vectors of unequal length.';
        }
    }

    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];

    return out;

};

Vec3.multiply = function( out, a, b ) {

    'use strict';

    if ( a.length !== b.length || a.length !== out.length ) {
        if ( out.length !== 3 ) {
            throw '<Vec3>: The product of two 3-dimensional vectors is a ' +
                  '3-dimensional vector.';
        } else {
            throw '<Vec3>: Cannot multiply vectors of unequal length.';
        }
    }

    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];

    return out;

};

Vec3.divide = function( out, a, b ) {

    'use strict';

    if ( a.length !== b.length || a.length !== out.length ) {
        if ( out.length !== 3 ) {
            throw '<Vec3>: The quotient of two 3-dimensional vectors is a ' +
                  '3-dimensional vector.';
        } else {
            throw '<Vec3>: Cannot divide vectors of unequal length.';
        }
    }

    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];

    return out;

};

Vec3.scale = function( out, a, s ) {

    'use strict';

    if ( out.length !== 3 ) {
        throw '<Vec3>: The result of scaling a 3-dimensional vector is a ' +
              '3-dimensional vector.';
    }

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;

    return out;

};

Vec3.dot = function( a, b ) {

    if ( a.length !== b.length ) {
        throw '<Vec3>: The dot product is undefined for vectors of different ' +
              'dimensionality.';
    }

    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

};

Vec3.cross = function( out, a, b ) {

    if ( a.length !== b.length || out.length !== 3 ) {
        if ( out.length !== 3 ) {
            throw '<Vec3>: The cross product of two vectors is a 3-dimensional vector. ';
        } else {
            throw '<Vec3>: The cross product is undefined for vectors of different ' +
                  'dimensionality.';
        }
    }

    // The || 0 term is to correct for negative zero results.

    out[0] = a[1] * b[2] - a[2] * b[1] || 0;
    out[1] = a[2] * b[0] - a[0] * b[2] || 0;
    out[2] = a[0] * b[1] - a[1] * b[0] || 0;

    return out;

};

Vec3.norm = function( a ) {

    'use strict';

    return Math.sqrt( Math.pow( a[0], 2 ) +
                      Math.pow( a[1], 2 ) +
                      Math.pow( a[2], 2 ) );

};

Vec3.distance = function( a, b ) {

    'use strict';

    return Math.sqrt( Math.pow( b[0] - a[0], 2 ) +
                      Math.pow( b[1] - a[1], 2 ) +
                      Math.pow( b[2] - a[2], 2 ) );

};

Vec3.invert = function( out, a ) {

    'use strict';

    if ( out.length !== 3 ) {
        throw '<Vec3>: The inverse of a 3-dimensional vector is a ' +
              '3-dimensional vector.';
    }

    out[0] = 1 / a[0];
    out[1] = 1 / a[1];
    out[2] = 1 / a[2];

    return out;

};

Vec3.normalize = function( out, a ) {

    'use strict';

    var norm;

    if ( out.length !== 3 ) {
        throw '<Vec3>: The normalized vector of a 3-dimensional vector is ' +
              'a 3-dimensional vector.';
    }

    norm = Math.pow( a[0], 2 ) +
           Math.pow( a[1], 2 ) +
           Math.pow( a[2], 2 );

    if ( norm === 0 ) {
        throw '<Vec3>: Cannot normalize a vector with length 0.';
    }

    // This cleverness from gl-matrix: https://github.com/toji/gl-matrix/
    // I guess one division and two multiplications are faster than two
    // divisions?

    norm = 1 / Math.sqrt( norm );
    out[0] = a[0] * norm;
    out[1] = a[1] * norm;
    out[2] = a[2] * norm;

    return out;

};

Vec3.print = function( a ) {

    'use strict';

    return '[ ' +
            a[0].toFixed( 4 ) +
            ', ' +
            a[1].toFixed( 4 ) +
            ', ' +
            a[2].toFixed( 4 ) +
            ' ]';

};