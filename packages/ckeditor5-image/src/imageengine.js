/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import buildModelConverter from '../engine/conversion/buildmodelconverter.js';
import ViewContainerElement from '../engine/view/containerelement.js';
import ViewWidgetElement from '../engine/view/widgetelement.js';
import ViewEmptyElement from '../engine/view/emptyelement.js';
import ModelElement from '../engine/model/element.js';

/**
 * The image engine feature.
 * Registers `image` as block element in document's schema and allows it to have two attributes: `src` and `alt`.
 *
 * Creates model to view converters for data and editing pipelines. These converts turns image model representation
 * to view representation:
 *
 *		<figure class="image" contenteditable="false">
 *			<img src="<source>" alt="<alternative>" />
 *		</figure>
 *
 * Creates also a view to model converter for data pipeline.
 *
 * memberof image
 * extends core.Feature.
 */
export default class ImageEngine extends Feature {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const modelDocument = editor.document;
		const dataPipeline = editor.data;
		const editingPipeline = editor.editing;

		// Configure schema.
		modelDocument.schema.registerItem( 'image', '$block' );
		modelDocument.schema.allow( { name: 'image', attributes: [ 'src', 'alt' ] } );

		// Build converter from model to view for data pipeline.
		buildModelConverter().for( dataPipeline.modelToView )
			.fromElement( 'image' )
			.toElement( ( data ) => {
				const modelElement = data.item;
				const viewImg = new ViewEmptyElement( 'img' );

				if ( modelElement.hasAttribute( 'src' ) ) {
					viewImg.setAttribute( 'src', modelElement.getAttribute( 'src' ) );
				}

				if ( modelElement.hasAttribute( 'alt' ) ) {
					viewImg.setAttribute( 'alt', modelElement.getAttribute( 'alt' ) );
				}

				return new ViewContainerElement( 'figure', { class: 'image' }, viewImg );
			} );

		// Build converter from model to view for editing pipeline.
		buildModelConverter().for( editingPipeline.modelToView )
			.fromElement( 'image' )
			.toElement( ( data ) => {
				const modelElement = data.item;
				const viewImg = new ViewEmptyElement( 'img' );

				if ( modelElement.hasAttribute( 'src' ) ) {
					viewImg.setAttribute( 'src', modelElement.getAttribute( 'src' ) );
				}

				if ( modelElement.hasAttribute( 'alt' ) ) {
					viewImg.setAttribute( 'alt', modelElement.getAttribute( 'alt' ) );
				}

				return new ViewWidgetElement( 'figure', { class: 'image' }, viewImg );
			} );

		dataPipeline.viewToModel.on( 'element:figure', ( evt, data, consumable, conversionApi ) => {
			const viewElement = data.input;

			// Check if image can be converted in current context.
			if ( !conversionApi.schema.check( { name: 'image', inside: data.context } ) ) {
				return;
			}

			// Check if figure element have img inside.
			if ( viewElement.childCount != 1 ) {
				return;
			}

			const viewImg = viewElement.getChild( 0 );

			if ( viewImg.name != 'img' ) {
				return;
			}

			// Consume img name and figure element.
			if ( !consumable.consume( viewImg, { name: true } ) ) {
				return;
			}

			if ( !consumable.consume( viewElement, { name: true, class: 'image' } ) ) {
				return;
			}

			// Create model element.
			const modelImage = new ModelElement( 'image' );

			// Add src if one is present.
			if ( viewImg.hasAttribute( 'src' ) && consumable.consume( viewImg, { attributes: [ 'src' ] } ) ) {
				modelImage.setAttribute( 'src', viewImg.getAttribute( 'src' ) );
			}

			// Add alt if one is present.
			if ( viewImg.hasAttribute( 'alt' ) && consumable.consume( viewImg, { attributes: [ 'alt' ] } ) ) {
				modelImage.setAttribute( 'alt', viewImg.getAttribute( 'alt' ) );
			}

			data.output = modelImage;
		} );
	}
}
