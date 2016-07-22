/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals bender, define, require */

/**
 * AMD tools related to CKEditor.
 */
const utils = {
	/**
	 * Helper for generating a full module path from a simplified name (similar to simplified plugin naming convention).
	 *
	 * Transforms:
	 *
	 * * `foo/bar` -> `/ckeditor5/foo/bar.js`
	 *
	 * If the path is already absolute, then it will be returned without any changes.
	 *
	 * @param {String} modulePath The simplified path.
	 * @returns {String} The real path.
	 */
	getModulePath( modulePath ) {
		// Do nothing – path is already absolute.
		if ( modulePath.startsWith( '/' ) ) {
			return modulePath;
		}

		return '/ckeditor5/' + modulePath + '.js';
	},

	/**
	 * Shorthand for defining an AMD module.
	 *
	 * This method uses {@link #getModulePath} to process module and dependency paths so you need to use
	 * the simplified notation.
	 *
	 * For simplicity the dependencies passed to the `body` will be unwrapped
	 * from the ES6 module object (so only the default export will be available). Also the returned value
	 * will be automatically handled as a default export.
	 *
	 * If you need to define a module which has access to other exports or can export more values,
	 * use the global `define()` function:
	 *
	 *		define( 'my/module', [ 'exports', 'foo', ... ], ( FooModule, ... ) {
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
	 *		amdTestUtils.define( 'E/E', [ 'plugin', 'F/F' ], () => {
	 *			return PluginE;
	 *		} );
	 *
	 *		amdTestUtils.define( 'F/F', [ 'plugin', 'E/E' ], () => {
	 *			return PluginF;
	 *		} );
	 *
	 * @param {String} path Path to the module.
	 * @param {String[]} deps Dependencies of the module.
	 * @param {Function} body Module body.
	 */
	define( path, deps, body ) {
		if ( arguments.length == 2 ) {
			body = deps;
			deps = [];
		}

		deps = deps.map( utils.getModulePath );

		// Use the exports object instead of returning from modules in order to handle circular deps.
		// http://requirejs.org/docs/api.html#circular
		deps.unshift( 'exports' );

		define( utils.getModulePath( path ), deps, function( exports ) {
			const loadedDeps = Array.from( arguments ).slice( 1 ).map( ( module ) => module.default );

			exports.default = body.apply( this, loadedDeps );
		} );
	},

	/**
	 * Gets an object which holds the CKEditor modules guaranteed to be loaded before tests start.
	 *
	 * This method uses {@link #getModulePath} to process module and dependency paths so you need to use
	 * the simplified notation.
	 *
	 *		const modules = amdTestUtils.require( { modelDocument: 'engine/model/document' } );
	 *
	 *		// Later on, inside tests:
	 *		const ModelDocument = modules.modelDocument;
	 *
	 * @params {Object} modules The object (`ref => modulePath`) with modules to be loaded.
	 * @returns {Object} The object that will hold the loaded modules.
	 */
	require( modules ) {
		const resolved = {};
		const paths = [];
		const names = [];
		const done = bender.defer();

		for ( let name in modules ) {
			names.push( name );
			paths.push( utils.getModulePath( modules[ name ] ) );
		}

		require( paths, function( ...loaded ) {
			for ( let i = 0; i < names.length; i++ ) {
				resolved[ names[ i ] ] = loaded[ i ].default;
			}

			// Finally give green light for tests to start.
			done();
		} );

		return resolved;
	}
};

export default utils;
