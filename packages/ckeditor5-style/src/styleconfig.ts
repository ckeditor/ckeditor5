/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module style/styleconfig
 */

/**
 * The configuration of the style feature.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     style: ... // Style feature config.
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface StyleConfig {

	/**
	 * The available style definitions.
	 *
	 * Style definitions are displayed in the `'style'` UI dropdown and get applied by the
	 * {@link module:style/stylecommand~StyleCommand style command} to the content of the document.
	 *
	 * In the `'style'` UI dropdown, definitions are automatically grouped into two categories based on the of the `element` property:
	 *
	 * * **Block styles**: Can be applied to entire {@link module:html-support/dataschema~DataSchema#registerBlockElement block elements}
	 * only (e.g. headings, paragraphs, divs).
	 * * **Text styles**: Can by applied to any {@link module:html-support/dataschema~DataSchema#registerInlineElement text} in any element
	 * in the document.
	 *
	 * An example configuration:
	 *
	 * ```ts
	 * [
	 *   // Definitions of block styles.
	 *   {
	 *     name: 'Red heading',
	 *     element: 'h2',
	 *     classes: [ 'red-heading' ]
	 *   },
	 *   {
	 *     name: 'Vibrant code',
	 *     element: 'pre',
	 *     classes: [ 'vibrant-code' ]
	 *   },
	 *
	 *   // Definitions of text (inline) styles.
	 *   {
	 *     name: 'Marker',
	 *     element: 'span',
	 *     classes: [ 'marker' ]
	 *   },
	 *
	 *   // ...
	 * ]
	 * ```
	 *
	 * **Note**: Configuring style definitions will automatically configure the
	 * {@glink features/html/general-html-support General HTML Support feature}. **You do not need to repeat the configuration in
	 * {@link module:html-support/generalhtmlsupportconfig~GeneralHtmlSupportConfig}**.
	 */
	definitions?: Array<StyleDefinition>;
}

/**
 * Style definition.
 *
 * An object describing a style definition. It contains the style `name`, `element` name and an array of CSS `classes`.
 *
 * ```ts
 * // This style will create <h2 class="foo">...</h2> in the document data.
 * {
 *   name: 'Example style',
 *   element: 'h2',
 *   classes: [ 'foo' ]
 * }
 * ```
 */
export interface StyleDefinition {
	name: string;
	element: string;
	classes: Array<string>;
}
