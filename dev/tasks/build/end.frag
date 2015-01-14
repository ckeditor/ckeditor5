/************************ end.frag START */

	var CKEDITOR = require( 'ckeditor' );

	CKEDITOR._dependencyTree = dependencyTree || {};

	// Setup the AMD API to use Almond.
	CKEDITOR.define = define;
	CKEDITOR.require = require;

	return CKEDITOR;
} );
