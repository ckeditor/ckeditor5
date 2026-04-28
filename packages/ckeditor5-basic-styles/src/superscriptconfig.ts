/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/superscriptconfig
 */

/**
 * The configuration of the {@link module:basic-styles/superscript~Superscript superscript feature}.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		superscript: {
 * 			allowNesting: true
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface SuperscriptConfig {

	/**
	 * Whether `superscript` and `subscript` attributes are allowed to coexist on the same text.
	 *
	 * By default this is `false`: applying superscript to text that is already subscript removes the
	 * subscript attribute (and vice versa), matching the behavior of common word processors.
	 *
	 * Set to `true` to restore the historical behavior where both attributes can be applied to the same
	 * text. This is useful for content such as isotope notation (`¹⁴₆C`) or tensor indices (`T^i_j`).
	 *
	 * The flag is symmetric with
	 * {@link module:basic-styles/subscriptconfig~SubscriptConfig#allowNesting `config.subscript.allowNesting`}:
	 * if either is set to `true`, both commands skip the mutual-exclusion step.
	 *
	 * The flag only affects command execution. Content set through the data pipeline (for example
	 * `editor.setData( '<sub><sup>x</sup></sub>' )`) keeps both attributes regardless of this option.
	 *
	 * @default false
	 */
	allowNesting?: boolean;
}
