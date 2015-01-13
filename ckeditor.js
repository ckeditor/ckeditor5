/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global requirejs, define, require, window, document, location */

'use strict';

// This file is required for the development version of CKEditor only. It bootstraps the API.

( function( root ) {
	if ( root.CKEDITOR ) {
		return;
	}

	var CKEDITOR = root.CKEDITOR = {
		/**
		 * The full URL for the CKEditor installation directory.
		 *
		 * It is possible to manually provide the base path by setting a global variable named `CKEDITOR_BASEPATH`. This
		 * global variable must be set **before** the editor script loading.
		 *
		 *		alert( CKEDITOR.basePath ); // e.g. 'http://www.example.com/ckeditor/'
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
		require: require,

		// Documented in ckeditor-core/src/ckeditor.js.
		// This is the development version of this method, which overrides the default one.
		getPluginPath: function( name ) {
			return this.basePath + 'node_modules/ckeditor-plugin-' + name + '/src/';
		}
	};

	// Basic Require.js configuration for the dev version.
	requirejs.config( {
		// Modules are generally relative to the core project.
		baseUrl: CKEDITOR.basePath + 'node_modules/ckeditor5-core/src/',
		paths: {
			// Hide the core "ckeditor" under a different name.
			'ckeditor-core': CKEDITOR.basePath + 'node_modules/ckeditor5-core/src/ckeditor',

			// The RequireJS "plugin" plugin.
			'plugin': CKEDITOR.basePath + 'src/plugin',

			// Due to name conflict with the above, we have to save a reference to the core "plugin" module.
			// See src/plugin.js for more details.
			'plugin-core': CKEDITOR.basePath + 'node_modules/ckeditor5-core/src/plugin'
		}
	} );

	// Define a new "ckeditor" module, which override the core one with dev version stuff.
	define( 'ckeditor', [ 'ckeditor-core', 'utils' ], function( core, utils ) {
		utils.extend( core, root.CKEDITOR );
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
