/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = {
	/**
	 * TODO: review whether this property is needed https://github.com/ckeditor/ckeditor5/issues/61.
	 *
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
