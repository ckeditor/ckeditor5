/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global requirejs, define, require, window, document, location */

'use strict';

// This file is shared by the dev and release versions of CKEditor. It bootstraps the API.

( function( root ) {
	var CKEDITOR = root.CKEDITOR = {
		/**
		 * Computes the value of the `basePath` property.
		 *
		 * @private
		 * @method
		 * @returns {String} A full URL.
		 */
		_getBasePath: getBasePath,

		/**
		 * The full URL for the CKEditor installation directory.
		 *
		 * It is possible to manually provide the base path by setting a global variable named `CKEDITOR_BASEPATH`. This
		 * global variable must be set **before** the editor script loading.
		 *
		 *		console.log( CKEDITOR.basePath ); // e.g. 'http://www.example.com/ckeditor/'
		 *
		 * @property {String}
		 */
		basePath: getBasePath(),

		/**
		 * Defines an AMD module.
		 *
		 * See https://github.com/ckeditor/ckeditor5-design/wiki/AMD for more details about our AMD API.
		 *
		 * @method
		 * @member CKEDITOR
		 */
		define: define,

		/**
		 * Retrieves one or more AMD modules.
		 *
		 * Note that the CKEditor AMD API does not download modules on demand so be sure to have their relative scripts
		 * available in the page.
		 *
		 * See https://github.com/ckeditor/ckeditor5-design/wiki/AMD for more details about our AMD API.
		 *
		 * @method
		 * @member CKEDITOR
		 */
		require: require
	};

	requirejs.config( {
		// Modules are generally relative to the core project.
		baseUrl: CKEDITOR.basePath + 'node_modules/ckeditor5-core/src/',

		// These configurations will make no difference in the build version because the following paths will be
		// already defined there.
		paths: {
			// Hide the core "ckeditor" under a different name.
			'ckeditor-core': CKEDITOR.basePath + 'node_modules/ckeditor5-core/src/ckeditor',

			// The dev version overrides for the "ckeditor" module. This is empty on release.
			'ckeditor-dev': CKEDITOR.basePath + 'src/ckeditor-dev'
		}
	} );

	// Define a new "ckeditor" module, which overrides the core one with the above and the dev stuff.
	define( 'ckeditor', [ 'ckeditor-core', 'ckeditor-dev', 'utils' ], function( core, dev, utils ) {
		utils.extend( core, root.CKEDITOR, ( dev || {} ) );
		root.CKEDITOR = core;

		return core;
	} );

	function getBasePath() {
		if ( window.CKEDITOR_BASEPATH ) {
			return window.CKEDITOR_BASEPATH;
		}

		var scripts = document.getElementsByTagName( 'script' );
		var basePathSrcPattern = /(^|.*[\\\/])ckeditor\.js(?:\?.*|;.*)?$/i;
		var path;

		// Find the first script that src matches ckeditor.js.
		[].some.call( scripts, function( script ) {
			var match = script.src.match( basePathSrcPattern );

			if ( match ) {
				path = match[ 1 ];

				return true;
			}
		} );

		if ( path.indexOf( ':/' ) == -1 && path.slice( 0, 2 ) != '//' ) {
			if ( path.indexOf( '/' ) === 0 ) {
				path = location.href.match( /^.*?:\/\/[^\/]*/ )[ 0 ] + path;
			} else {
				path = location.href.match( /^[^\?]*\/(?:)/ )[ 0 ] + path;
			}
		}

		return path;
	}
} )( window );
