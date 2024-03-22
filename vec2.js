Vec2 = {};

Vec2.create = function( elements ) {

    'use strict';

    if ( typeof elements === 'undefined' ) {

        return new Float32Array( [ 0, 0 ] );

    } else if ( elements.hasOwnProperty( 'length' ) && elements.length !== 2 ) {

        throw '<Vec2>: A 2-dimensional vector requires 2 elements to create.';

    }

    return new Float32Array( elements );

};

Vec2.copy = function( out, a ) {

    'use strict';

    if ( a.length !== out.length || a.length !== 2 ) {
        throw '<Vec2>: Cannot copy a 2-dimensional vector into a vector of different ' +
              'dimensionality.';
    }

    out[0] = a[0];
    out[1] = a[1];

    return out;

};

Vec2.add = function( out, a, b ) {

    'use strict';

    if ( a.length !== b.length || a.length !== out.length ) {
        if ( out.length !== 2 ) {
            throw '<Vec2>: The sum of two 2-dimensional vectors is a ' +
                  '2-dimensional vector.';
        } else {
            throw '<Vec2>: Cannot add vectors of unequal length.';
        }
    }

    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];

    return out;

};

Vec2.subtract = function( out, a, b ) {

    'use strict';

    if ( a.length !== b.length || a.length !== out.length ) {
        if ( out.length !== 2 ) {
            throw '<Vec2>: The difference of two 2-dimensional vectors is a ' +
                  '2-dimensional vector.';
        } else {
            throw '<Vec2>: Cannot subtract vectors of unequal length.';
        }
    }

    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];

    return out;

};

Vec2.multiply = function( out, a, b ) {

    'use strict';

    if ( a.length !== b.length || a.length !== out.length ) {
        if ( out.length !== 2 ) {
            throw '<Vec2>: The product of two 2-dimensional vectors is a ' +
                  '2-dimensional vector.';
        } else {
            throw '<Vec2>: Cannot multiply vectors of unequal length.';
        }
    }

    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];

    return out;

};

Vec2.divide = function( out, a, b ) {

    'use strict';

    if ( a.length !== b.length || a.length !== out.length ) {
        if ( out.length !== 2 ) {
            throw '<Vec2>: The quotient of two 2-dimensional vectors is a ' +
                  '2-dimensional vector.';
        } else {
            throw '<Vec2>: Cannot divide vectors of unequal length.';
        }
    }

    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];

    return out;

};

Vec2.scale = function( out, a, s ) {

    'use strict';

    if ( out.length !== 2 ) {
        throw '<Vec2>: The result of scaling a 2-dimensional vector is a ' +
              '2-dimensional vector.';
    }

    out[0] = a[0] * s;
    out[1] = a[1] * s;

    return out;

};

Vec2.dot = function( a, b ) {

    if ( a.length !== b.length ) {
        throw '<Vec2>: The dot product is undefined for vectors of different ' +
              'dimensionality.';
    }

    return a[0] * b[0] + a[1] * b[1];

};

Vec2.cross = function( out, a, b ) {

    if ( a.length !== b.length || out.length !== 3 ) {
        if ( out.length !== 3 ) {
            throw '<Vec2>: The cross product of two vectors is a 3-dimensional vector. ';
        } else {
            throw '<Vec2>: The cross product is undefined for vectors of different ' +
                  'dimensionality.';
        }
    }



    out[0] = 0; //a[1] * b[2] - a[2] * b[1];
    out[1] = 0; //a[2] * b[0] - a[0] * b[2];
    out[2] = a[0] * b[1] - a[1] * b[0];

    return out;

};

Vec2.norm = function( a ) {

    'use strict';

    return Math.sqrt( Math.pow( a[0], 2 ) +
           Math.pow( a[1], 2 ) );

};

Vec2.distance = function( a, b ) {

    'use strict';

    return Math.sqrt( Math.pow( b[0] - a[0], 2 ) +
           Math.pow( b[1] - a[1], 2 ) );

};

Vec2.invert = function( out, a ) {

    'use strict';

    if ( out.length !== 2 ) {
        throw '<Vec2>: The inverse of a 2-dimensional vector is a ' +
              '2-dimensional vector.';
    }

    out[0] = 1 / a[0];
    out[1] = 1 / a[1];

    return out;

};

Vec2.normalize = function( out, a ) {

    'use strict';

    var norm;

    if ( out.length !== 2 ) {
        throw '<Vec2>: The normalized vector of a 2-dimensional vector is ' +
              'a 2-dimensional vector.';
    }

    norm = Math.pow( a[0], 2 ) +
           Math.pow( a[1], 2 );

    if ( norm === 0 ) {
        throw '<Vec2>: Cannot normalize a vector with length 0.';
    }

    // This cleverness from gl-matrix: https://github.com/toji/gl-matrix/
    // I guess one division and two multiplications are faster than two
    // divisions?

    norm = 1 / Math.sqrt( norm );
    out[0] = a[0] * norm;
    out[1] = a[1] * norm;

    return out;

};

Vec2.print = function( a ) {

    'use strict';

    return '[ ' +
           a[0].toFixed( 4 ) +
           ', ' +
           a[1].toFixed( 4 ) +
           ' ]';

};