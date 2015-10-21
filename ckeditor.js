/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global requirejs, define, require */

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
		 * The list of dependencies of **named** AMD modules created with `CKEDITOR.define`. This is mainly used to
		 * trace the dependency tree of plugins.
		 */
		_dependencies: {},

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
		 * Whether the app should work in the "debug mode" (aka "verbose mode").
		 *
		 * You can use the `CKEDITOR.isDebug` condition in order to wrap code that should be removed in the build version:
		 *
		 *		if ( CKEDITOR.isDebug ) {
		 *			if ( doSomeSuperUnnecessaryDebugChecks() ) {
		 *				throw new CKEditorError( 'sth-broke: Kaboom!' );
		 *			}
		 *		}
		 *
		 * See also {@link #isDev}.
		 *
		 * @property
		 */
		isDebug: true,

		/**
		 * Defines an AMD module.
		 *
		 * See https://github.com/ckeditor/ckeditor5-design/wiki/AMD for more details about our AMD API.
		 *
		 * @method
		 * @member CKEDITOR
		 */
		define: function( name, deps ) {
			// If this is a named module with dependencies, save this in the dependency list.
			if ( Array.isArray( deps ) && name && !this._dependencies[ name ] ) {
				this._dependencies[ name ] = deps;
			}

			return define.apply( this, arguments );
		},

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
		root.CKEDITOR = utils.extend( {}, core, root.CKEDITOR, ( dev || /* istanbul ignore next */ {} ) );

		return root.CKEDITOR;
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

		return path;
	}
} )( window );
