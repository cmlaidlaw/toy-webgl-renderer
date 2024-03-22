Entity = {};

Entity.create = function( model, position, rotation, moveVelocity ) {

    'use strict';

    return {
        model: model,
        position: position,
        rotation: rotation,
        moveVelocity: moveVelocity,
    };

};