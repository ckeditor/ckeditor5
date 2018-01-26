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
 * Highlight option descriptor.
 *
 * @typedef {Object} module:highlight/highlight~HighlightOption
 * @property {String} title The user-readable title of the option.
 * @property {String} model Attribute's unique value in the model.
 * @property {String} color Color used for highlighter. Should be coherent with `class` CSS setting.
 * @property {String} class CSS Class used on `mark` element in view. Should be coherent with `color` setting.
 * @property {'marker'|'pen'} type The type of highlighter:
 * - "marker" - will use #color as highlight background,
 * - "pen" - will use #color as highlight font color.
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
 * Available highlighters options.
 *
 * There are two types of highlighters:
 * - 'marker' - rendered as `<mark>` element with defined background color.
 * - 'pen' - rendered as `<mark>` element with defined foreground (font) color.
 *
 * **Note**: Each highlighter must have it's own CSS class defined to properly match content data.
 * Also it is advised that color value should match the values defined in content CSS stylesheet.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				highlight: {
 *					options: [
 *						{
 *							model: 'pinkMarker',
 *							class: 'marker-pink',
 *							title: 'Pink Marker',
 *							color: '#ff6fff',
 *							type: 'marker'
 *						},
 *						{
 *							model: 'redPen',
 *							class: 'pen-red',
 *							title: 'Red Pen',
 *							color: '#ff2929',
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
