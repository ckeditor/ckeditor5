/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/getlasttextline
 */

import type { Model, Range } from '@ckeditor/ckeditor5-engine';

/**
 * Returns the last text line from the given range.
 *
 * "The last text line" is understood as text (from one or more text nodes) which is limited either by a parent block
 * or by inline elements (e.g. `<softBreak>`).
 *
 * ```ts
 * const rangeToCheck = model.createRange(
 * 	model.createPositionAt( paragraph, 0 ),
 * 	model.createPositionAt( paragraph, 'end' )
 * );
 *
 * const { text, range } = getLastTextLine( rangeToCheck, model );
 * ```
 *
 * For model below, the returned `text` will be "Foo bar baz" and `range` will be set on whole `<paragraph>` content:
 *
 * ```xml
 * <paragraph>Foo bar baz<paragraph>
 * ```
 *
 * However, in below case, `text` will be set to "baz" and `range` will be set only on "baz".
 *
 * ```xml
 * <paragraph>Foo<softBreak></softBreak>bar<softBreak></softBreak>baz<paragraph>
 * ```
 */
export default function getLastTextLine( range: Range, model: Model ): LastTextLineData {
	let start = range.start;

	const text = Array.from( range.getItems() ).reduce( ( rangeText, node ) => {
		// Trim text to a last occurrence of an inline element and update range start.
		if ( !( node.is( '$text' ) || node.is( '$textProxy' ) ) ) {
			start = model.createPositionAfter( node );

			return '';
		}

		return rangeText + node.data;
	}, '' );

	return { text, range: model.createRange( start, range.end ) };
}

/**
 * The value returned by {@link module:typing/utils/getlasttextline~getLastTextLine}.
 */
export type LastTextLineData = {

	/**
	 * The text from the text nodes in the last text line.
	 */
	text: string;

	/**
	 * The range set on the text nodes in the last text line.
	 */
	range: Range;
};
