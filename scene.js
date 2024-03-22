Scene = function( ambientColor ) {

    'use strict';

    this.ambientColor = ambientColor,
    this.lights = {
        point: {
            count: 0,
            ids: [ null, null, null, null, null, null, null, null,
                   null, null, null, null, null, null, null, null ],
            positions: new Float32Array( [ 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0 ] ),
            diffuseColors: new Float32Array( [ 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0 ] ),
            specularColors: new Float32Array( [ 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0 ] ),
            intensities: new Float32Array( [ 0, 0, 0, 0, 0, 0, 0, 0,
                                             0, 0, 0, 0, 0, 0, 0, 0 ] ),
            projectionMatrices: [ Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create() ],
            viewMatrices: [ Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create() ]
        },
        spot: {
            count: 0,
            ids: [ null, null, null, null, null, null, null, null,
                   null, null, null, null, null, null, null, null ],
            positions: new Float32Array( [ 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0 ] ),
            directions: new Float32Array( [ 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                            0, 0, 0, 0, 0, 0, 0, 0, 0,
                                            0, 0, 0, 0, 0, 0, 0, 0, 0,
                                            0, 0, 0, 0, 0, 0, 0, 0, 0,
                                            0, 0, 0, 0, 0, 0, 0, 0, 0,
                                            0, 0, 0 ] ),
            angles: new Float32Array( [ 0, 0, 0, 0, 0, 0, 0, 0,
                                        0, 0, 0, 0, 0, 0, 0, 0 ] ),
            exponents: new Float32Array( [ 0, 0, 0, 0, 0, 0, 0, 0,
                                           0, 0, 0, 0, 0, 0, 0, 0 ] ),
            diffuseColors: new Float32Array( [ 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0 ] ),
            specularColors: new Float32Array( [ 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0, 0, 0, 0, 0, 0, 0,
                                                0, 0, 0 ] ),
            intensities: new Float32Array( [ 0, 0, 0, 0, 0, 0, 0, 0,
                                             0, 0, 0, 0, 0, 0, 0, 0 ] ),
            projectionMatrices: [ Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create(),
                                  Mat4.create(), Mat4.create() ],
            viewMatrices: [ Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create(),
                            Mat4.create(), Mat4.create() ],
            colorTextures: [ null, null, null, null, null, null, null, null,
                             null, null, null, null, null, null, null, null ],
            depthTextures: [ null, null, null, null, null, null, null, null,
                             null, null, null, null, null, null, null, null ],
            framebuffers: [ null, null, null, null, null, null, null, null,
                            null, null, null, null, null, null, null, null ]
        }
    };

};

Scene.prototype.setAmbientColor = function( ambientColor ) {

    'use strict';

    if ( typeof ambientColor !== 'object' || ! ambientColor.hasOwnProperty( 'length' ) ) {
        throw '<Scene> Cannot set scene ambient color: argument "ambientColor" must be ' +
              'an array.';    
    }

    if ( ambientColor.length !== 3 ) {
        throw '<Scene> Cannot set scene ambient color: argument "ambientColor" must be ' +
              'an array of three values ( r, g, b ).';
    }

    this.ambientColor = ambientColor;

};

