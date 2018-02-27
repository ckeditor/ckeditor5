/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlight
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import HighlightEditing from './highlightediting';
import HighlightUI from './highlightui';

/**
 * The highlight plugin.
 *
 * It loads the {@link module:highlight/highlightediting~HighlightEditing} and
 * {@link module:highlight/highlightui~HighlightUI} plugins.
 *
 * Read more about the feature in the {@glink api/highlight highlight package} page.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Highlight extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HighlightEditing, HighlightUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Highlight';
	}
}

/**
 * The highlight option descriptor. See the {@link module:highlight/highlight~HighlightConfig} to learn more.
 *
 *		{
 *			model: 'pinkMarker',
 *			class: 'marker-pink',
 *			title: 'Pink Marker',
 *			color: 'var(--ck-highlight-marker-pink)',
 *			type: 'marker'
 *		}
 *
 * @typedef {Object} module:highlight/highlight~HighlightOption
 * @property {String} title The user-readable title of the option.
 * @property {String} model The unique attribute value in the model.
 * @property {String} color The CSS var() used for the highlighter. The color is used in the user interface to represent the highlighter.
 * There is possibility to use default color format like rgb, hex or hsl, but you need to care about color of `<mark>`
 * by adding CSS classes definition.
 * @property {String} class The CSS class used on the `<mark>` element in the view. It should match the `color` setting.
 * @property {'marker'|'pen'} type The type of highlighter:
 * - `'marker'` – uses the `color` as a `background-color` style,
 * - `'pen'` – uses the `color` as a font `color` style.
 */

/**
 * The configuration of the {@link module:highlight/highlight~Highlight} feature.
 *
 * Read more in {@link module:highlight/highlight~HighlightConfig}.
 *
 * @member {module:highlight/highlight~HighlightConfig} module:core/editor/editorconfig~EditorConfig#highlight
 */

/**
 * The configuration of the {@link module:highlight/highlight~Highlight Highlight feature}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				highlight:  ... // Highlight feature config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface HighlightConfig
 */

/**
 * The available highlighters options. The default value is:
 *
 *		options: [
 *			{
 *				model: 'yellowMarker',
 *				class: 'marker-yellow',
 *				title: 'Yellow marker',
 *				color: 'var(--ck-highlight-marker-yellow)',
 *				type: 'marker'
 *			},
 *			{
 *				model: 'greenMarker',
 *				class: 'marker-green',
 *				title: 'Green marker',
 *				color: 'var(--ck-highlight-marker-green)',
 *				type: 'marker'
 *			},
 *			{
 *				model: 'pinkMarker',
 *				class: 'marker-pink',
 *				title: 'Pink marker',
 *				color: 'var(--ck-highlight-marker-pink)',
 *				type: 'marker'
 *			},
 *			{
 *				model: 'blueMarker',
 *				class: 'marker-blue',
 *				title: 'Blue marker',
 *				color: 'var(--ck-highlight-marker-blue)',
 *				type: 'marker'
 *			},
 *			{
 *				model: 'redPen',
 *				class: 'pen-red',
 *				title: 'Red pen',
 *				color: 'var(--ck-highlight-pen-red)',
 *				type: 'pen'
 *			},
 *			{
 *				model: 'greenPen',
 *				class: 'pen-green',
 *				title: 'Green pen',
 *				color: 'var(--ck-highlight-pen-green)',
 *				type: 'pen'
 *			}
 *		]
 *
 * There are two types of highlighters available:
 * - `'marker'` - rendered as a `<mark>` element, styled with the `background-color`,
 * - `'pen'` - rendered as a `<mark>` element, styled with the font `color`.
 *
 * **Note**: A stylesheet with CSS classes is required for the configuration to work properly thanks to CSS Variables.
 * The highlight feature provides actual stylesheet with default colors. There is possibility to use default color format
 * like rgb, hex or hsl. In this situation colors apply only to the icons of marker and pen. You need to care about
 * color or background of `<mark>` by adding CSS classes definition.
 *
 * **Note**: It is recommended that the `color` value should correspond to the class in the content
 * style sheet. It represents the highlighter in the user interface of the editor.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				highlight: {
 *					options: [
 *						{
 *							model: 'pinkMarker',
 *							class: 'marker-pink',
 *							title: 'Pink Marker',
 *							color: 'var(--ck-highlight-marker-pink)',
 *							type: 'marker'
 *						},
 *						{
 *							model: 'redPen',
 *							class: 'pen-red',
 *							title: 'Red Pen',
 *							color: 'var(--ck-highlight-pen-red)',
 *							type: 'pen'
 *						},
 *					]
 *				}
 *		} )
 *		.then( ... )
 *		.catch( ... );
 *
 * @member {Array.<module:highlight/highlight~HighlightOption>} module:highlight/highlight~HighlightConfig#options
 */
