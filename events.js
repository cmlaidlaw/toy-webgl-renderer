document.addEventListener( 'keydown', function( e ) {
    var charCode = e.charCode || e.keyCode;
    keysDown[charCode] = true;
} );

document.addEventListener( 'keyup', function( e ) {
    var charCode = e.charCode || e.keyCode;
    keysDown[charCode] = false;
} );