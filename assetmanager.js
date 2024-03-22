AssetManager = function( readyCallback ) {

    'use strict';

    this.shaders = {};
    this.programs = {};
    this.models = {};
    this.meshes = {};
    this.materials = {};
    this.textures = {};
    this.loading = 0;

};

AssetManager.prototype.assetLoadedCallback = function( type, name, data ) {

    'use strict';

    switch ( type ) {

        case 'shader':
            this.shaders[ name ] = data;
            break;

        case 'mesh':
            this.meshes[ name ] = data;
            break;

        case 'material':
            this.materials[ name ] = data;
            break;

        case 'texture':
            this.textures[ name ] = data;
            break;

        default:
            break;

    }

    this.loading--;

    if ( this.loading === 0 ) {
        this.assetsReadyCallback();
    }

};

AssetManager.prototype.load = function( manifest, callback ) {

    'use strict';

    var i,
        programName,
        modelName,
        modelAssets;

    this.assetsReadyCallback = callback;

    if ( manifest.hasOwnProperty( 'shaders' ) ) {
        for ( i = 0; i < manifest.shaders.length; i++ ) {
            this.loadShader( manifest.shaders[i] );
        }
    }

    if ( manifest.hasOwnProperty( 'programs' ) ) {
        for ( programName in manifest.programs ) {
            if ( manifest.programs.hasOwnProperty( programName ) ) {
                this.programs[ programName ] = manifest.programs[ programName ];
            }
        }
    }

    if ( manifest.hasOwnProperty( 'models' ) ) {

        for ( modelName in manifest.models ) {

            this.models[ modelName ] = manifest.models[ modelName ];

            modelAssets = manifest.models[ modelName ];

            if ( modelAssets.hasOwnProperty( 'meshes' ) ) {
                for ( i = 0; i < modelAssets.meshes.length; i++ ) {
                    this.loadMesh( modelAssets.meshes[i] );
                }
            }

            if ( modelAssets.hasOwnProperty( 'materials' ) ) {
                for ( i = 0; i < modelAssets.materials.length; i++ ) {
                    this.loadMaterial( modelAssets.materials[i] );
                }
            }

            if ( modelAssets.hasOwnProperty( 'textures' ) ) {
                for ( i = 0; i < modelAssets.textures.length; i++ ) {
                    this.loadTexture( modelAssets.textures[i] );
                }
            }

        }

    }

};

AssetManager.prototype.loadShader = function( name ) {

    'use strict';

    var manager = this,
        xhr = new XMLHttpRequest();

    manager.loading++;

    xhr.addEventListener( 'readystatechange', function() {
        if ( xhr.readyState === 4 ) {
            manager.assetLoadedCallback( 'shader', name, xhr.response );
        }
    } );

    xhr.open( 'GET',
               SHADER_PATH + name,
               true );
    xhr.send();

};

AssetManager.prototype.loadMesh = function( name ) {

    'use strict';

    var manager = this,
        xhr = new XMLHttpRequest();

    manager.loading++;

    xhr.addEventListener( 'readystatechange', function() {
        if ( xhr.readyState === 4 ) {
            manager.assetLoadedCallback( 'mesh', name, manager.parseObj( xhr.response, name ) );
        }
    } );

    xhr.open( 'GET',
               ASSET_PATH + name,
               true );
    xhr.send();

};

AssetManager.prototype.loadMaterial = function( name ) {

    'use strict';

    var manager = this,
        xhr = new XMLHttpRequest();

    manager.loading++;

    xhr.addEventListener( 'readystatechange', function() {
        if ( xhr.readyState === 4 ) {
            manager.assetLoadedCallback( 'material', name, manager.parseMtl( xhr.response, name ) );
        }
    } );

    xhr.open( 'GET',
               ASSET_PATH + name,
               true );
    xhr.send();

};

AssetManager.prototype.loadTexture = function( name ) {

    'use strict';

    var manager = this,
        texture = new Image();

    manager.loading++;

    texture.addEventListener( 'load', function() {
        manager.assetLoadedCallback( 'texture', name, texture );
    } );

    texture.src = ASSET_PATH + name;

};

AssetManager.prototype.getShader = function( name ) {

    'use strict';

    if ( ! this.shaders.hasOwnProperty( name ) ) {
        throw '<AssetManager>: Cannot get non-existent shader "' + name + '".';
    }

    return this.shaders[ name ];

};

