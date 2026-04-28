/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/subscriptconfig
 */

/**
 * The configuration of the {@link module:basic-styles/subscript~Subscript subscript feature}.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		subscript: {
 * 			allowNesting: true
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface SubscriptConfig {

	/**
	 * Whether `subscript` and `superscript` attributes are allowed to coexist on the same text.
	 *
	 * By default this is `false`: applying subscript to text that is already superscript removes the
	 * superscript attribute (and vice versa), matching the behavior of common word processors.
	 *
	 * Set to `true` to restore the historical behavior where both attributes can be applied to the same
	 * text. This is useful for content such as isotope notation (`¹⁴₆C`) or tensor indices (`T^i_j`).
	 *
	 * The flag is symmetric with
	 * {@link module:basic-styles/superscriptconfig~SuperscriptConfig#allowNesting `config.superscript.allowNesting`}:
	 * if either is set to `true`, both commands skip the mutual-exclusion step.
	 *
	 * The flag only affects command execution. Content set through the data pipeline (for example
	 * `editor.setData( '<sub><sup>x</sup></sub>' )`) keeps both attributes regardless of this option.
	 *
	 * @default false
	 */
	allowNesting?: boolean;
}
