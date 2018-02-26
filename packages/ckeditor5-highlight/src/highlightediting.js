/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlightediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

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
				{ model: 'yellowMarker', class: 'marker-yellow', title: 'Yellow marker', color: 'var(--ck-marker-yellow)', type: 'marker' },
				{ model: 'greenMarker', class: 'marker-green', title: 'Green marker', color: 'var(--ck-marker-green)', type: 'marker' },
				{ model: 'pinkMarker', class: 'marker-pink', title: 'Pink marker', color: 'var(--ck-marker-pink)', type: 'marker' },
				{ model: 'blueMarker', class: 'marker-blue', title: 'Blue marker', color: 'var(--ck-marker-blue)', type: 'marker' },
				{ model: 'redPen', class: 'pen-red', title: 'Red pen', color: 'var(--ck-pen-red)', type: 'pen' },
				{ model: 'greenPen', class: 'pen-green', title: 'Green pen', color: 'var(--ck-pen-green)', type: 'pen' }
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

		// Set-up the two-way conversion.
		editor.conversion.attributeToElement( _buildDefinition( options ) );

		editor.commands.add( 'highlight', new HighlightCommand( editor ) );
	}
}

// Converts options array to a converter definition.
//
// @param {Array.<module:highlight/highlight~HighlightOption>} options Array with configured options.
// @returns {module:engine/conversion/conversion~ConverterDefinition}
function _buildDefinition( options ) {
	const definition = {
		model: {
			key: 'highlight',
			values: []
		},
		view: {}
	};

	for ( const option of options ) {
		definition.model.values.push( option.model );
		definition.view[ option.model ] = {
			name: 'mark',
			class: option.class
		};
	}

	return definition;
}
