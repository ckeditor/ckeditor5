/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/gettext
 */

/**
 * Returns the whole text from a given range by adding all data from the text nodes together.
 *
 * **Note** The text is trimmed to the last occurrence of any inline element (e.g. `<softBreak>`).
 *
 * @protected
 * @param {module:engine/model/range~Range} range
 * @param {module:engine/model/model~Model} model
 * @returns {Object}
 */
export default function getText( range, model ) {
	let start = range.start;

	const text = Array.from( range.getItems() ).reduce( ( rangeText, node ) => {
		// Trim text to a last occurrence of an inline element and update range start.
		if ( !( node.is( 'text' ) || node.is( 'textProxy' ) ) ) {
			start = model.createPositionAfter( node );

			return '';
		}

		return rangeText + node.data;
	}, '' );

	return { text, range: model.createRange( start, range.end ) };
}