AssetManager.prototype.getModel = function( name ) {

    'use strict';

    if ( ! this.models.hasOwnProperty( name ) ) {
        throw '<AssetManager>: Cannot get non-existent model "' + name + '".';
    }

    return this.models[ name ];

};

AssetManager.prototype.getMesh = function( name ) {

    'use strict';

    if ( ! this.meshes.hasOwnProperty( name ) ) {
        throw '<AssetManager>: Cannot get non-existent mesh "' + name + '".';
    }

    return this.meshes[ name ];

};

AssetManager.prototype.getMaterial = function( name ) {

    'use strict';

    if ( ! this.materials.hasOwnProperty( name ) ) {
        throw '<AssetManager>: Cannot get non-existent material "' + name + '".';
    }

    return this.materials[ name ];

};

AssetManager.prototype.getTexture = function( name ) {

    'use strict';

    if ( ! this.textures.hasOwnProperty( name ) ) {
        throw '<AssetManager>: Cannot get non-existent texture "' + name + '".';
    }

    return this.textures[ name ];

};




AssetManager.prototype.parseObj = function( obj, filename ) {

    'use strict';

    var lines = obj.split( '\n' ),
        lineCount = lines.length,
        i,
        line,
        v = [],
        vt = [],
        vn = [],
        f = [],
        faceCount,
        j,
        faceString,
        faceValues,
        knownVertexIndices = {},
        vertexIndexMap = {},
        vertexIndex,
        vertexIndices = [],
        rawVertexIndices = [],
        vertexPositions = [],
        textureCoords = [],
        faceNormalMap = {},
        faceNormals = [],
        vertexNormals = [],
        getTriangleArea = GLU.getTriangleArea,
        aIndices,
        bIndices;

    for ( i = 0; i < lineCount; i++ ) {

        line = lines[i].split( ' ' );

        switch ( line[0] ) {

            case 'g':
                break;

            case 'v':
                v.push( [
                            parseFloat( line[1].trim() ),
                            parseFloat( line[2].trim() ),
                            parseFloat( line[3].trim() )
                        ] );
                break;

            case 'vt':
                vt.push( [
                            parseFloat( line[1].trim() ),
                            parseFloat( line[2].trim() )
                         ] );
                break;

            case 'vn':
                vn.push( [
                            parseFloat( line[1].trim() ),
                            parseFloat( line[2].trim() ),
                            parseFloat( line[3].trim() )
                         ] );
                break;

            case 'f':
                if ( line[1].indexOf( '/' ) !== -1 ) {

                    if ( line.length === 3) {

                        f.push( [
                                    line[1].trim(),
                                    line[2].trim()
                                ] );

                    } else if ( line.length === 4 ) {

                        f.push( [
                                    line[1].trim(),
                                    line[2].trim(),
                                    line[3].trim()
                                ] );

                    }

                } else {

                    f.push( [
                                parseInt( line[1].trim(), 10 ),
                                parseInt( line[2].trim(), 10 ),
                                parseInt( line[3].trim(), 10 )
                            ] );

                }
                break;

            case 'usemtl':
                break;

        }

    }

    faceCount = f.length;
    vertexIndex = 0;

    for ( i = 0; i < faceCount; i++ ) {

        for ( j = 0; j < f[i].length; j++ ) {

            if ( typeof f[i][j] === 'number' || f[i][j].indexOf( '/' ) === -1 ) {

                vertexPositions.push( parseInt( f, 10 ) );
                vertexIndices.push( indexCount );
                indexCount++;

            } else {

                faceString = f[i][j];

                if ( knownVertexIndices.hasOwnProperty( faceString ) ) {

                    vertexIndices.push( knownVertexIndices[ faceString ] );

                } else {

                    faceValues = faceString.split( '/' ).map( function( item ) { return parseInt( item, 10 ) - 1; } );

                    if ( faceValues.length !== 3 ) {
                        throw '<AssetManager> Cannot parse OBJ file: invalid file format.';
                    }

                    if ( Number.isNaN( faceValues[0] ) ) {
                        throw '<AssetManager> Cannot parse "' + filename + '": ' +
                              'Face definitions require a vertex index.' +
                              'This should not be possible.';
                    }

                    if ( Number.isNaN( faceValues[1] ) ) {
                        throw '<AssetManager> Cannot parse "' + filename + '": ' +
                              'Face definitions require a texture index. ' +
                              'Re-export a UV-mapped model.';
                    }

                    if ( Number.isNaN( faceValues[2] ) ) {
                        throw '<AssetManager> Cannot parse "' + filename + '": ' +
                              'Face definitions require a normal index. ' +
                              'Re-export with "Write normals" enabled.';
                    }

                    vertexIndexMap[ vertexIndex ] = faceValues[0];
                    faceNormalMap[ vertexIndex ] = faceValues[2];

                    vertexPositions.push( v[ faceValues[0] ][0] );
                    vertexPositions.push( v[ faceValues[0] ][1] );
                    vertexPositions.push( v[ faceValues[0] ][2] );

                    faceNormals.push( vn[ faceValues[2] ][0] );
                    faceNormals.push( vn[ faceValues[2] ][1] );
                    faceNormals.push( vn[ faceValues[2] ][2] );

                    vertexNormals.push( vn[ faceValues[2] ][0] );
                    vertexNormals.push( vn[ faceValues[2] ][1] );
                    vertexNormals.push( vn[ faceValues[2] ][2] );

                    textureCoords.push( vt[ faceValues[1] ][0] );
                    textureCoords.push( vt[ faceValues[1] ][1] );

                    vertexIndices.push( vertexIndex );

                    knownVertexIndices[ faceString ] = vertexIndex;

                    vertexIndex++;

                }

            }

        }

    }


    /*

    // Temporarily disable per-vertex normals since they're a little buggy

    // Calculate vertex normals

    var rawVertexNormals = {};

    for ( i = 0; i < vertexIndices.length; i += 3 ) {

        var aIndices = [ vertexIndices[ i ], vertexIndices[ i + 1 ], vertexIndices[ i + 2 ] ];
        var aMappedIndices = [ vertexIndexMap[ aIndices[0] ], vertexIndexMap[ aIndices[1] ], vertexIndexMap[ aIndices[2] ] ];

        for ( v = 0; v < 3; v++ ) {

            var vertexIndex = aIndices[ v ];
            var mappedVertexIndex = parseInt( aMappedIndices[ v ], 10 );
            var adjacent = [];
            var mappedAdjacent = [];

            for ( j = 0; j < vertexIndices.length; j += 3 ) {

                var bIndices = [ vertexIndices[j], vertexIndices[j+1], vertexIndices[j+2] ];
                var bMappedIndices = [ vertexIndexMap[ bIndices[0] ], vertexIndexMap[ bIndices[1] ], vertexIndexMap[ bIndices[2] ] ];

                if ( mappedVertexIndex === bMappedIndices[0]
                     || mappedVertexIndex === bMappedIndices[1]
                     || mappedVertexIndex === bMappedIndices[2] ) {

                    adjacent.push( bIndices );
                    mappedAdjacent.push( bMappedIndices );

                }

            }

            var temp = Vec3.create();
            var normalized = Vec3.create();

            var side1;
            var side2;
            var out;

            var vertexFaceNormals = [];
            var vertexFaceAreas = [];
            var vertexFaceAngles = [];
            
            var vertexFaceNormal;
            var vertexFaceArea;
            var vertexFaceAngle;

            for ( j = 0; j < adjacent.length; j++ ) {

                var A = Vec3.create( [ vertexPositions[ adjacent[j][0] * 3 ],
                                       vertexPositions[ adjacent[j][0] * 3 + 1 ],
                                       vertexPositions[ adjacent[j][0] * 3 + 2 ] ] );
                var B = Vec3.create( [ vertexPositions[ adjacent[j][1] * 3 ],
                                       vertexPositions[ adjacent[j][1] * 3 + 1 ],
                                       vertexPositions[ adjacent[j][1] * 3 + 2 ] ] );
                var C = Vec3.create( [ vertexPositions[ adjacent[j][2] * 3 ],
                                       vertexPositions[ adjacent[j][2] * 3 + 1 ],
                                       vertexPositions[ adjacent[j][2] * 3 + 2 ] ] );

                side1 = Vec3.create( [ 0, 0, 0 ] );
                side2 = Vec3.create( [ 0, 0, 0 ] );
                vertexFaceNormal = Vec3.create( [ 0, 0, 0 ] );
                Vec3.subtract( side1, B, A );
                Vec3.subtract( side2, C, A );
                Vec3.cross( vertexFaceNormal, side1, side2 );
                Vec3.normalize( vertexFaceNormal, vertexFaceNormal );
                vertexFaceArea = getTriangleArea( A, B, C );        

                if ( mappedVertexIndex === mappedAdjacent[j][0] ) {
                    side1 = [ 0, 0, 0 ];
                    Vec3.subtract( side1, B, A );
                    side2 = [ 0, 0, 0 ];
                    Vec3.subtract( side2, C, A );
                    vertexFaceAngle = Math.acos( Vec3.dot( side1, side2 ) / ( Vec3.norm( side1 ) * Vec3.norm( side2 ) ) );
                }

                if ( mappedVertexIndex === mappedAdjacent[j][1] ) {
                    side1 = [ 0, 0, 0 ];
                    Vec3.subtract( side1, A, B );
                    side2 = [ 0, 0, 0 ];
                    Vec3.subtract( side2, C, B );
                    vertexFaceAngle = Math.acos( Vec3.dot( side1, side2 ) / ( Vec3.norm( side1 ) * Vec3.norm( side2 ) ) );
                }

                if ( mappedVertexIndex === mappedAdjacent[j][2] ) {
                    side1 = [ 0, 0, 0 ];
                    Vec3.subtract( side1, A, C );
                    side2 = [ 0, 0, 0 ];
                    Vec3.subtract( side2, B, C );
                    vertexFaceAngle = Math.acos( Vec3.dot( side1, side2 ) / ( Vec3.norm( side1 ) * Vec3.norm( side2 ) ) );
                }

                vertexFaceNormals.push( vertexFaceNormal );
                vertexFaceAreas.push( vertexFaceArea );
                vertexFaceAngles.push( vertexFaceAngle );

            }

            var vertexNormal = Vec3.create( [0, 0, 0] );

            for ( j = 0; j < vertexFaceNormals.length; j++ ) {

                // existing normal + face normal * face area * angle
                out = Vec3.create( [ 0, 0, 0 ] );
                Vec3.scale( out, faceNormals[j], vertexFaceAreas[j] );
                Vec3.scale( out, out, vertexFaceAngles[j] );
                Vec3.add( vertexNormal, vertexNormal, vertexFaceNormals[j] );

            }

            Vec3.normalize( vertexNormal, vertexNormal );

            vertexNormals[ vertexIndex * 3 ] = vertexNormal[0];
            vertexNormals[ vertexIndex * 3 + 1 ] = vertexNormal[1];
            vertexNormals[ vertexIndex * 3 + 2 ] = vertexNormal[2];

        }

    }

    */

    // Use face normals for each vertex instead

    vertexNormals = faceNormals;

    return {

        vertexIndices: vertexIndices,
        vertexPositions: vertexPositions,
        vertexNormals: vertexNormals,
        textureCoords: textureCoords,

    };

};

