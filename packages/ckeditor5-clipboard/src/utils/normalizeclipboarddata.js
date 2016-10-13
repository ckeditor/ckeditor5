/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Removes some popular browser quirks out of the clipboard data (HTML).
 *
 * @param {String} data The HTML data to normalize.
 * @returns {String} Normalized HTML.
 */
export default function normalizeClipboardData( data ) {
	return data
		.replace( /<span class="Apple-converted-space">(\s+)<\/span>/, '$1' );
}
