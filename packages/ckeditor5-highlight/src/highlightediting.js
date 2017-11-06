/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlightediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import HighlightCommand from './highlightcommand';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';

import AttributeElement from '@ckeditor/ckeditor5-engine/src/view/attributeelement';

/**
 * @extends module:core/plugin~Plugin
 */
export default class HighlightEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		editor.config.define( 'highlight', [
			{ class: 'marker', title: 'Marker', color: '#ffff66', type: 'marker' },
			{ class: 'marker-green', title: 'Green Marker', color: '#66ff00', type: 'marker' },
			{ class: 'marker-pink', title: 'Pink Marker', color: '#ff6fff', type: 'marker' },
			{ class: 'pen-red', title: 'Red Pen', color: '#ff0000', type: 'pen' },
			{ class: 'pen-blue', title: 'Blue Pen', color: '#0000ff', type: 'pen' }
		] );

		// Allow highlight attribute on all elements
		editor.document.schema.allow( { name: '$inline', attributes: 'highlight', inside: '$block' } );

		// Convert highlight attribute to a mark element with associated class.
		buildModelConverter()
			.for( data.modelToView, editing.modelToView )
			.fromAttribute( 'highlight' )
			.toElement( data => {
				const attributeElement = new AttributeElement( 'mark' );

				attributeElement.addClass( data );

				return attributeElement;
			} );

		const configuredClasses = editor.config.get( 'highlight' ).map( config => config.class );

		// Convert `mark` attribute with class name to model's highlight attribute.
		buildViewConverter()
			.for( data.viewToModel )
			.fromElement( 'mark' )
			.toAttribute( viewElement => {
				const viewClassNames = [ ...viewElement.getClassNames() ];

				if ( !viewClassNames.length ) {
					return;
				}

				const highlightClassNames = viewClassNames.filter( className => configuredClasses.includes( className ) );

				if ( !highlightClassNames.length ) {
					return;
				}

				return { key: 'highlight', value: highlightClassNames[ 0 ] };
			} );

		editor.commands.add( 'highlight', new HighlightCommand( editor ) );
	}
}
