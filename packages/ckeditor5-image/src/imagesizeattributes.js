/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/imageresizeediting
 */

import { Plugin } from 'ckeditor5/src/core';
import ImageUtils from './imageutils';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageSizeAttributes extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageUtils ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageSizeAttributes';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._registerSchema();
		this._registerConverters( 'imageBlock' );
		this._registerConverters( 'imageInline' );
	}

	/**
	 * @private
	 */
	_registerSchema() {
		if ( this.editor.plugins.has( 'ImageBlockEditing' ) ) {
			this.editor.model.schema.extend( 'imageBlock', { allowAttributes: [ 'widthAttribute', 'heightAttribute' ] } );
		}

		if ( this.editor.plugins.has( 'ImageInlineEditing' ) ) {
			this.editor.model.schema.extend( 'imageInline', { allowAttributes: [ 'widthAttribute', 'heightAttribute' ] } );
		}
	}

	/**
	 * Registers converters for `width` and `height` attributes.
	 *
	 * @private
	 * @param {'imageBlock'|'imageInline'} imageType The type of the image.
	 */
	_registerConverters( imageType ) {
		const editor = this.editor;
		const imageUtils = editor.plugins.get( 'ImageUtils' );
		const viewElementName = imageType === 'imageBlock' ? 'figure' : 'img';

		editor.conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: viewElementName,
					attributes: {
						width: /.+/
					}
				},
				model: {
					key: 'widthAttribute',
					value: viewElement => viewElement.getAttribute( 'width' )
				}
			} )
			.attributeToAttribute( {
				view: {
					name: viewElementName,
					attributes: {
						height: /.+/
					}
				},
				model: {
					key: 'heightAttribute',
					value: viewElement => viewElement.getAttribute( 'height' )
				}
			} );

		// Dedicated converter to propagate attributes to the <img> element.
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( `attribute:widthAttribute:${ imageType }`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewElement = conversionApi.mapper.toViewElement( data.item );
				const img = imageUtils.findViewImgElement( viewElement );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setAttribute( 'width', data.attributeNewValue, img );
				} else {
					viewWriter.removeAttribute( 'width', img );
				}
			} );

			dispatcher.on( `attribute:heightAttribute:${ imageType }`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewElement = conversionApi.mapper.toViewElement( data.item );
				const img = imageUtils.findViewImgElement( viewElement );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setAttribute( 'height', data.attributeNewValue, img );
				} else {
					viewWriter.removeAttribute( 'height', img );
				}
			} );
		} );
	}
}
