/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint node: false, browser: true, globalstrict: true */
/* globals bender, require, define */

'use strict';

( () => {
	/**
	 * AMD tools related to CKEditor.
	 */
	bender.amd = {
		getModulePath( name ) {
			let appBasePath = bender.basePath;
			let ckeditorBasePath = bender.config.applications.ckeditor.basePath;
			let moduleBasePath;

			// Ugh... make some paths cleanup, because we need to combine these fragments and we don't want to
			// duplicate '/'. BTW. if you want to touch this make sure you haven't broken Bender jobs which
			// have different bender.basePaths (no trailing '/', unnecessary 'tests/' fragment).
			moduleBasePath =
				appBasePath
					.split( '/' )
					.filter( nonEmpty )
					// When running a job we need to drop the last parth of the base path, which is "tests".
					.slice( 0, -1 )
					.concat(
						ckeditorBasePath.split( '/' ).filter( nonEmpty )
					)
					.join( '/' );

			if ( name != 'ckeditor' ) {
				// Resolve shortened feature names to `featureName/featureName`.
				if ( name.indexOf( '/' ) < 0 ) {
					name = name + '/' + name;
				}

				// Add the prefix to shortened paths like `core/editor` (will be `ckeditor5-core/editor`).
				// Don't add the prefix to the main file and files frok ckeditor5/ module.
				if ( !( /^ckeditor5\//.test( name ) ) ) {
					name = 'ckeditor5-' + name;
				}
			}

			return '/' + moduleBasePath + '/' + name + '.js';
		},

		define( name, deps, body ) {
			if ( arguments.length == 2 ) {
				body = deps;
				deps = [];
			}

			const depsPaths = deps.map( bender.amd.getModulePath );

			define( bender.amd.getModulePath( name ), depsPaths, function() {
				const loadedDeps = Array.from( arguments ).map( ( module ) => module.default );

				return {
					default: body.apply( this, loadedDeps )
				};
			} );
		},

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
			const modulePaths = names.map( bender.amd.getModulePath );

			require( modulePaths, function() {
				for ( let i = 0; i < names.length; i++ ) {
					modules[ names[ i ] ] = arguments[ i ].default;
				}

				// Finally give green light for tests to start.
				done();
			}/*, ( err ) => {
				debugger;
			}*/ );

			return modules;
		}
	};

	function nonEmpty( str ) {
		return !!str.length;
	}
} )();
