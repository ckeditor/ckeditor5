/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = {
	/**
	 * The full URL for the CKEditor installation directory.
	 *
	 * It is possible to manually provide the base path by setting a global variable named `CKEDITOR_BASEPATH`. This
	 * global variable must be set **before** the editor script loading.
	 *
	 *		console.log( CKEDITOR.basePath ); // e.g. 'http://www.example.com/ckeditor/'
	 *
	 * @readonly
	 * @property {String}
	 */
	basePath: getBasePath(),

	/**
	 * Resolves a simplified module name convention to a real path. The returned
	 * paths are relative to the main `ckeditor.js` file, but they do not start with `./`.
	 *
	 * For instance:
	 *
	 * * `foo` will be transformed to `ckeditor5-foo/foo.js`,
	 * * `ckeditor` to `ckeditor.js`,
	 * * `core/editor` to `ckeditor5-core/editor.js` and
	 * * `foo/bar/bom` to `ckeditor5-foo/bar/bom.js`.
	 *
	 * @param {String} name
	 * @returns {String} Path to the module.
	 */
	getModulePath( name ) {
		//
		// Note: This piece of code is duplicated in bender.amd.getModulePath().
		//

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

		return name + '.js';
	},

	/**
	 * Computes the value of the `basePath` property.
	 *
	 * @private
	 * @method
	 * @returns {String} A full URL.
	 */
	_getBasePath: getBasePath
};

function getBasePath() {
	if ( window.CKEDITOR_BASEPATH ) {
		return window.CKEDITOR_BASEPATH;
	}

	const scripts = document.getElementsByTagName( 'script' );
	const basePathSrcPattern = /(^|.*[\\\/])ckeditor\.js(?:\?.*|;.*)?$/i;
	let path;

	// Find the first script that src matches ckeditor.js.
	Array.from( scripts ).some( ( script ) => {
		const match = script.src.match( basePathSrcPattern );

		if ( match ) {
			path = match[ 1 ];

			return true;
		}
	} );

	return path;
}

export default path;