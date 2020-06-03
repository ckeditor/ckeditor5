/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkimageediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Image from '@ckeditor/ckeditor5-image/src/image';
import LinkEditing from './linkediting';

export default class LinkImageEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Image, LinkEditing ];
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

		editor.conversion.for( 'upcast' ).add( this._upcastLink() );
		editor.conversion.for( 'upcast' ).add( this._upcastImageLink( 'img' ) );
		editor.conversion.for( 'upcast' ).add( this._upcastImageLink( 'figure' ) );
		editor.conversion.for( 'downcast' ).add( this._downcastImageLink() );
	}

	/**
	 * Returns a converter that consumes the 'href' attribute if a link contains an image.
	 *
	 * @private
	 * @returns {Function}
	 */
	_upcastLink() {
		return dispatcher => {
			dispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
				const viewLink = data.viewItem;
				const imageInLink = Array.from( viewLink.getChildren() ).find( child => child.name === 'img' );

				if ( imageInLink ) {
					// There's an image inside an <a> element - we consume it so it won't be picked up by the Link plugin.
					const consumableAttributes = { attributes: [ 'href' ] };

					// Consume the link so the default one will not convert it to $text attribute.
					if ( !conversionApi.consumable.test( viewLink, consumableAttributes ) ) {
						// Might be consumed by something else - i.e. other converter with priority=highest - a standard check.
						return;
					}

					// Consume 'linkHref' attribute from link element.
					conversionApi.consumable.consume( viewLink, consumableAttributes );
				}
			}, { priority: 'high' } );
		};
	}

	/**
	 * Returns a converter for links that wraps the `<img>` element.
	 *
	 * @private
	 * @param {String} elementName Name of the element to upcast.
	 * @returns {Function}
	 */
	_upcastImageLink( elementName ) {
		return dispatcher => {
			dispatcher.on( `element:${ elementName }`, ( evt, data, conversionApi ) => {
				const viewImage = data.viewItem;
				const parent = viewImage.parent;

				// Check only <img>/<figure> that are direct children of a link.
				if ( parent.name === 'a' ) {
					const modelImage = data.modelCursor.nodeBefore;
					const linkHref = parent.getAttribute( 'href' );

					if ( modelImage && linkHref ) {
						// Set the linkHref attribute from link element on model image element.
						conversionApi.writer.setAttribute( 'linkHref', linkHref, modelImage );
					}
				}
			} );
		};
	}

	/**
	 * Return a converter that adds the `<a>` element to data.
	 *
	 * @private
	 * @returns {Function}
	 */
	_downcastImageLink() {
		return dispatcher => {
			dispatcher.on( 'attribute:linkHref:image', ( evt, data, conversionApi ) => {
				// The image will be already converted - so it will be present in the view.
				const viewImage = conversionApi.mapper.toViewElement( data.item );

				// Below will wrap already converted image by newly created link element.
				const writer = conversionApi.writer;

				// 1. Create an empty link element.
				const linkElement = writer.createContainerElement( 'a', { href: data.attributeNewValue } );

				// 2. Insert link inside the associated image.
				writer.insert( writer.createPositionAt( viewImage, 0 ), linkElement );

				// 3. Move the image to the link.
				writer.move( writer.createRangeOn( viewImage.getChild( 1 ) ), writer.createPositionAt( linkElement, 0 ) );
			} );
		};
	}
}
