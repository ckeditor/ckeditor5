( function ( root, factory ) {
	// Register the CKEDITOR global.
	root.CKEDITOR = factory();

	// Make the build an AMD module.
	if ( typeof define == 'function' && define.amd ) {
		define( [], function() {
			return root.CKEDITOR;
		} );
	}
} )( this, function () {

/************************ start.frag END */
