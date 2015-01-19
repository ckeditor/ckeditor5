/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

// This is the code that will precede the compiled source code in the ckeditor.js build.
//
// The following are the parts that compose the build:
//
//  * start.frag
//  * Almond.js source code
//  * CKEditor source code
//  * end.frag

( function( root, factory ) {
	// Register the CKEDITOR global.
	root.CKEDITOR = factory();

	// Make the build an AMD module.
	// https://github.com/amdjs/amdjs-api/wiki/AMD#defineamd-property-
	if ( typeof define == 'function' && define.amd ) {
		define( function() {
			return root.CKEDITOR;
		} );
	}
} )( this, function() {

/************************ start.frag END */
