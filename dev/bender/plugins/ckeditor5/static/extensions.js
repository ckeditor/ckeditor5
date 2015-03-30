/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals bender, CKEDITOR */

'use strict';

( function() {
	// Make Bender wait to start running tests.
	var done = bender.defer();

	// Wait for the "ckeditor" module to be ready to start testing.
	CKEDITOR.require( [ 'ckeditor' ], done );

	/**
	 * AMD tools related to CKEditor.
	 */
	bender.amd = {
		/**
		 * Gets an object which holds the CKEditor modules guaranteed to be loaded before tests start.
		 *
		 * @params {...String} module The name of the module to load.
		 * @returns {Object} The object that will hold the loaded modules.
		 */
		require: function() {
			var modules = {};

			var done = bender.defer();

			var names = [].slice.call( arguments );

			// To avoid race conditions with required modules, require `ckeditor` first and then others. This guarantees
			// that `ckeditor` will be loaded before any other module.
			CKEDITOR.require( [ 'ckeditor' ], function() {
				CKEDITOR.require( names, function() {
					for ( var i = 0; i < names.length; i++ ) {
						modules[ names[ i ] ] = arguments[ i ] ;
					}

					// Finally give green light for tests to start.
					done();
				} );
			} );

			return modules;
		}
	};
} )();
