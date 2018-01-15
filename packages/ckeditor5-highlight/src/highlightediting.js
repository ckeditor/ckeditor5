/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlightediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	modelAttributeToViewAttributeElement,
	viewToModelAttribute
} from '@ckeditor/ckeditor5-engine/src/conversion/definition-based-converters';

import HighlightCommand from './highlightcommand';

/**
 * The highlight editing feature. It introduces `highlight` command which allow to highlight selected text with defined 'marker' or 'pen'.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HighlightEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'highlight', [
			{ model: 'marker', view: { name: 'mark', class: 'marker' }, title: 'Marker', color: '#ffff66', type: 'marker' },
			{
				model: 'greenMarker',
				view: { name: 'mark', class: 'marker-green' },
				title: 'Green Marker',
				color: '#66ff00',
				type: 'marker'
			},
			{ model: 'pinkMarker', view: { name: 'mark', class: 'marker-pink' }, title: 'Pink Marker', color: '#ff6fff', type: 'marker' },
			{ model: 'redPen', view: { name: 'mark', class: 'pen-red' }, title: 'Red Pen', color: '#ff0000', type: 'pen' },
			{ model: 'bluePen', view: { name: 'mark', class: 'pen-blue' }, title: 'Blue Pen', color: '#0000ff', type: 'pen' }
		] );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		// Allow highlight attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'highlight' } );

		const options = editor.config.get( 'highlight' );

		// Define view to model conversion.
		for ( const option of options ) {
			viewToModelAttribute( 'highlight', option, [ data.viewToModel ] );
		}

		// Define model to view conversion.
		modelAttributeToViewAttributeElement( 'highlight', options, [ data.modelToView, editing.modelToView ] );

		editor.commands.add( 'highlight', new HighlightCommand( editor ) );
	}
}

/**
 * Highlight option descriptor. Compatible with {@link module:engine/conversion/definition-based-converters~ConverterDefinition}.
 *
 * @typedef {Object} module:highlight/highlightediting~HighlightOption
 * @property {String} title The user-readable title of the option.
 * @property {String} model Attribute's unique value in the model.
 * @property {String} color Color used for highlighter. Should be coherent with view definition.
 * @property {'marker'|'pen'} type The type of highlighter:
 * - "marker" - will use #color as background,
 * - "pen" - will use #color as font color.
 */

/**
 * The configuration of the {@link module:highlight/highlightediting~HighlightEditing Highlight feature}.
 *
 * Read more in {@link module:highlight/highlightediting~HighlightEditingConfig}.
 *
 * @member {module:highlight/highlightediting~HighlightEditingConfig} module:core/editor/editorconfig~EditorConfig#highlight
 */

/**
 * The configuration of the {@link module:highlight/highlightediting~HighlightEditing Highlight feature}.
 *
 *        ClassicEditor
 *            .create( editorElement, {
 * 				highlight:  ... // Highlight feature config.
 *			} )
 *            .then( ... )
 *            .catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface HighlightEditingConfig
 */

/**
 * Available highlighters options.
 *
 * There are two types of highlighters:
 * - 'marker' - rendered as `<mark>` element with defined background color.
 * - 'pen' - rendered as `<mark>` element with defined foreground (font) color.
 *
 * Note: Each highlighter must have it's own CSS class defined to properly match content data. Also it is advised
 * that color value should match the values defined in content CSS stylesheet.
 *
 * @member {Array.<module:heading/heading~HighlightOption>} module:heading/heading~HeadingConfig#options
 */
