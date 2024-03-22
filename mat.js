Vec = function() { return true; };

Vec.prototype._add = function( a, b ) {

    'use strict';


};


Mat = function() { return true; };

Mat.prototype._add = function( A, B ) {

    'use strict';

};

Mat.prototype._scalMult = function( A, s ) {

    'use strict';

    var i,
        elementCount = A.elements.length,
        newElements = [];

    for ( i = 0; i < elementCount; i++ ) {

        newElements.push( A.elements[i] * s );

    }

    return newElements;

};

Mat.prototype._vecMult = function( A, b ) {

    'use strict';

    var rows = b.dimensions,
        columns = A.columns,
        row,
        element,
        i,
        newElements;

    if ( A.columns !== b.dimensions ) {
        throw '<Mat>: Product is undefined; the number of columns in A ' +
              'must match the number of dimensions of b.';
    }

    newElements = [];

    for ( row = 0; row < rows; row++ ) {

        element = 0;

        for ( i = 0; i < columns; i++ ) {
            element += A.elements[row * rows + i] * b.elements[i]
        }

        newElements.push( element );

    }

    return newElements;

};

Mat.prototype._matMult = function( A, B ) {

    'use strict';

    var rows = B.rows,
        columns = A.columns,
        row,
        col,
        i,
        element,
        newElements;

    if ( A.columns !== B.rows ) {
        throw '<Mat>: Product is undefined; the number of columns in A ' +
              'must match the number of rows in B.';
    }

    newElements = [];

    for ( row = 0; row < rows; row++ ) {
        
        for ( col = 0; col < columns; col++ ) {

            element = 0;

            for ( i = 0; i < rows; i++ ) {

                element += A.elements[row * rows + i] * B.elements[col + columns * i]

            }

            newElements.push( element );//[ ( row * 2 ) + col ] = val;

        }

    }

    return newElements;

};

//
// Vectors are column-major
//