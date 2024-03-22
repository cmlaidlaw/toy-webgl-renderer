function handleInput() {

    'use strict';

    var position = Vec3.create(),
        rotation = Vec3.create(),
        camera = true;

    if ( keysDown[ LEFT_ARROW ] ) {
        if ( camera ) {
            rotation[1] -= ( Math.PI / 180 ) * 5;
        } else {
            position[0] -= 0.5;
        }
    }

    if ( keysDown[ UP_ARROW ] ) {
        if ( camera ) {
            position[0] += Math.sin( CAMERA.rotation[1] ) * 0.25;
            position[2] -= Math.cos( CAMERA.rotation[1] ) * 0.25;
        } else {
            position[2] -= 0.5;
        }
    }

    if ( keysDown[ RIGHT_ARROW ] ) {
        if ( camera ) {
            rotation[1] += ( Math.PI / 180 ) * 5;
        } else {
            position[0] += 0.5;
        }
    }

    if ( keysDown[ DOWN_ARROW ] ) {
        if ( camera ) {
            position[0] -= Math.sin( CAMERA.rotation[1] ) * 0.25;
            position[2] += Math.cos( CAMERA.rotation[1] ) * 0.25;
        } else {
            position[2] += 0.5;
        }
    }

    if ( keysDown[ PLUS ] ) {
        position[1] += 0.5;
    }

    if ( keysDown[ MINUS ] ) {
        position[1] -= 0.5;
    }

    if ( keysDown[ OPEN_BRACKET ] ) {
        rotation[1] += ( Math.PI / 180 ) * 1;
    }

    if ( keysDown[ CLOSE_BRACKET ] ) {
        rotation[1] -= ( Math.PI / 180 ) * 1;
    }

    if ( keysDown[ SEMI_COLON ] ) {
        rotation[2] += ( Math.PI / 180 ) * 1;
    }

    if ( keysDown[ SINGLE_QUOTE ] ) {
        rotation[2] -= ( Math.PI / 180 ) * 1;
    }

    if ( position[0] !== 0
         || position[1] !== 0
         || position[2] !== 0 ) {

        if ( camera ) {

            CAMERA.position[0] += position[0];
            CAMERA.position[1] += position[1];
            CAMERA.position[2] += position[2];
        } else {

           lightPointPositions[0] += position[0];
           lightPointPositions[1] += position[1];
           lightPointPositions[2] += position[2];
            PLAYER.position[0] += position[0];
            PLAYER.position[1] += position[1];
            PLAYER.position[2] += position[2];
        }

    }

    if ( rotation[0] !== 0
         || rotation[1] !== 0
         || rotation[2] !== 0 ) {

        if ( camera ) {

            CAMERA.rotation[0] += rotation[0];
            CAMERA.rotation[1] += rotation[1];
            CAMERA.rotation[2] += rotation[2];

        } else {

            PLAYER.rotation[0] += rotation[0];
            PLAYER.rotation[1] += rotation[1];
            PLAYER.rotation[2] += rotation[2];        

        }

    }

};