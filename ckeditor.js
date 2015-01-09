/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global requirejs, define, require, window */

'use strict';

// Basic Require.js configuration.
requirejs.config( {
	// Modules are generally relative to the core project.
	baseUrl: '../node_modules/ckeditor-core/src/'
} );

( function( root ) {
	if ( root.CKEDITOR ) {
		return;
	}

	/**
	 * The API entry point. It exposes the basic features necessary to integrate and extend CKEditor.
	 * @class CKEDITOR
	 * @singleton
	 */
	var CKEDITOR = root.CKEDITOR = {};

	/**
	 * Defines an AMD module.
	 *
	 * See https://github.com/ckeditor/ckeditor5-design/wiki/AMD for more details about our AMD API.
	 */
	CKEDITOR.define = CKEDITOR.define || define;

	/**
	 * Retrieves one or more AMD modules. Note that the CKEditor AMD API doesn't download modules on demand so be sure
	 * to have their relative scripts available in the page.
	 *
	 * See https://github.com/ckeditor/ckeditor5-design/wiki/AMD for more details about our AMD API.
	 */
	CKEDITOR.require = CKEDITOR.require || require;
} )( window );
