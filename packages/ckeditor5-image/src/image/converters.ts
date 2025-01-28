/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/image/converters
 */

import type {
	DowncastDispatcher,
	Element,
	UpcastDispatcher,
	UpcastElementEvent,
	ViewElement,
	ViewElementAttributes,
	DowncastAttributeEvent
} from 'ckeditor5/src/engine.js';
import { first, type GetCallback } from 'ckeditor5/src/utils.js';
import type ImageUtils from '../imageutils.js';

/**
 * Returns a function that converts the image view representation:
 *
 * ```html
 * <figure class="image"><img src="..." alt="..."></img></figure>
 * ```
 *
 * to the model representation:
 *
 * ```html
 * <imageBlock src="..." alt="..."></imageBlock>
 * ```
 *
 * The entire content of the `<figure>` element except the first `<img>` is being converted as children
 * of the `<imageBlock>` model element.
 *
 * @internal
 */
export function upcastImageFigure( imageUtils: ImageUtils ): ( dispatcher: UpcastDispatcher ) => void {
	const converter: GetCallback<UpcastElementEvent> = ( evt, data, conversionApi ) => {
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
		const modelImage = first( conversionResult.modelRange!.getItems() ) as Element;

		// When image wasn't successfully converted then finish conversion.
		if ( !modelImage ) {
			// Revert consumed figure so other features can convert it.
			conversionApi.consumable.revert( data.viewItem, { name: true, classes: 'image' } );

			return;
		}

		// Convert rest of the figure element's children as an image children.
		conversionApi.convertChildren( data.viewItem, modelImage );

		conversionApi.updateConversionResult( modelImage, data );
	};

	return dispatcher => {
		dispatcher.on<UpcastElementEvent>( 'element:figure', converter );
	};
}

/**
 * Returns a function that converts the image view representation:
 *
 * ```html
 * <picture><source ... /><source ... />...<img ... /></picture>
 * ```
 *
 * to the model representation as the `sources` attribute:
 *
 * ```html
 * <image[Block|Inline] ... sources="..."></image[Block|Inline]>
 * ```
 *
 * @internal
 */
