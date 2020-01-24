/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

/**
 * Loads a predefined set of performance markup files.
 *
 *		loadPerformanceData()
 *			.then( fixtures => {
 *				window.editor.setData( fixtures.small );
 *			} );
 *
 * @returns {Promise.<Object.<String, String>>}
 */
export function loadPerformanceData() {
	return Promise.all( [ getFileContents( 'small' ), getFileContents( 'medium' ), getFileContents( 'large' ) ] )
		.then( responses => {
			return {
				small: responses[ 0 ],
				medium: responses[ 1 ],
				large: responses[ 2 ]
			};
		} );

	function getFileContents( fileName ) {
		return window.fetch( `_utils/${ fileName }.txt` )
			.then( resp => resp.text() );
	}
}
