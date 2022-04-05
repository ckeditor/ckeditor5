/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/converters
 */

import { first } from 'ckeditor5/src/utils';

/**
 * Returns a function that converts the image view representation:
 *
 *		<figure class="image"><img src="..." alt="..."></img></figure>
 *
 * to the model representation:
 *
 *		<imageBlock src="..." alt="..."></imageBlock>
 *
 * The entire content of the `<figure>` element except the first `<img>` is being converted as children
 * of the `<imageBlock>` model element.
 *
 * @protected
 * @param {module:image/imageutils~ImageUtils} imageUtils
 * @returns {Function}
 */
export function upcastImageFigure( imageUtils ) {
	return dispatcher => {
		dispatcher.on( 'element:figure', converter );
	};

	function converter( evt, data, conversionApi ) {
		// Do not convert if this is not an "image figure".
		if ( !conversionApi.consumable.test( data.viewItem, { name: true, classes: 'image' } ) ) {
			return;
		}

		// Find an image element inside the figure element.
		const viewImage = imageUtils.findViewImgElement( data.viewItem );

		// Do not convert if image element is absent or was already converted.
		if ( !viewImage || !conversionApi.consumable.test( viewImage, { name: true } ) ) {
			return;
		}

		// Consume the figure to prevent other converters from processing it again.
		conversionApi.consumable.consume( data.viewItem, { name: true, classes: 'image' } );

		// Convert view image to model image.
		const conversionResult = conversionApi.convertItem( viewImage, data.modelCursor );

		// Get image element from conversion result.
		const modelImage = first( conversionResult.modelRange.getItems() );

		// When image wasn't successfully converted then finish conversion.
		if ( !modelImage ) {
			// Revert consumed figure so other features can convert it.
			conversionApi.consumable.revert( data.viewItem, { name: true, classes: 'image' } );

			return;
		}

		// Convert rest of the figure element's children as an image children.
		conversionApi.convertChildren( data.viewItem, modelImage );

		conversionApi.updateConversionResult( modelImage, data );
	}
}

/**
 * Returns a function that converts the image view representation:
 *
 *		<picture><source ... /><source ... />...<img ... /></picture>
 *
 * to the model representation as the `sources` attribute:
 *
 *		<image[Block|Inline] ... sources="..."></image[Block|Inline]>
 *
 * @protected
 * @param {module:image/imageutils~ImageUtils} imageUtils
 * @returns {Function}
 */
export function upcastPicture( imageUtils ) {
	const sourceAttributeNames = [ 'srcset', 'media', 'type' ];

	return dispatcher => {
		dispatcher.on( 'element:picture', converter );
	};

	function converter( evt, data, conversionApi ) {
		const pictureViewElement = data.viewItem;

		// Do not convert <picture> if already consumed.
		if ( !conversionApi.consumable.test( pictureViewElement, { name: true } ) ) {
			return;
		}

		const sources = new Map();

		// Collect all <source /> elements attribute values.
		for ( const childSourceElement of pictureViewElement.getChildren() ) {
			if ( childSourceElement.is( 'element', 'source' ) ) {
				const attributes = {};

				for ( const name of sourceAttributeNames ) {
					if ( childSourceElement.hasAttribute( name ) ) {
						// Don't collect <source /> attribute if already consumed somewhere else.
						if ( conversionApi.consumable.test( childSourceElement, { attributes: name } ) ) {
							attributes[ name ] = childSourceElement.getAttribute( name );
						}
					}
				}

				if ( Object.keys( attributes ).length ) {
					sources.set( childSourceElement, attributes );
				}
			}
		}

		const imgViewElement = imageUtils.findViewImgElement( pictureViewElement );

		// Don't convert when a picture has no <img/> inside (it is broken).
		if ( !imgViewElement ) {
			return;
		}

		let modelImage = data.modelCursor.parent;

		// - In case of an inline image (cursor parent in a <paragraph>), the <img/> must be converted right away
		// because no converter handled it yet and otherwise there would be no model element to set the sources attribute on.
		// - In case of a block image, the <figure class="image"> converter (in ImageBlockEditing) converts the
		// <img/> right away on its own and the modelCursor is already inside an imageBlock and there's nothing special
		// to do here.
		if ( !modelImage.is( 'element', 'imageBlock' ) ) {
			const conversionResult = conversionApi.convertItem( imgViewElement, data.modelCursor );

			// Set image range as conversion result.
			data.modelRange = conversionResult.modelRange;

			// Continue conversion where image conversion ends.
			data.modelCursor = conversionResult.modelCursor;

			modelImage = first( conversionResult.modelRange.getItems() );
		}

		conversionApi.consumable.consume( pictureViewElement, { name: true } );

		// Consume only these <source/> attributes that were actually collected and will be passed on
		// to the image model element.
		for ( const [ sourceElement, attributes ] of sources ) {
			conversionApi.consumable.consume( sourceElement, { attributes: Object.keys( attributes ) } );
		}

		if ( sources.size ) {
			conversionApi.writer.setAttribute( 'sources', Array.from( sources.values() ), modelImage );
		}

		// Convert rest of the <picture> children as an image children. Other converters may want to consume them.
		conversionApi.convertChildren( pictureViewElement, modelImage );
	}
}

