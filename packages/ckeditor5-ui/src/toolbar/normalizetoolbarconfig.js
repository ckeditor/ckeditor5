/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/toolbar/normalizetoolbarconfig
 */

/**
 * Normalizes the toolbar configuration (`config.toolbar`), which:
 *
 * * may be defined as an `Array`:
 *
 * 		toolbar: [ 'heading', 'bold', 'italic', 'link', ... ]
 *
 * * or an `Object`:
 *
 *		toolbar: {
 *			items: [ 'heading', 'bold', 'italic', 'link', ... ],
 *			...
 *		}
 *
 * * or may not be defined at all (`undefined`)
 *
 * and returns it in the object form.
 *
 * @param {Array|Object|undefined} config The value of `config.toolbar`.
 * @returns {Object} A normalized toolbar config object.
 */
export default function normalizeToolbarConfig( config ) {
	if ( Array.isArray( config ) ) {
		return {
			items: config
		};
	}

	if ( !config ) {
		return {
			items: []
		};
	}

	return Object.assign( {
		items: []
	}, config );
}
