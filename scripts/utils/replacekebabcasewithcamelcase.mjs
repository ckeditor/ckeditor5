/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Replaces all kebab-case keys in the `options` object with camelCase entries.
 * Kebab-case keys will be removed.
 *
 * @param {Object} options
 * @param {Array<string>} keys Kebab-case keys in `options` object.
 * @returns {void}
 */
export default function replaceKebabCaseWithCamelCase( options, keys ) {
	for ( const key of keys ) {
		const camelCaseKey = key.replace( /-./g, match => match[ 1 ].toUpperCase() );

		options[ camelCaseKey ] = options[ key ];
		delete options[ key ];
	}
}
