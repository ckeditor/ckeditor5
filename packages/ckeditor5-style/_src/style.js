/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/style
 */

import { Plugin } from 'ckeditor5/src/core';

import StyleUI from './styleui';
import StyleEditing from './styleediting';

/**
 * The style plugin.
 *
 * This is a "glue" plugin that loads the {@link module:style/styleediting~StyleEditing style editing feature}
 * and {@link module:style/styleui~StyleUI style UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Style extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Style';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ StyleEditing, StyleUI ];
	}
}

/**
 * The configuration of the {@link module:style/style~Style} feature.
 *
 * Read more in {@link module:style/style~StyleConfig}.
 *
 * @member {module:style/style~StyleConfig} module:core/editor/editorconfig~EditorConfig#style
 */

/**
 * The configuration of the style feature.
 *
 *		ClassicEditor
 *			.create( {
 * 				style: ... // Style feature config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface StyleConfig
 */

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
 *		[
 *			// Definitions of block styles.
 *			{
 *				name: 'Red heading',
 *				element: 'h2',
 *				classes: [ 'red-heading' ]
 *			},
 *			{
 *				name: 'Vibrant code',
 *				element: 'pre',
 *				classes: [ 'vibrant-code' ]
 *			},
 *
 *			// Definitions of text (inline) styles.
 *			{
 *				name: 'Marker',
 *				element: 'span',
 *				classes: [ 'marker' ]
 *			},
 *			// ...
 *		]
 *
 * **Note**: Configuring style definitions will automatically configure the
 * {@glink features/general-html-support General HTML Support feature}. **You do not need to repeat the configuration in
 * {@link module:html-support/generalhtmlsupport~GeneralHtmlSupportConfig}**.
 *
 * @member {Array.<module:style/style~StyleDefinition>} module:style/style~StyleConfig#definitions
 */

/**
 * Style definition.
 *
 * An object describing a style definition. It contains the style `name`, `element` name and an array of CSS `classes`.
 *
 *		// This style will create <h2 class="foo">...</h2> in the document data.
 *		{
 *			name: 'Example style',
 *			element: 'h2',
 *			classes: [ 'foo' ]
 *		}
 *
 * @typedef {Object} module:style/style~StyleDefinition
 */
