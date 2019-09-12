/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/getlasttextline
 */

/**
 * Returns the last text line from the given range.
 *
 * "The last text line" is understood as text (from one or more text nodes) which is limited either by a parent block
 * or by inline elements (e.g. `<softBreak>`).
 *
 * This method can be used to evaluate text from a block in which user sets cursor:
 *
 *		const selection = model.document.selection;
 *
 *		// Evaluate text in from selection parent up to the cursor:
 *		const rangeToCheck = model.createRange(
 *			model.createPositionAt( paragraph, 0 ),
 *			model.createPositionAt( paragraph, 'end' )
 *		);
 *
 *		const { text, range } = getLastTextLine( range, model );
 *
 * The returned text will consist "Foo bar baz" for a model below:
 *
 *		<paragraph>Foo bar baz<paragraph>
 *
 * However, it will return only "baz" if there's a `<softBreak>` before "baz" text node:
 *
 *		<paragraph>Foo<softBreak>bar<softBreak>baz<paragraph>
 *
 * In the above example `range` will be set only "baz".
 *
 * @protected
 * @param {module:engine/model/range~Range} range
 * @param {module:engine/model/model~Model} model
 * @returns {module:typing/utils/getlasttextline~LastTextLineData}
 */
export default function getLastTextLine( range, model ) {
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

/**
 * The value returned by {@link module:typing/utils/getlasttextline~getLastTextLine}.
 *
 * @typedef {Object} module:typing/utils/getlasttextline~LastTextLineData
 *
 * @property {String} text The text from the text nodes in the last text line.
 * @property {module:engine/model/range~Range} range The range set on the text nodes in the last text line.
 */
