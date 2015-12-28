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
		/**
		 * Generates an absolute path to an AMD version of a CKEditor module. The function takes care of
		 * generating a base path for that file, taking into account whether a Bender job is being run
		 * or a simple test.
		 *
		 * The name should be given in a simplified features naming convention. See {@link CKEDITOR#getModulePath}
		 * for more details.
		 *
		 * @param {String} name The name of the module.
		 * @returns {String} The absolute path to the module.
		 */
		getModulePath( name ) {
			let appBasePath = bender.basePath;
			let ckeditorBasePath = bender.config.applications.ckeditor.basePath;
			let moduleBasePath;

			// Reported: https://github.com/benderjs/benderjs/issues/248
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

			// NOTE: This code is duplicated in CKEDITOR.getModulePath() because we're not able to use here
			// that function. It may be possible to resolve this once we start using ES6 modules and transpilation
			// also for tests.
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

		/**
		 * Shorthand for defining an AMD module.
		 *
		 * Note that the module and dependency names must be passed in the simplified features naming convention
		 * (see {@link #getModulePath}).
		 *
		 * For simplicity the dependencies passed to the `body` will be unwrapped
		 * from the ES6 module object (so only the default export will be available). Also the returned value
		 * will be automatically handled as a default export.
		 *
		 * If you need to define a module which has access to other exports or can export more values,
		 * use the global `define()` function:
		 *
		 *		define( bender.amd.getModulePath( name ), [ 'exports', 'foo', ... ].map( bender.amd.getModulePath ), ( FooModule, ... ) {
		 *			const FooClass = FooModule.default;
		 *			const FooOtherProp = FooModule.otherProp;
		 *
		 *			exports.default = MyClass;
		 *			exports.otherProp = 1;
		 *		} );
		 *
		 * **Note:** Since this method automatically unwraps modules from the ES6 module object when passing them
		 * to the `body` function, circular dependencies will not work. If you need them, either use the raw `define()`
		 * as shown above, or keep all the definitions outside modules and only access the variables from the scope:
		 *
		 *		PluginE = createPlugin( 'E' );
		 *		PluginF = createPlugin( 'F' );
		 *
		 *		PluginF.requires = [ PluginE ];
		 *		PluginE.requires = [ PluginF ];
		 *
		 *		bender.amd.define( 'E', [ 'core/plugin', 'F' ], () => {
		 *			return PluginE;
		 *		} );
		 *
		 *		bender.amd.define( 'F', [ 'core/plugin', 'E' ], () => {
		 *			return PluginF;
		 *		} );
		 *
		 * @param {String} name Name of the module.
		 * @param {String[]} deps Dependencies of the module.
		 * @param {Function} body Module body.
		 */
		define( name, deps, body ) {
			if ( arguments.length == 2 ) {
				body = deps;
				deps = [];
			}

			const depsPaths = deps.map( bender.amd.getModulePath );

			// Use the exports object instead of returning from modules in order to handle circular deps.
			// http://requirejs.org/docs/api.html#circular
			depsPaths.unshift( 'exports' );

			define( bender.amd.getModulePath( name ), depsPaths, function( exports ) {
				const loadedDeps = Array.from( arguments ).slice( 1 ).map( ( module ) => module.default );

				exports.default = body.apply( this, loadedDeps );
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
			} );

			return modules;
		}
	};

	function nonEmpty( str ) {
		return !!str.length;
	}
} )();