export function upcastPicture( imageUtils: ImageUtils ): ( dispatcher: UpcastDispatcher ) => void {
	const sourceAttributeNames = [ 'srcset', 'media', 'type', 'sizes' ];

	const converter: GetCallback<UpcastElementEvent> = ( evt, data, conversionApi ) => {
		const pictureViewElement = data.viewItem;

		// Do not convert <picture> if already consumed.
		if ( !conversionApi.consumable.test( pictureViewElement, { name: true } ) ) {
			return;
		}

		const sources = new Map<ViewElement, Record<string, string | undefined>>();

		// Collect all <source /> elements attribute values.
		for ( const childSourceElement of pictureViewElement.getChildren() ) {
			if ( childSourceElement.is( 'element', 'source' ) ) {
				const attributes: Record<string, string | undefined> = {};

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

			modelImage = first( conversionResult.modelRange!.getItems() ) as Element;
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
	};

	return dispatcher => {
		dispatcher.on<UpcastElementEvent>( 'element:picture', converter );
	};
}

/**
 * Converter used to convert the `srcset` model image attribute to the `srcset` and `sizes` attributes in the view.
 *
 * @internal
 * @param imageType The type of the image.
 */
export function downcastSrcsetAttribute(
	imageUtils: ImageUtils,
	imageType: 'imageBlock' | 'imageInline'
): ( dispatcher: DowncastDispatcher ) => void {
	const converter: GetCallback<DowncastAttributeEvent<Element>> = ( evt, data, conversionApi	) => {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const writer = conversionApi.writer;
		const element = conversionApi.mapper.toViewElement( data.item )!;
		const img = imageUtils.findViewImgElement( element )!;

		if ( data.attributeNewValue === null ) {
			writer.removeAttribute( 'srcset', img );
			writer.removeAttribute( 'sizes', img );
		} else {
			if ( data.attributeNewValue ) {
				writer.setAttribute( 'srcset', data.attributeNewValue, img );
				// Always outputting `100vw`. See https://github.com/ckeditor/ckeditor5-image/issues/2.
				writer.setAttribute( 'sizes', '100vw', img );
			}
		}
	};

	return dispatcher => {
		dispatcher.on<DowncastAttributeEvent<Element>>( `attribute:srcset:${ imageType }`, converter );
	};
}

/**
 * Converts the `source` model attribute to the `<picture><source /><source />...<img /></picture>`
 * view structure.
 *
 * @internal
 */
export function downcastSourcesAttribute( imageUtils: ImageUtils ): ( dispatcher: DowncastDispatcher ) => void {
	const converter: GetCallback<DowncastAttributeEvent<Element>> = ( evt, data, conversionApi	) => {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const element = conversionApi.mapper.toViewElement( data.item )!;
		const imgElement = imageUtils.findViewImgElement( element )!;
		const attributeNewValue = data.attributeNewValue as null | Array<ViewElementAttributes>;

		if ( attributeNewValue && attributeNewValue.length ) {
			// Collect all wrapping attribute elements.
			const attributeElements = [];
			let viewElement = imgElement.parent;

			while ( viewElement && viewElement.is( 'attributeElement' ) ) {
				const parentElement = viewElement.parent;

				viewWriter.unwrap( viewWriter.createRangeOn( imgElement ), viewElement );

				attributeElements.unshift( viewElement );
				viewElement = parentElement;
			}

			const hasPictureElement = imgElement.parent!.is( 'element', 'picture' );

			// Reuse existing <picture> element (ckeditor5#17192) or create a new one.
			const pictureElement = hasPictureElement ? imgElement.parent : viewWriter.createContainerElement( 'picture', null );

			if ( !hasPictureElement ) {
				viewWriter.insert( viewWriter.createPositionBefore( imgElement ), pictureElement );
			}

			viewWriter.remove( viewWriter.createRangeIn( pictureElement ) );

			viewWriter.insert( viewWriter.createPositionAt( pictureElement, 'end' ),
				attributeNewValue.map( sourceAttributes => {
					return viewWriter.createEmptyElement( 'source', sourceAttributes );
				} )
			);

			viewWriter.move( viewWriter.createRangeOn( imgElement ), viewWriter.createPositionAt( pictureElement, 'end' ) );

			// Apply collected attribute elements over the new picture element.
			for ( const attributeElement of attributeElements ) {
				viewWriter.wrap( viewWriter.createRangeOn( pictureElement ), attributeElement );
			}
		}
		// Both setting "sources" to an empty array and removing the attribute should unwrap the <img />.
		// Unwrap once if the latter followed the former, though.
		else if ( imgElement.parent!.is( 'element', 'picture' ) ) {
			const pictureElement = imgElement.parent;

			viewWriter.move( viewWriter.createRangeOn( imgElement ), viewWriter.createPositionBefore( pictureElement ) );
			viewWriter.remove( pictureElement );
		}
	};

	return dispatcher => {
		dispatcher.on<DowncastAttributeEvent<Element>>( 'attribute:sources:imageBlock', converter );
		dispatcher.on<DowncastAttributeEvent<Element>>( 'attribute:sources:imageInline', converter );
	};
}

/**
 * Converter used to convert a given image attribute from the model to the view.
 *
 * @internal
 * @param imageType The type of the image.
 * @param attributeKey The name of the attribute to convert.
 */
export function downcastImageAttribute(
	imageUtils: ImageUtils,
	imageType: 'imageBlock' | 'imageInline',
	attributeKey: string
): ( dispatcher: DowncastDispatcher ) => void {
	const converter: GetCallback<DowncastAttributeEvent<Element>> = ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const element = conversionApi.mapper.toViewElement( data.item )!;
		const img = imageUtils.findViewImgElement( element )!;

		viewWriter.setAttribute( data.attributeKey, data.attributeNewValue || '', img );
	};

	return dispatcher => {
		dispatcher.on<DowncastAttributeEvent<Element>>( `attribute:${ attributeKey }:${ imageType }`, converter );
	};
}

