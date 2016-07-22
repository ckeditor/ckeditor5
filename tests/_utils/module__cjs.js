/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals require, process */

const mockery = require( 'mockery' );
mockery.enable( {
	warnOnReplace: false,
	warnOnUnregistered: false
} );
const mocked = [];

const path = require( 'path' );

/**
 * CommonJS tools related to CKEditor.
 */
const utils = {
	/**
	 * Helper for generating an absolute module path from a simplified name.
	 *
	 * Transforms:
	 *
	 * * `foo` -> `/path/dist/cjs/ckeditor5/foo/foo.js`
	 * * `foo/bar` -> `/path/dist/cjs/ckeditor5/foo/bar.js`
	 * * `/ckeditor5/foo.js` -> `/path/dist/cjs/ckeditor5/foo.js`
	 *
	 * @param {String} modulePath The simplified path.
	 * @returns {String} The real path.
	 */
	getModulePath( modulePath ) {
		// Do nothing – path is already absolute.
		if ( modulePath.startsWith( '/' ) ) {
			return path.join( process.cwd(), 'build', 'cjs', modulePath );
		}

		if ( modulePath.indexOf( '/' ) < 0 ) {
			modulePath = modulePath + '/' + modulePath;
		}

		return path.join( process.cwd(), 'build', 'cjs', 'ckeditor5', modulePath + '.js' );
	},

	/**
	 * Defines module in AMD style using CommonJS modules.
	 *
	 * This method uses {@link #getModulePath} to process module and dependency paths so you need to use
	 * the simplified notation.
	 *
	 * For simplicity the dependencies passed to the `body` will be unwrapped
	 * from the ES6 module object (so only the default export will be available). Also the returned value
	 * will be automatically handled as a default export.
	 *
	 * See also module__amd.js file description.
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

		deps = deps
			.map( ( dependency ) => utils.getModulePath( dependency ) )
			.map( ( dependency )  => {
				// Checking if module is already mocked - if module was not mocked it might be a real module.
				// Using require.resolve to check if module really exists without loading it ( it throws if module is
				// not present). When module is not mocked and does not exist it will be undefined in module body.
				try {
					if ( mocked.indexOf( dependency ) < 0 ) {
						// Test if required module exists without loading it.
						require.resolve( dependency );
					}
				} catch ( e ) {
					return;
				}

				// Return only default export.
				return require( dependency ).default;
			} );

		mocked.push( utils.getModulePath( path ) );
		mockery.registerMock( utils.getModulePath( path ), {
			default: body.apply( this, deps )
		} );
	},

	/**
	 * Gets an object which holds the CKEditor modules. This function uses synchronous CommonJS `require()`
	 * method, which means that after executing this method all modules are already loaded.
	 *
	 * This method uses {@link #getModulePath} to process module and dependency paths so you need to use
	 * the simplified notation.
	 *
	 *		const modules = amdTestUtils.require( { editor: 'core/Editor' } );
	 *
	 *		// Later on, inside tests:
	 *		const Editor = modules.editor;
	 *
	 * @params {Object} modules The object (`ref => modulePath`) with modules to be loaded.
	 * @returns {Object} The object that will hold the loaded modules.
	 */
	require( modules ) {
		const resolved = {};

		for ( let name in modules ) {
			resolved[ name ] = require( utils.getModulePath( modules[ name ] ) ).default;
		}

		return resolved;
	}
};

export default utils;
