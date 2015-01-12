/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global requirejs, define, require, window */

'use strict';

// This file is required for the development version of CKEditor only. It bootstraps the API.

// Basic Require.js configuration.
requirejs.config( {
	// Modules are generally relative to the core project.
	baseUrl: '../node_modules/ckeditor-core/src/',
	paths: {
		// The RequireJS "plugin" plugin.
		plugin: '../src/plugin'
	}
} );

( function( root ) {
	if ( root.CKEDITOR ) {
		return;
	}

	root.CKEDITOR = {
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
			return CKEDITOR.basePath + 'node_modules/ckeditor-plugin-' + name + '/src/';
		}
	};

	// Load the core CKEDITOR object and extend/override some of its methods with the above.
	require( [ 'ckeditor', 'tools/utils' ], function( CKEDITOR, utils ) {
		utils.extend( CKEDITOR, root.CKEDITOR );
		root.CKEDITOR = CKEDITOR;
	} );
} )( window );
