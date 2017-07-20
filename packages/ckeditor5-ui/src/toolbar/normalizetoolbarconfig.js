/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/toolbar/normalizetoolbarconfig
 */

/**
 * Normalizes the toolbar configuration (`config.toolbar`), which may be defined as an `Array`
 *
 * 		toolbar: [ 'headings', 'bold', 'italic', 'link', 'unlink', ... ]
 *
 * or an `Object`
 *
 *		toolbar: {
 *			items: [ 'headings', 'bold', 'italic', 'link', 'unlink', ... ],
 *			...
 *		}
 *
 * and returns it in the object form.
 *
 * @param {Array|Object} config The value of `config.toolbar`.
 * @returns {Object} A normalized toolbar config object.
 */
export default function normalizeToolbarConfig( config ) {
	if ( config instanceof Array ) {
		config = {
			items: config
		};
	}

	return config;
}