AssetManager.prototype.parseMtl = function( mtl, filename ) {

    'use strict';

    // Ka = ambient color
    // Kd = diffuse color
    // Ks = specular color
    // Ns = specular exponent ( 0 - 1000 )
    // Ni = optical density ???
    // d = dissolve ???

    var lines = mtl.split( '\n' ),
        lineCount = lines.length,
        i,
        line,
        ambientColor = [ 0, 0, 0 ],
        diffuseColor = [ 0, 0, 0 ],
        emissiveColor = [ 0, 0, 0 ],
        specularColor = [ 0, 0, 0 ],
        shininess = 0;

    for ( i = 0; i < lineCount; i++ ) {

        line = lines[i].split( ' ' );

        switch ( line[0] ) {

            case 'Ka':
                ambientColor = [
                                parseFloat( line[1].trim() ),
                                parseFloat( line[2].trim() ),
                                parseFloat( line[3].trim() )
                               ];
                break;
            
            case 'Kd':
                diffuseColor = [
                                parseFloat( line[1].trim() ),
                                parseFloat( line[2].trim() ),
                                parseFloat( line[3].trim() )
                               ];
                break;

            case 'Ke':
                emissiveColor = [
                                 parseFloat( line[1].trim() ),
                                 parseFloat( line[2].trim() ),
                                 parseFloat( line[3].trim() )
                                ];
                break;

            case 'Ks':
                specularColor = [
                                 parseFloat( line[1].trim() ),
                                 parseFloat( line[2].trim() ),
                                 parseFloat( line[3].trim() )
                                ];
                break;

            case 'Ns':
                shininess = parseFloat( line[1].trim() );
                break;

        }

    }

    return {
        ambientColor: ambientColor,
        diffuseColor: diffuseColor,
        emissiveColor: emissiveColor,
        specularColor: specularColor,
        shininess: shininess
    };

};