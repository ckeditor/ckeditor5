/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '/ckeditor5/core/feature.js';
import buildModelConverter from '/ckeditor5/engine/conversion/buildmodelconverter.js';
import buildViewConverter from '/ckeditor5/engine/conversion/buildviewconverter.js';
import ViewContainerElement from '/ckeditor5/engine/view/containerelement.js';
import ModelElement from '/ckeditor5/engine/model/element.js';

export default class ImageEngine extends Feature {
	init() {
		const editor = this.editor;
		const modelDocument = editor.document;
		const dataPipeline = editor.data;
		const editingPipeline = editor.editing;

		// Configure schema.
		modelDocument.schema.registerItem( 'image', '$block' );
		modelDocument.schema.allow( { name: 'image', attributes: [ 'src', 'alt' ] } );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( dataPipeline.modelToView, editingPipeline.modelToView )
			.fromElement( 'image' )
			.toElement( ( data ) => {
				return widgetize( new ViewContainerElement( 'img', {
					src: data.item.getAttribute( 'src' ),
					alt: data.item.getAttribute( 'alt' ),
				} ) );
			} );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( dataPipeline.viewToModel )
			.fromElement( 'img' ).consuming( { name: true, attributes: [ 'src', 'alt' ] } )
			.toElement( ( viewElement ) => new ModelElement( 'image', {
				src: viewElement.getAttribute( 'src' ),
				alt: viewElement.getAttribute( 'alt' )
			} ) );
	}
}

function widgetize( element ) {
	element.isWidget = true;

	return element;
}
