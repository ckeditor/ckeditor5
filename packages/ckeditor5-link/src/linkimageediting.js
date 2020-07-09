/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkimageediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageEditing from '@ckeditor/ckeditor5-image/src/image/imageediting';
import LinkEditing from './linkediting';

import linkIcon from '../theme/icons/link.svg';

/**
 * The link image engine feature.
 *
 * It accepts the `linkHref="url"` attribute in the model for the {@link module:image/image~Image `<image>`} element
 * which allows linking images.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LinkImageEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEditing, LinkEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'LinkImageEditing';
	}

	init() {
		const editor = this.editor;

		editor.model.schema.extend( 'image', { allowAttributes: [ 'linkHref' ] } );

		editor.conversion.for( 'upcast' ).add( upcastLink() );
		editor.conversion.for( 'downcast' ).add( downcastImageLink() );
	}
}

// Returns a converter that consumes the 'href' attribute if a link contains an image.
//
// @private
// @returns {Function}
//
function upcastLink() {
	return dispatcher => {
		dispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
			const viewLink = data.viewItem;
			const imageInLink = Array.from( viewLink.getChildren() ).find( child => child.name === 'img' );

			if ( !imageInLink ) {
				return;
			}

			// There's an image inside an <a> element - we consume it so it won't be picked up by the Link plugin.
			const consumableAttributes = { attributes: [ 'href' ] };

			// Consume the `href` attribute so the default one will not convert it to $text attribute.
			if ( !conversionApi.consumable.consume( viewLink, consumableAttributes ) ) {
				// Might be consumed by something else - i.e. other converter with priority=highest - a standard check.
				return;
			}

			const linkHref = viewLink.getAttribute( 'href' );

			// Missing the 'href' attribute.
			if ( !linkHref ) {
				return;
			}

			// A full definition of the image feature.
			// figure > a > img: parent of the link element is an image element.
			let modelElement = data.modelCursor.parent;

			if ( !modelElement.is( 'image' ) ) {
				// a > img: parent of the link is not the image element. We need to convert it manually.
				const conversionResult = conversionApi.convertItem( imageInLink, data.modelCursor );

				// Set image range as conversion result.
				data.modelRange = conversionResult.modelRange;

				// Continue conversion where image conversion ends.
				data.modelCursor = conversionResult.modelCursor;

				modelElement = data.modelCursor.nodeBefore;
			}

			if ( modelElement && modelElement.is( 'image' ) ) {
				// Set the linkHref attribute from link element on model image element.
				conversionApi.writer.setAttribute( 'linkHref', linkHref, modelElement );
			}
		}, { priority: 'high' } );
	};
}

// Return a converter that adds the `<a>` element to data.
//
// @private
// @returns {Function}
//
function downcastImageLink() {
	return dispatcher => {
		dispatcher.on( 'attribute:linkHref:image', ( evt, data, conversionApi ) => {
			// The image will be already converted - so it will be present in the view.
			const viewFigure = conversionApi.mapper.toViewElement( data.item );
			const writer = conversionApi.writer;

			// But we need to check whether the link element exists.
			const linkInImage = Array.from( viewFigure.getChildren() ).find( child => child.name === 'a' );

			// Create an icon indicator for a linked image.
			const linkIconIndicator = writer.createUIElement( 'span', { class: 'ck ck-link-image_icon' }, function( domDocument ) {
				const domElement = this.toDomElement( domDocument );
				domElement.innerHTML = linkIcon;

				return domElement;
			} );

			// If so, update the attribute if it's defined or remove the entire link if the attribute is empty.
			if ( linkInImage ) {
				if ( data.attributeNewValue ) {
					writer.setAttribute( 'href', data.attributeNewValue, linkInImage );
				} else {
					const viewImage = Array.from( linkInImage.getChildren() ).find( child => child.name === 'img' );

					writer.move( writer.createRangeOn( viewImage ), writer.createPositionAt( viewFigure, 0 ) );
					writer.remove( linkInImage );
				}
			} else {
				// But if it does not exist. Let's wrap already converted image by newly created link element.
				// 1. Create an empty link element.
				const linkElement = writer.createContainerElement( 'a', { href: data.attributeNewValue } );

				// 2. Insert link inside the associated image.
				writer.insert( writer.createPositionAt( viewFigure, 0 ), linkElement );

				// 3. Move the image to the link.
				writer.move( writer.createRangeOn( viewFigure.getChild( 1 ) ), writer.createPositionAt( linkElement, 0 ) );

				// 4. Inset the linked image icon indicator.
				writer.insert( writer.createPositionAt( linkElement, 'end' ), linkIconIndicator );
			}
		} );
	};
}
