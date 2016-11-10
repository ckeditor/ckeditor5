/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import buildModelConverter from '../engine/conversion/buildmodelconverter.js';
import {
	modelToViewImage,
	modelToViewSelection,
	viewToModelImage
} from './converters.js';

/**
 * The image engine feature.
 * Registers `image` as block element in document's schema and allows it to have two attributes: `src` and `alt`.
 * Creates model converter for data and editing pipelines, and view converter for data pipeline.
 *
 * @memberof image
 * @extends core.Feature.
 */
export default class ImageEngine extends Feature {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const document = editor.document;
		const dataPipeline = editor.data;
		const editingPipeline = editor.editing;

		// Configure schema.
		document.schema.registerItem( 'image', '$block' );
		document.schema.allow( { name: 'image', attributes: [ 'src', 'alt' ] } );

		// Build converter from model to view for data pipeline.
		buildModelConverter().for( dataPipeline.modelToView )
			.fromElement( 'image' )
			.toElement( modelToViewImage( true ) );

		// Build converter from model to view for editing pipeline.
		buildModelConverter().for( editingPipeline.modelToView )
			.fromElement( 'image' )
			.toElement( modelToViewImage() );

		// Converter for figure element from view to model.
		dataPipeline.viewToModel.on( 'element:figure', viewToModelImage() );

		// Selection converter from view to model - applies fake selection if model selection is on widget.
		editingPipeline.modelToView.on( 'selection', modelToViewSelection(), { priority: 'low' } );
	}
}