/**
 * Converter used to convert the `srcset` model image attribute to the `srcset`, `sizes` and `width` attributes in the view.
 *
 * @protected
 * @param {module:image/imageutils~ImageUtils} imageUtils
 * @param {'imageBlock'|'imageInline'} imageType The type of the image.
 * @returns {Function}
 */
export function downcastSrcsetAttribute( imageUtils, imageType ) {
	return dispatcher => {
		dispatcher.on( `attribute:srcset:${ imageType }`, converter );
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const writer = conversionApi.writer;
		const element = conversionApi.mapper.toViewElement( data.item );
		const img = imageUtils.findViewImgElement( element );

		if ( data.attributeNewValue === null ) {
			const srcset = data.attributeOldValue;

			if ( srcset.data ) {
				writer.removeAttribute( 'srcset', img );
				writer.removeAttribute( 'sizes', img );

				if ( srcset.width ) {
					writer.removeAttribute( 'width', img );
				}
			}
		} else {
			const srcset = data.attributeNewValue;

			if ( srcset.data ) {
				writer.setAttribute( 'srcset', srcset.data, img );
				// Always outputting `100vw`. See https://github.com/ckeditor/ckeditor5-image/issues/2.
				writer.setAttribute( 'sizes', '100vw', img );

				if ( srcset.width ) {
					writer.setAttribute( 'width', srcset.width, img );
				}
			}
		}
	}
}

/**
 * Converts the `source` model attribute to the `<picture><source /><source />...<img /></picture>`
 * view structure.
 *
 * @protected
 * @param {module:image/imageutils~ImageUtils} imageUtils
 * @returns {Function}
 */
export function downcastSourcesAttribute( imageUtils ) {
	return dispatcher => {
		dispatcher.on( 'attribute:sources:imageBlock', converter );
		dispatcher.on( 'attribute:sources:imageInline', converter );
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const element = conversionApi.mapper.toViewElement( data.item );
		const imgElement = imageUtils.findViewImgElement( element );

		if ( data.attributeNewValue && data.attributeNewValue.length ) {
			// Make sure <picture> does not break attribute elements, for instance <a> in linked images.
			const pictureElement = viewWriter.createContainerElement( 'picture', null,
				data.attributeNewValue.map( sourceAttributes => {
					return viewWriter.createEmptyElement( 'source', sourceAttributes );
				} )
			);

			// Collect all wrapping attribute elements.
			const attributeElements = [];
			let viewElement = imgElement.parent;

			while ( viewElement && viewElement.is( 'attributeElement' ) ) {
				const parentElement = viewElement.parent;

				viewWriter.unwrap( viewWriter.createRangeOn( imgElement ), viewElement );

				attributeElements.unshift( viewElement );
				viewElement = parentElement;
			}

			// Insert the picture and move img into it.
			viewWriter.insert( viewWriter.createPositionBefore( imgElement ), pictureElement );
			viewWriter.move( viewWriter.createRangeOn( imgElement ), viewWriter.createPositionAt( pictureElement, 'end' ) );

			// Apply collected attribute elements over the new picture element.
			for ( const attributeElement of attributeElements ) {
				viewWriter.wrap( viewWriter.createRangeOn( pictureElement ), attributeElement );
			}
		}
		// Both setting "sources" to an empty array and removing the attribute should unwrap the <img />.
		// Unwrap once if the latter followed the former, though.
		else if ( imgElement.parent.is( 'element', 'picture' ) ) {
			const pictureElement = imgElement.parent;

			viewWriter.move( viewWriter.createRangeOn( imgElement ), viewWriter.createPositionBefore( pictureElement ) );
			viewWriter.remove( pictureElement );
		}
	}
}

/**
 * Converter used to convert a given image attribute from the model to the view.
 *
 * @protected
 * @param {module:image/imageutils~ImageUtils} imageUtils
 * @param {'imageBlock'|'imageInline'} imageType The type of the image.
 * @param {String} attributeKey The name of the attribute to convert.
 * @returns {Function}
 */
export function downcastImageAttribute( imageUtils, imageType, attributeKey ) {
	return dispatcher => {
		dispatcher.on( `attribute:${ attributeKey }:${ imageType }`, converter );
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const element = conversionApi.mapper.toViewElement( data.item );
		const img = imageUtils.findViewImgElement( element );

		viewWriter.setAttribute( data.attributeKey, data.attributeNewValue || '', img );
	}
}

