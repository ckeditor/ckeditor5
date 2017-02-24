/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image/converters
 */

import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import modelWriter from '@ckeditor/ckeditor5-engine/src/model/writer';
import { isImageWidget } from './utils';

/**
 * Returns function that converts image view representation:
 *
 *		<figure class="image"><img src="..." alt="..."></img></figure>
 *
 * to model representation:
 *
 *		<image src="..." alt="..."></image>
 *
 * @returns {Function}
 */
export function viewToModelImage() {
	return ( evt, data, consumable, conversionApi ) => {
		const viewFigureElement = data.input;

		// *** Step 1: Validate conversion.
		// Check if figure element can be consumed.
		if ( !consumable.test( viewFigureElement, { name: true, class: 'image' } ) ) {
			return;
		}

		// Check if image element can be converted in current context.
		if ( !conversionApi.schema.check( { name: 'image', inside: data.context, attributes: 'src' } ) ) {
			return;
		}

		// Check if img element is placed inside figure element and can be consumed with `src` attribute.
		const viewImg = viewFigureElement.getChild( 0 );

		if ( !viewImg || viewImg.name != 'img' || !consumable.test( viewImg, { name: true, attribute: 'src' } ) ) {
			return;
		}

		// *** Step2: Convert to model.
		consumable.consume( viewFigureElement, { name: true, class: 'image' } );
		consumable.consume( viewImg, { name: true, attribute: 'src' } );

		// Create model element.
		const modelImage = new ModelElement( 'image', {
			src: viewImg.getAttribute( 'src' )
		} );

		// Convert `alt` attribute if present.
		if ( consumable.consume( viewImg, { attribute: [ 'alt' ] } ) ) {
			modelImage.setAttribute( 'alt', viewImg.getAttribute( 'alt' ) );
		}

		// Convert children of converted view element and append them to `modelImage`.
		// TODO https://github.com/ckeditor/ckeditor5-engine/issues/736.
		data.context.push( modelImage );
		const modelChildren = conversionApi.convertChildren( viewFigureElement, consumable, data );
		const insertPosition = ModelPosition.createAt( modelImage, 'end' );
		modelWriter.insert( insertPosition, modelChildren );
		data.context.pop();

		data.output = modelImage;
	};
}

/**
 * Returns model to view selection converter. This converter is applied after default selection conversion is made.
 * It creates fake view selection when {@link module:engine/view/selection~Selection#getSelectedElement} returns instance
 * of image widget.
 *
 * @param {Function} t {@link module:utils/locale~Locale#t Locale#t function} used to translate default fake selection's label.
 * @returns {Function}
 */
export function modelToViewSelection( t ) {
	return ( evt, data, consumable, conversionApi ) => {
		const viewSelection = conversionApi.viewSelection;
		const selectedElement = viewSelection.getSelectedElement();

		if ( !selectedElement || !isImageWidget( selectedElement ) ) {
			return;
		}

		let fakeSelectionLabel = t( 'image widget' );
		const imgElement = selectedElement.getChild( 0 );
		const altText = imgElement.getAttribute( 'alt' );

		if ( altText ) {
			fakeSelectionLabel = `${ altText } ${ fakeSelectionLabel }`;
		}

		viewSelection.setFake( true, { label: fakeSelectionLabel } );
	};
}

/**
 * Creates image attribute converter for provided model conversion dispatchers.
 *
 * @param {Array.<module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher>} dispatchers
 * @param {String} attributeName
 */
export function createImageAttributeConverter( dispatchers, attributeName ) {
	for ( let dispatcher of dispatchers ) {
		dispatcher.on( `addAttribute:${ attributeName }:image`, modelToViewAttributeConverter );
		dispatcher.on( `changeAttribute:${ attributeName }:image`, modelToViewAttributeConverter );
		dispatcher.on( `removeAttribute:${ attributeName }:image`, modelToViewAttributeConverter );
	}
}

// Model to view image converter converting given attribute, and adding it to `img` element nested inside `figure` element.
//
// @private
function modelToViewAttributeConverter( evt, data, consumable, conversionApi ) {
	const parts = evt.name.split( ':' );
	const consumableType = parts[ 0 ] + ':' + parts[ 1 ];

	if ( !consumable.consume( data.item, consumableType ) ) {
		return;
	}

	const figure = conversionApi.mapper.toViewElement( data.item );
	const img = figure.getChild( 0 );

	if ( parts[ 0 ] == 'removeAttribute' ) {
		img.removeAttribute( data.attributeKey );
	} else {
		img.setAttribute( data.attributeKey, data.attributeNewValue );
	}
}
