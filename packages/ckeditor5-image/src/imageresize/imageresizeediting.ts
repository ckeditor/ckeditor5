/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageresize/imageresizeediting
 */

import type { ViewElement } from 'ckeditor5/src/engine.js';
import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import ImageUtils from '../imageutils.js';
import ResizeImageCommand from './resizeimagecommand.js';
import { widthAndHeightStylesAreBothSet } from '../image/utils.js';

/**
 * The image resize editing feature.
 *
 * It adds the ability to resize each image using handles or manually by
 * {@link module:image/imageresize/imageresizebuttons~ImageResizeButtons} buttons.
 */
export default class ImageResizeEditing extends Plugin {
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
		return 'ImageResizeEditing' as const;
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
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'image', {
			resizeUnit: '%',
			resizeOptions: [
				{
					name: 'resizeImage:original',
					value: null,
					icon: 'original'
				},
				{
					name: 'resizeImage:custom',
					value: 'custom',
					icon: 'custom'
				},
				{
					name: 'resizeImage:25',
					value: '25',
					icon: 'small'
				},
				{
					name: 'resizeImage:50',
					value: '50',
					icon: 'medium'
				},
				{
					name: 'resizeImage:75',
					value: '75',
					icon: 'large'
				}
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const resizeImageCommand = new ResizeImageCommand( editor );

		this._registerConverters( 'imageBlock' );
		this._registerConverters( 'imageInline' );

		// Register `resizeImage` command and add `imageResize` command as an alias for backward compatibility.
		editor.commands.add( 'resizeImage', resizeImageCommand );
		editor.commands.add( 'imageResize', resizeImageCommand );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		this._registerSchema();
	}

	private _registerSchema(): void {
		if ( this.editor.plugins.has( 'ImageBlockEditing' ) ) {
			this.editor.model.schema.extend( 'imageBlock', { allowAttributes: [ 'resizedWidth', 'resizedHeight' ] } );
		}

		if ( this.editor.plugins.has( 'ImageInlineEditing' ) ) {
			this.editor.model.schema.extend( 'imageInline', { allowAttributes: [ 'resizedWidth', 'resizedHeight' ] } );
		}
	}

	/**
	 * Registers image resize converters.
	 *
	 * @param imageType The type of the image.
	 */
	private _registerConverters( imageType: 'imageBlock' | 'imageInline' ) {
		const editor = this.editor;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

		// Dedicated converter to propagate image's attribute to the img tag.
		editor.conversion.for( 'downcast' ).add( dispatcher =>
			dispatcher.on( `attribute:resizedWidth:${ imageType }`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewImg = conversionApi.mapper.toViewElement( data.item );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setStyle( 'width', data.attributeNewValue, viewImg );
					viewWriter.addClass( 'image_resized', viewImg );
				} else {
					viewWriter.removeStyle( 'width', viewImg );
					viewWriter.removeClass( 'image_resized', viewImg );
				}
			} )
		);

		editor.conversion.for( 'dataDowncast' ).attributeToAttribute( {
			model: {
				name: imageType,
				key: 'resizedHeight'
			},
			view: modelAttributeValue => ( {
				key: 'style',
				value: {
					'height': modelAttributeValue
				}
			} )
		} );

		editor.conversion.for( 'editingDowncast' ).add( dispatcher =>
			dispatcher.on( `attribute:resizedHeight:${ imageType }`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewImg = conversionApi.mapper.toViewElement( data.item );
				const target = imageType === 'imageInline' ? imageUtils.findViewImgElement( viewImg ) : viewImg;

				if ( data.attributeNewValue !== null ) {
					viewWriter.setStyle( 'height', data.attributeNewValue, target );
				} else {
					viewWriter.removeStyle( 'height', target );
				}
			} )
		);

		editor.conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: imageType === 'imageBlock' ? 'figure' : 'img',
					styles: {
						width: /.+/
					}
				},
				model: {
					key: 'resizedWidth',
					value: ( viewElement: ViewElement ) => {
						if ( widthAndHeightStylesAreBothSet( viewElement ) ) {
							return null;
						}

						return viewElement.getStyle( 'width' );
					}
				}
			} );

		editor.conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: imageType === 'imageBlock' ? 'figure' : 'img',
					styles: {
						height: /.+/
					}
				},
				model: {
					key: 'resizedHeight',
					value: ( viewElement: ViewElement ) => {
						if ( widthAndHeightStylesAreBothSet( viewElement ) ) {
							return null;
						}

						return viewElement.getStyle( 'height' );
					}
				}
			} );

		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( `element:${ imageType === 'imageBlock' ? 'figure' : 'img' }`, ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { classes: [ 'image_resized' ] } );
			} );
		} );
	}
}
