/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint node: false, browser: true, globalstrict: true */
/* globals bender, require */

'use strict';

( () => {
	const basePath = bender.config.applications.ckeditor.basePath;

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
		require() {
			const modules = {};
			const done = bender.defer();

			const names = Array.from( arguments );
			const modulePaths = names.map( ( name ) => {
				// Add the prefix to shortened paths like `core/editor` (will be `ckeditor5-core/editor`).
				// Don't add the prefix to the main file and files frok ckeditor5/ module.
				if ( name != 'ckeditor' && !( /^ckeditor5\//.test( name ) ) ) {
					name = 'ckeditor5-' + name;
				}

				return basePath + name + '.js';
			} );

			require( modulePaths, function() {
				for ( let i = 0; i < names.length; i++ ) {
					modules[ names[ i ] ] = arguments[ i ].default;
				}

				// Finally give green light for tests to start.
				done();
			} );

			return modules;
		}
	};
} )();
