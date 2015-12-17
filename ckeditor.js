/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

// This file is shared by the dev and release versions of CKEditor. It bootstraps the API.

import CKEDITOR_CORE from './ckeditor5-core/ckeditor.js';
import utilsObject from './ckeditor5-core/lib/lodash/object.js';

const CKEDITOR = {
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
	 * Whether the app should work in the "debug mode" (aka "verbose mode").
	 *
	 * You can use the `CKEDITOR.isDebug` condition in order to wrap code that should be removed in the build version:
	 *
	 *		if ( CKEDITOR.isDebug ) {
	 *			if ( doSomeSuperUnnecessaryDebugChecks() ) {
	 *				throw new CKEditorError( 'sth-broke: Kaboom!' );
	 *			}
	 *		}
	 *
	 * See also {@link #isDev}.
	 *
	 * @readonly
	 */
	isDebug: true,

	/**
	 * A flag specifying whether CKEditor is running in development mode (original source code).
	 *
	 * This property is not defined in production (compiled, build code).
	 *
	 * See also {@link #isDebug}.
	 *
	 * @readonly
	 */
	isDev: true,

	/**
	 * Computes the value of the `basePath` property.
	 *
	 * @private
	 * @method
	 * @returns {String} A full URL.
	 */
	_getBasePath: getBasePath
};

utilsObject.extend( CKEDITOR, CKEDITOR_CORE );

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

export default CKEDITOR;
