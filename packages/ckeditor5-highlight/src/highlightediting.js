/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlightediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { attributeToElement } from '@ckeditor/ckeditor5-engine/src/conversion/two-way-converters';

import HighlightCommand from './highlightcommand';

/**
 * The highlight editing feature. It introduces the {@link module:highlight/highlightcommand~HighlightCommand command} and the `highlight`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `<mark>` element with the class attribute (`<span class="marker-green">...</span>`) depending
 * on the {@link module:highlight/highlight~HighlightConfig configuration}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HighlightEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'highlight', {
			options: [
				{ model: 'marker', class: 'marker', title: 'Marker', color: '#ffff66', type: 'marker' },
				{ model: 'greenMarker', class: 'marker-green', title: 'Green marker', color: '#66ff00', type: 'marker' },
				{ model: 'pinkMarker', class: 'marker-pink', title: 'Pink marker', color: '#ff6fff', type: 'marker' },
				{ model: 'redPen', class: 'pen-red', title: 'Red pen', color: '#ff2929', type: 'pen' },
				{ model: 'bluePen', class: 'pen-blue', title: 'Blue pen', color: '#0091ff', type: 'pen' }
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow highlight attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'highlight' } );

		const options = editor.config.get( 'highlight.options' );

		attributeToElement( editor.conversion, 'highlight', options.map( _getConverterDefinition ) );

		editor.commands.add( 'highlight', new HighlightCommand( editor ) );
	}
}

// Converts {@link module:highlight/highlight~HighlightOption}
// to {@link module:engine/conversion/definition-based-converters~ConverterDefinition}
//
// @param {module:highlight/highlight~HighlightOption} option
// @returns {module:engine/conversion/definition-based-converters~ConverterDefinition}
function _getConverterDefinition( option ) {
	return {
		model: option.model,
		view: {
			name: 'mark',
			class: option.class
		}
	};
}
