/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console */

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
 *			removeItems: [ 'bold' ],
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
			items: config,
			removeItems: []
		};
	}

	if ( !config ) {
		return {
			items: [],
			removeItems: []
		};
	}

	if ( Object.prototype.hasOwnProperty.call( config, 'viewportTopOffset' ) ) {
		console.warn(
			'The `toolbar.vieportTopOffset` configuration option is deprecated.' +
			'It will be removed from future CKEditor versions. Use `ui.viewportOffset.top` instead.'
		);
	}

	return Object.assign( {
		items: [],
		removeItems: []
	}, config );
}
