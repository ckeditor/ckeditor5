/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

// We import the 'require' module, so Require.JS gives us a localized version of require().
// Otherwise we would use the global one which resolves paths relatively to the base dir.
import require from 'require';

/**
 * Loads a module.
 *
 *		load( 'ckeditor5/editor.js' )
 *			.then( ( EditorModule ) => {
 *				const Editor = EditorModule.default;
 *			} );
 *
 * @param {String} modulePath Path to the module, relative to `ckeditor.js`'s parent directory (the root).
 * @returns {Promise}
 */
export default function load( modulePath ) {
	modulePath = '../' + modulePath;

	return new Promise( ( resolve, reject ) => {
		require(
			[ modulePath ],
			( module ) => {
				resolve( module );
			},
			( err ) => {
				reject( err );
			}
		);
	} );
}
