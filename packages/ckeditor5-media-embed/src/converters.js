/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image/converters
 */

import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';
import first from '@ckeditor/ckeditor5-utils/src/first';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';

/**
 * Returns a function that converts the media wrapper view representation:
 *
 *		<figure class="media"><div data-oembed-url="..."></div></figure>
 *
 * to the model representation:
 *
 *		<media url="..."></media>
 *
 * @returns {Function}
 */
export function viewFigureToModel() {
	return dispatcher => {
		dispatcher.on( 'element:figure', converter );
	};

	function converter( evt, data, conversionApi ) {
		// Do not convert if this is not a "media figure".
		if ( !conversionApi.consumable.test( data.viewItem, { name: true, classes: 'media' } ) ) {
			return;
		}

		// Find a div wrapper element inside the figure element.
		const viewWrapper = Array.from( data.viewItem.getChildren() )
			.find( viewChild => {
				return viewChild.is( 'div' );
			} );

		// Do not convert if the div wrapper element is absent, is missing data-oembed-url attribute or was already converted.
		if ( !viewWrapper ||
			!viewWrapper.hasAttribute( 'data-oembed-url' ) ||
			!conversionApi.consumable.test( viewWrapper, { name: true } ) ) {
			return;
		}

		// Convert view wrapper to model attribute.
		const conversionResult = conversionApi.convertItem( viewWrapper, data.modelCursor );

		// Get the model wrapper from conversion result.
		const mediaElement = first( conversionResult.modelRange.getItems() );

		// If the media has not been successfully converted, finish the conversion.
		if ( !mediaElement ) {
			return;
		}

		// Set media range as conversion result.
		data.modelRange = conversionResult.modelRange;

		// Continue conversion where media conversion ends.
		data.modelCursor = conversionResult.modelCursor;
	}
}

export function modelToViewUrlAttributeConverter( mediaRegistry, options ) {
	const mediaViewElementOptions = {
		useSemanticWrapper: options.semanticDataOutput,
		renderContent: !options.semanticDataOutput,
		renderForEditingView: options.renderForEditingView
	};

	return dispatcher => {
		dispatcher.on( 'attribute:url:media', converter );
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const url = data.attributeNewValue;
		const viewWriter = conversionApi.writer;
		const figure = conversionApi.mapper.toViewElement( data.item );

		// TODO: removing it and creating it from scratch is a hack. We can do better than that.
		viewWriter.remove( ViewRange.createIn( figure ) );

		const mediaViewElement = mediaRegistry.getMediaViewElement( viewWriter, url, mediaViewElementOptions );

		viewWriter.insert( ViewPosition.createAt( figure ), mediaViewElement );
	}
}
