/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagesizeattributes
 */

import { Plugin } from 'ckeditor5/src/core';
import type { DowncastDispatcher, DowncastAttributeEvent, ViewElement, Element } from 'ckeditor5/src/engine';
import ImageUtils from './imageutils';

/**
 * This plugin enables `width` and `size` attributes in inline and block image elements.
 */
export default class ImageSizeAttributes extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageSizeAttributes' {
		return 'ImageSizeAttributes';
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		this._registerSchema();
		this._registerConverters( 'imageBlock' );
		this._registerConverters( 'imageInline' );
	}

	/**
	 * Registers the `width` and `height` attributes for inline and block images.
	 */
	private _registerSchema(): void {
		if ( this.editor.plugins.has( 'ImageBlockEditing' ) ) {
			this.editor.model.schema.extend( 'imageBlock', { allowAttributes: [ 'width', 'height' ] } );
		}

		if ( this.editor.plugins.has( 'ImageInlineEditing' ) ) {
			this.editor.model.schema.extend( 'imageInline', { allowAttributes: [ 'width', 'height' ] } );
		}
	}

	/**
	 * Registers converters for `width` and `height` attributes.
	 */
	private _registerConverters( imageType: 'imageBlock' | 'imageInline' ): void {
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
					key: 'width',
					value: ( viewElement: ViewElement ) => viewElement.getAttribute( 'width' )
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
					key: 'height',
					value: ( viewElement: ViewElement ) => viewElement.getAttribute( 'height' )
				}
			} );

		// Dedicated converter to propagate attributes to the <img> element.
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			attachDowncastConverter( dispatcher, 'width', 'width' );
			attachDowncastConverter( dispatcher, 'height', 'height' );
		} );

		function attachDowncastConverter( dispatcher: DowncastDispatcher, modelAttributeName: string, viewAttributeName: string ) {
			dispatcher.on<DowncastAttributeEvent>( `attribute:${ modelAttributeName }:${ imageType }`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewElement = conversionApi.mapper.toViewElement( data.item as Element )!;
				const img = imageUtils.findViewImgElement( viewElement )!;

				if ( data.attributeNewValue !== null ) {
					viewWriter.setAttribute( viewAttributeName, data.attributeNewValue, img );
				} else {
					viewWriter.removeAttribute( viewAttributeName, img );
				}
			} );
		}
	}
}
