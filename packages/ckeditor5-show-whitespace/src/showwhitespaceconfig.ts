/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module show-whitespace/showwhitespaceconfig
 */

/**
 * The configuration of the show whitespace feature.
 *
 * Controls which whitespace markers are rendered when the feature is enabled.
 * All options default to `true`.
 *
 * ```ts
 * ClassicEditor.create( element, {
 *     showWhitespace: {
 *         spaces: true,
 *         nbsp: true,
 *         tabs: true,
 *         softBreaks: true,
 *         paragraphMarks: true,
 *         trailingSpaces: true
 *     }
 * } );
 * ```
 */
export interface ShowWhitespaceConfig {

	/**
	 * Show middle dot (·) for regular space characters.
	 *
	 * @default true
	 */
	spaces?: boolean;

	/**
	 * Show open box (␣) for non-breaking space characters.
	 *
	 * @default true
	 */
	nbsp?: boolean;

	/**
	 * Show right arrow (→) for tab characters.
	 *
	 * @default true
	 */
	tabs?: boolean;

	/**
	 * Show return arrow (↵) for soft breaks (Shift+Enter).
	 *
	 * @default true
	 */
	softBreaks?: boolean;

	/**
	 * Show pilcrow (¶) at the end of block elements (paragraphs, headings, list items).
	 *
	 * @default true
	 */
	paragraphMarks?: boolean;

	/**
	 * Highlight trailing spaces (spaces at the end of a line) with a background color.
	 *
	 * @default true
	 */
	trailingSpaces?: boolean;
}
