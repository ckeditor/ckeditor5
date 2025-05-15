/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imagesizeattributes
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { DowncastDispatcher, DowncastAttributeEvent, ViewElement, Element } from 'ckeditor5/src/engine.js';
import ImageUtils from './imageutils.js';
import { widthAndHeightStylesAreBothSet, getSizeValueIfInPx } from './image/utils.js';

/**
 * This plugin enables `width` and `height` attributes in inline and block image elements.
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
	public static get pluginName() {
		return 'ImageSizeAttributes' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
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
					styles: {
						width: /.+/
					}
				},
				model: {
					key: 'width',
					value: ( viewElement: ViewElement ) => {
						if ( widthAndHeightStylesAreBothSet( viewElement ) ) {
							return getSizeValueIfInPx( viewElement.getStyle( 'width' ) );
						}

						return null;
					}
				}
			} )
			.attributeToAttribute( {
				view: {
					name: viewElementName,
					key: 'width'
				},
				model: 'width'
			} )
			.attributeToAttribute( {
				view: {
					name: viewElementName,
					styles: {
						height: /.+/
					}
				},
				model: {
					key: 'height',
					value: ( viewElement: ViewElement ) => {
						if ( widthAndHeightStylesAreBothSet( viewElement ) ) {
							return getSizeValueIfInPx( viewElement.getStyle( 'height' ) );
						}

						return null;
					}
				}
			} )
			.attributeToAttribute( {
				view: {
					name: viewElementName,
					key: 'height'
				},
				model: 'height'
			} );

		// Dedicated converters to propagate attributes to the <img> element.
		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			attachDowncastConverter( dispatcher, 'width', 'width', true, true );
			attachDowncastConverter( dispatcher, 'height', 'height', true, true );
		} );

		editor.conversion.for( 'dataDowncast' ).add( dispatcher => {
			attachDowncastConverter( dispatcher, 'width', 'width', false );
			attachDowncastConverter( dispatcher, 'height', 'height', false );
		} );

		// Consume `aspect-ratio` style if `width` and `height` attributes are set on the image.
		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( 'element:img', ( evt, data, conversionApi ) => {
				const width = data.viewItem.getAttribute( 'width' );
				const height = data.viewItem.getAttribute( 'height' );

				if ( width && height ) {
					conversionApi.consumable.consume( data.viewItem, { styles: [ 'aspect-ratio' ] } );
				}
			} );
		} );

		function attachDowncastConverter(
			dispatcher: DowncastDispatcher,
			modelAttributeName: string,
			viewAttributeName: string,
			setRatioForInlineImage: boolean,
			isEditingDowncast: boolean = false
		) {
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

				const width = data.item.getAttribute( 'width' );
				const height = data.item.getAttribute( 'height' );
				const hasSizes = width && height;

				if ( hasSizes && isEditingDowncast ) {
					viewWriter.setAttribute( 'loading', 'lazy', img );
				}

				// Do not set aspect-ratio for pictures. See https://github.com/ckeditor/ckeditor5/issues/14579.
				if ( data.item.hasAttribute( 'sources' ) ) {
					return;
				}

				const isResized = data.item.hasAttribute( 'resizedWidth' );

				// Do not set aspect ratio for inline images which are not resized (data pipeline).
				if ( imageType === 'imageInline' && !isResized && !setRatioForInlineImage ) {
					return;
				}

				if ( hasSizes ) {
					viewWriter.setStyle( 'aspect-ratio', `${ width }/${ height }`, img );
				}
			} );
		}
	}
}

