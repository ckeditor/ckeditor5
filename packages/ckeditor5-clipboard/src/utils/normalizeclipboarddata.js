/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/utils/normalizeclipboarddata
 */

/**
 * Removes some popular browser quirks out of the clipboard data (HTML).
 * Removes all HTML comments. These are considered an internal thing and it makes little sense if they leak into the editor data.
 *
 * @param {String} data The HTML data to normalize.
 * @returns {String} Normalized HTML.
 */
export default function normalizeClipboardData( data ) {
	return data
		.replace( /<span(?: class="Apple-converted-space"|)>(\s+)<\/span>/g, ( fullMatch, spaces ) => {
			// Handle the most popular and problematic case when even a single space becomes an nbsp;.
			// Decode those to normal spaces. Read more in https://github.com/ckeditor/ckeditor5-clipboard/issues/2.
			if ( spaces.length == 1 ) {
				return ' ';
			}

			return spaces;
		} )
		// Remove all HTML comments.
		.replace( /<!--[\s\S]*?-->/g, '' );
}