Scene.prototype.addLight = function( id, type, options ) {

    'use strict';

    var type,
        offset;

    switch ( type ) {

        case 'point':

            if ( ! options.hasOwnProperty( 'position' ) ) {
                throw '<Scene> Cannot add light: property "position" required ' +
                      'for type "point".';
            }
            if ( ! options.hasOwnProperty( 'diffuseColor' ) ) {
                throw '<Scene> Cannot add light: property "diffuseColor" ' +
                      'required for type "point".';
            }
            if ( ! options.hasOwnProperty( 'specularColor' ) ) {
                throw '<Scene> Cannot add light: property "specularColor" ' +
                      'required for type "point".';
            }
            if ( ! options.hasOwnProperty( 'intensity' ) ) {
                throw '<Scene> Cannot add light: property "intensity" required ' +
                      'for type "point".';
            }

            type = this.lights.point;

            if ( type.ids.indexOf( id ) !== -1 ) {
                throw '<Scene> Cannot add light: id already exists.';
            }

            offset = 0;

            while ( type.ids[ offset ] !== null ) {
                offset++;
            }

            if ( offset > type.ids.length ) {
                throw '<Scene> Cannot add light: all lights in use.';
            }

            type.ids[ offset ] = id;
            type.positions[ offset * 3 ] = options.position[0];
            type.positions[ offset * 3 + 1 ] = options.position[1];
            type.positions[ offset * 3 + 2 ] = options.position[2];
            type.diffuseColors[ offset * 3 ] = options.diffuseColor[0];
            type.diffuseColors[ offset * 3 + 1 ] = options.diffuseColor[1];
            type.diffuseColors[ offset * 3 + 2 ] = options.diffuseColor[2];
            type.specularColors[ offset * 3 ] = options.specularColor[0];
            type.specularColors[ offset * 3 + 1 ] = options.specularColor[1];
            type.specularColors[ offset * 3 + 2 ] = options.specularColor[2];
            type.intensities[ offset ] = options.intensity;

            type.count++;

            break;

        case 'spot':
            if ( ! options.hasOwnProperty( 'position' ) ) {
                throw '<Scene> Cannot add light: property "position" required ' +
                      'for type "spot".';
            }
            if ( ! options.hasOwnProperty( 'direction' ) ) {
                throw '<Scene> Cannot add light: property "direction" required ' +
                      'for type "spot".';
            }
            if ( ! options.hasOwnProperty( 'angle' ) ) {
                throw '<Scene> Cannot add light: property "angle" required ' +
                      'for type "spot".';
            }
            if ( ! options.hasOwnProperty( 'exponent' ) ) {
                throw '<Scene> Cannot add light: property "exponent" required ' +
                      'for type "spot".';
            }
            if ( ! options.hasOwnProperty( 'diffuseColor' ) ) {
                throw '<Scene> Cannot add light: property "diffuseColor" ' +
                      'required for type "spot".';
            }
            if ( ! options.hasOwnProperty( 'specularColor' ) ) {
                throw '<Scene> Cannot add light: property "specularColor" ' +
                      'required for type "spot".';
            }
            if ( ! options.hasOwnProperty( 'intensity' ) ) {
                throw '<Scene> Cannot add light: property "intensity" required ' +
                      'for type "spot".';
            }

            type = this.lights.spot;

            if ( type.ids.indexOf( id ) !== -1 ) {
                throw '<Scene> Cannot add light: id already exists.';
            }

            offset = 0;

            while ( type.ids[ offset ] !== null ) {
                offset++;
            }

            if ( offset > type.ids.length ) {
                throw '<Scene> Cannot add light: all lights in use.';
            }

            type.ids[ offset ] = id;
            type.positions[ offset * 3 ] = options.position[0];
            type.positions[ offset * 3 + 1 ] = options.position[1];
            type.positions[ offset * 3 + 2 ] = options.position[2];
            type.directions[ offset * 3 ] = options.direction[0];
            type.directions[ offset * 3 + 1 ] = options.direction[1];
            type.directions[ offset * 3 + 2 ] = options.direction[2];
            type.angles[ offset ] = Math.cos( ( Math.PI / 180 ) * options.angle );
            type.exponents[ offset ] = options.exponent;
            type.diffuseColors[ offset * 3 ] = options.diffuseColor[0];
            type.diffuseColors[ offset * 3 + 1 ] = options.diffuseColor[1];
            type.diffuseColors[ offset * 3 + 2 ] = options.diffuseColor[2];
            type.specularColors[ offset * 3 ] = options.specularColor[0];
            type.specularColors[ offset * 3 + 1 ] = options.specularColor[1];
            type.specularColors[ offset * 3 + 2 ] = options.specularColor[2];
            type.intensities[ offset ] = options.intensity;

            type.count++;

            break;

        default:
            throw '<Scene> Cannot add light: invalid type.';
            break;

    }

    return id;

};

Scene.prototype.removeLight = function( type, id ) {

    'use strict';

    var type,
        offset;

    switch ( type ) {

        case 'point':
            type = this.lights.point;
            offset = type.ids.indexOf( id );

            if ( offset === -1 ) {
                throw '<Scene> Cannot remove light: id "' + id + '" is not assigned to ' +
                      'a light of type "point".';
            }

            type.ids.splice( offset, 1 );
            type.positions.splice( offset * 3, 3 );
            type.diffuseColors.splice( offset * 3, 3 );
            type.specularColors.splice( offset * 3, 3 );
            type.intensities.splice( offset, 1 );

            break;

        case 'spot':
            type = this.lights.spot;
            offset = type.ids.indexOf( id );

            if ( offset === -1 ) {
                throw '<Scene> Cannot remove light: id "' + id + '" is not assigned to ' +
                      'a light of type "spot".';
            }

            type.ids.splice( offset, 1 );
            type.positions.splice( offset * 3, 3 );
            type.directions.splice( offset * 3, 3 );
            type.angles.splice( offset, 1 );
            type.exponents.splice( offset, 1 );
            type.diffuseColors.splice( offset * 3, 3 );
            type.specularColors.splice( offset * 3, 3 );
            type.intensities.splice( offset, 1 );

            break;

        default:
            throw '<Scene> Cannot remove light: invalid type.';
            break;

    }

};