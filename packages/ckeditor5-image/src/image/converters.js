/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image/converters
 */

import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import modelWriter from '@ckeditor/ckeditor5-engine/src/model/writer';

/**
 * Returns function that converts image view representation:
 *
 *		<figure class="image"><img src="..." alt="..."></img></figure>
 *
 * to model representation:
 *
 *		<image src="..." alt="..."></image>
 *
 * The entire contents of `<figure>` except the first `<img>` is being converted as children
 * of the `<image>` model element.
 *
 * @returns {Function}
 */
export function viewFigureToModel() {
	return ( evt, data, consumable, conversionApi ) => {
		// Do not convert if this is not an "image figure".
		if ( !consumable.test( data.input, { name: true, class: 'image' } ) ) {
			return;
		}

		// Do not convert if image cannot be placed in model at this context.
		if ( !conversionApi.schema.check( { name: 'image', inside: data.context, attributes: 'src' } ) ) {
			return;
		}

		// Find an image element inside the figure element.
		const viewImage = Array.from( data.input.getChildren() ).find( viewChild => viewChild.is( 'img' ) );

		// Do not convert if image element is absent, is missing src attribute or was already converted.
		if ( !viewImage || !viewImage.hasAttribute( 'src' ) || !consumable.test( viewImage, { name: true } ) ) {
			return;
		}

		// Convert view image to model image.
		const modelImage = conversionApi.convertItem( viewImage, consumable, data );

		// Convert rest of figure element's children, but in the context of model image, because those converted
		// children will be added as model image children.
		data.context.push( modelImage );

		const modelChildren = conversionApi.convertChildren( data.input, consumable, data );

		data.context.pop();

		// Add converted children to model image.
		modelWriter.insert( ModelPosition.createAt( modelImage ), modelChildren );

		// Set model image as conversion result.
		data.output = modelImage;
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
