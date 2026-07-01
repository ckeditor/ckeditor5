/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/image/converters
 */

import {
	type DowncastDispatcher,
	type ModelElement,
	type UpcastDispatcher,
	type UpcastElementEvent,
	type ViewElement,
	type ViewElementAttributes,
	type DowncastAttributeEvent,
	type Consumables
} from '@ckeditor/ckeditor5-engine';
import { first, type GetCallback } from '@ckeditor/ckeditor5-utils';
import { type ImageUtils } from '../imageutils.js';
import { getViewImageType, isImageTypePlaceable } from './utils.js';

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

		// If a block image cannot land at this position (e.g. inside an inline root or another limit that
		// disallows block content), do not handle the figure here. Leaving it unconsumed lets the default
		// converter unwrap the figure so the `upcastImg()` converter can turn the inner `<img>` into an inline
		// image - otherwise the whole figure (the image included) would be dropped.
		if ( !isImageTypePlaceable( conversionApi.schema, data.modelCursor, 'imageBlock' ) ) {
			return;
		}

		// Consume the figure to prevent other converters from processing it again.
		conversionApi.consumable.consume( data.viewItem, { name: true, classes: 'image' } );

		// Convert view image to model image.
		const conversionResult = conversionApi.convertItem( viewImage, data.modelCursor );

		// When nothing was converted there is no model image to attach the figure's children to.
		// In practice `convertItem()` yields a non-null (empty) range for an `<img/>` - handled by the
		// `!modelImage` check below - so this only guards the `ModelRange | null` return type.
		/* istanbul ignore if: defensive guard for the `ModelRange | null` return type -- @preserve */
		if ( !conversionResult.modelRange ) {
			// Revert consumed figure so other features can convert it.
			conversionApi.consumable.revert( data.viewItem, { name: true, classes: 'image' } );

			return;
		}

		// Get image element from conversion result.
		const modelImage = first( conversionResult.modelRange.getItems() ) as ModelElement;

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
 * Returns a function that upcasts an `<img>` element to either an `imageBlock` or an `imageInline` model element.
 *
 * The image type is first determined from the view structure (see {@link module:image/image/utils~getViewImageType}):
 * an `<img>` wrapped in a `<figure class="image">` or styled with `display: block` becomes an `imageBlock`, otherwise
 * an `imageInline`.
 *
 * That structural type is then verified against the schema at the insertion position. If it cannot be placed there -
 * neither directly (or after hoisting to an allowed ancestor) nor wrapped in an auto-created paragraph - the converter
 * falls back to `matchImageType`. This is what allows a block image to degrade to an inline image inside an inline root
 * (and, symmetrically, an inline image to become a block image in a context that only accepts block images) instead of
 * being dropped.
 *
 * Both `ImageBlockEditing` and `ImageInlineEditing` register this converter, each passing the type it falls back to.
 * When only one of them is loaded, that single type is always produced.
 *
 * @internal
 * @param matchImageType The image type to fall back to when the type resolved from the view cannot be placed at the
 * insertion position.
 * @param imageUtils The `ImageUtils` plugin instance.
 */
export function upcastImg(
	matchImageType: 'imageBlock' | 'imageInline',
	imageUtils: ImageUtils
): ( dispatcher: UpcastDispatcher ) => void {
	const converter: GetCallback<UpcastElementEvent> = ( evt, data, conversionApi ) => {
		// Check if the `<img>` should be upcasted as a block image or an inline one.
		let imageType = getViewImageType( data.viewItem, imageUtils );

		// Collect attributes and build consumables to test.
		const attributes = data.viewItem.hasAttribute( 'src' ) ? {
			src: data.viewItem.getAttribute( 'src' )
		} : undefined;

		const consumables: Consumables = {
			name: true,
			attributes: Object.keys( attributes || {} )
		};

		// Exit early if it is already consumed by some other converter.
		if ( !conversionApi.consumable.test( data.viewItem, consumables ) ) {
			return;
		}

		// Is this image type allowed here? Switch type if not.
		if ( imageType != matchImageType && !isImageTypePlaceable( conversionApi.schema, data.modelCursor, imageType ) ) {
			imageType = matchImageType;
		}

		const modelElement = conversionApi.writer.createElement( imageType, attributes );

		if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
			return;
		}

		conversionApi.consumable.consume( data.viewItem, consumables );
		conversionApi.convertChildren( data.viewItem, modelElement );
		conversionApi.updateConversionResult( modelElement, data );
	};

	return dispatcher => {
		dispatcher.on<UpcastElementEvent>( 'element:img', converter );
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

			// The `<img/>` was not converted to a model image element (e.g. an inline root only allows
			// inline content and neither image type was allowed), so there is nothing to set the sources on.
			// In practice `convertItem()` yields a non-null (empty) range for an `<img/>` - handled by the
			// `!modelImage` check below - so this only guards the `ModelRange | null` return type.
			/* istanbul ignore if: defensive guard for the `ModelRange | null` return type -- @preserve */
			if ( !conversionResult.modelRange ) {
				return;
			}

			modelImage = first( conversionResult.modelRange.getItems() ) as ModelElement;

			if ( !modelImage ) {
				return;
			}
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
	const converter: GetCallback<DowncastAttributeEvent<ModelElement>> = ( evt, data, conversionApi	) => {
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
		dispatcher.on<DowncastAttributeEvent<ModelElement>>( `attribute:srcset:${ imageType }`, converter );
	};
}

/**
 * Converts the `source` model attribute to the `<picture><source /><source />...<img /></picture>`
 * view structure.
 *
 * @internal
 */
export function downcastSourcesAttribute( imageUtils: ImageUtils ): ( dispatcher: DowncastDispatcher ) => void {
	const converter: GetCallback<DowncastAttributeEvent<ModelElement>> = ( evt, data, conversionApi	) => {
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

			// Reuse existing <picture> element (https://github.com/ckeditor/ckeditor5/issues/17192) or create a new one.
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
		dispatcher.on<DowncastAttributeEvent<ModelElement>>( 'attribute:sources:imageBlock', converter );
		dispatcher.on<DowncastAttributeEvent<ModelElement>>( 'attribute:sources:imageInline', converter );
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
	const converter: GetCallback<DowncastAttributeEvent<ModelElement>> = ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const element = conversionApi.mapper.toViewElement( data.item )!;
		const img = imageUtils.findViewImgElement( element )!;

		viewWriter.setAttribute( data.attributeKey, data.attributeNewValue || '', img );
	};

	return dispatcher => {
		dispatcher.on<DowncastAttributeEvent<ModelElement>>( `attribute:${ attributeKey }:${ imageType }`, converter );
	};
}
