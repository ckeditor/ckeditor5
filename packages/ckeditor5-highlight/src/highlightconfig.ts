/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module highlight/highlightconfig
 */

/**
 * The highlight option descriptor. See {@link module:highlight/highlightconfig~HighlightConfig} to learn more.
 *
 * ```ts
 * {
 * 	model: 'pinkMarker',
 * 	class: 'marker-pink',
 * 	title: 'Pink Marker',
 * 	color: 'var(--ck-highlight-marker-pink)',
 * 	type: 'marker'
 * }
 * ```
 */
export interface HighlightOption {

	/**
	 * The user-readable title of the option.
	 */
	title: string;

	/**
	 * The unique attribute value in the model.
	 */
	model: string;

	/**
	 * The CSS `var()` used for the highlighter. The color is used in the user interface to represent the highlighter.
	 * There is a possibility to use the default color format like rgb, hex or hsl, but you need to care about the color of `<mark>`
	 * by adding CSS classes definition.
	 */
	color: string;

	/**
	 * The CSS class used on the `<mark>` element in the view. It should match the `color` setting.
	 */
	class: string;

	/**
	 * The type of highlighter:
	 *
	 * * `'marker'` &ndash; Uses the `color` as the `background-color` style,
	 * * `'pen'` &ndash; Uses the `color` as the font `color` style.
	 */
	type: 'marker' | 'pen';
}

/**
 * The configuration of the {@link module:highlight/highlight~Highlight highlight feature}.
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		highlight:  ... // Highlight feature configuration.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface HighlightConfig {

	/**
	 * The available highlight options. The default value is:
	 * ```ts
	 * options: [
	 * 	{
	 * 		model: 'yellowMarker',
	 * 		class: 'marker-yellow',
	 * 		title: 'Yellow marker',
	 * 		color: 'var(--ck-highlight-marker-yellow)',
	 * 		type: 'marker'
	 * 	},
	 * 	{
	 * 		model: 'greenMarker',
	 * 		class: 'marker-green',
	 * 		title: 'Green marker',
	 * 		color: 'var(--ck-highlight-marker-green)',
	 * 		type: 'marker'
	 * 	},
	 * 	{
	 * 		model: 'pinkMarker',
	 * 		class: 'marker-pink',
	 * 		title: 'Pink marker',
	 * 		color: 'var(--ck-highlight-marker-pink)',
	 * 		type: 'marker'
	 * 	},
	 * 	{
	 * 		model: 'blueMarker',
	 * 		class: 'marker-blue',
	 * 		title: 'Blue marker',
	 * 		color: 'var(--ck-highlight-marker-blue)',
	 * 		type: 'marker'
	 * 	},
	 * 	{
	 * 		model: 'redPen',
	 * 		class: 'pen-red',
	 * 		title: 'Red pen',
	 * 		color: 'var(--ck-highlight-pen-red)',
	 * 		type: 'pen'
	 * 	},
	 * 	{
	 * 		model: 'greenPen',
	 * 		class: 'pen-green',
	 * 		title: 'Green pen',
	 * 		color: 'var(--ck-highlight-pen-green)',
	 * 		type: 'pen'
	 * 	}
	 * ]
	 * ```
	 *
	 * There are two types of highlighters available:
	 *
	 * * `'marker'` &ndash; Rendered as a `<mark>` element, styled with the `background-color`.
	 * * `'pen'` &ndash; Rendered as a `<mark>` element, styled with the font `color`.
	 *
	 * **Note**: The highlight feature provides a stylesheet with the CSS classes and corresponding colors defined
	 * as CSS variables.
	 *
	 * ```css
	 * :root {
	 * 	--ck-highlight-marker-yellow: #fdfd77;
	 * 	--ck-highlight-marker-green: #63f963;
	 * 	--ck-highlight-marker-pink: #fc7999;
	 * 	--ck-highlight-marker-blue: #72cdfd;
	 * 	--ck-highlight-pen-red: #e91313;
	 * 	--ck-highlight-pen-green: #118800;
	 * }
	 *
	 * .marker-yellow { ... }
	 * .marker-green { ... }
	 * .marker-pink { ... }
	 * .marker-blue { ... }
	 * .pen-red { ... }
	 * .pen-green { ... }
	 * ```
	 *
	 * It is possible to define the `color` property directly as `rgba(R, G, B, A)`,
	 * `#RRGGBB[AA]` or `hsla(H, S, L, A)`. In such situation, the color will **only** apply to the UI of
	 * the editor and the `<mark>` elements in the content must be styled by custom classes provided by
	 * a dedicated stylesheet.
	 *
	 * **Note**: It is recommended for the `color` property to correspond to the class in the content
	 * stylesheet because it represents the highlighter in the user interface of the editor.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		highlight: {
	 * 			options: [
	 * 				{
	 * 					model: 'pinkMarker',
	 * 					class: 'marker-pink',
	 * 					title: 'Pink Marker',
	 * 					color: 'var(--ck-highlight-marker-pink)',
	 * 					type: 'marker'
	 * 				},
	 * 				{
	 * 					model: 'redPen',
	 * 					class: 'pen-red',
	 * 					title: 'Red Pen',
	 * 					color: 'var(--ck-highlight-pen-red)',
	 * 					type: 'pen'
	 * 				},
	 * 			]
	 * 		}
	 * } )
	 * .then( ... )
	 * .catch( ... );
	 * ```
	 */
	options: Array<HighlightOption>;
}
