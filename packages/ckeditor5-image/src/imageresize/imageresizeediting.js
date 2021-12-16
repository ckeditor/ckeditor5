/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/imageresizeediting
 */

import { Plugin } from 'ckeditor5/src/core';
import ImageUtils from '../imageutils';
import ResizeImageCommand from './resizeimagecommand';

/**
 * The image resize editing feature.
 *
 * It adds the ability to resize each image using handles or manually by
 * {@link module:image/imageresize/imageresizebuttons~ImageResizeButtons} buttons.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResizeEditing extends Plugin {
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
		return 'ImageResizeEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'image', {
			resizeUnit: '%',
			resizeOptions: [ {
				name: 'resizeImage:original',
				value: null,
				icon: 'original'
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
			} ]
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const resizeImageCommand = new ResizeImageCommand( editor );

		this._registerSchema();
		this._registerConverters( 'imageBlock' );
		this._registerConverters( 'imageInline' );

		// Register `resizeImage` command and add `imageResize` command as an alias for backward compatibility.
		editor.commands.add( 'resizeImage', resizeImageCommand );
		editor.commands.add( 'imageResize', resizeImageCommand );
	}

	/**
	 * @private
	 */
	_registerSchema() {
		if ( this.editor.plugins.has( 'ImageBlockEditing' ) ) {
			this.editor.model.schema.extend( 'imageBlock', { allowAttributes: 'width' } );
		}

		if ( this.editor.plugins.has( 'ImageInlineEditing' ) ) {
			this.editor.model.schema.extend( 'imageInline', { allowAttributes: 'width' } );
		}
	}

	/**
	 * Registers image resize converters.
	 *
	 * @private
	 * @param {'imageBlock'|'imageInline'} imageType The type of the image.
	 */
	_registerConverters( imageType ) {
		const editor = this.editor;

		// Dedicated converter to propagate image's attribute to the img tag.
		editor.conversion.for( 'downcast' ).add( dispatcher =>
			dispatcher.on( `attribute:width:${ imageType }`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const figure = conversionApi.mapper.toViewElement( data.item );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setStyle( 'width', data.attributeNewValue, figure );
					viewWriter.addClass( 'image_resized', figure );
				} else {
					viewWriter.removeStyle( 'width', figure );
					viewWriter.removeClass( 'image_resized', figure );
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
					key: 'width',
					value: viewElement => viewElement.getStyle( 'width' )
				}
			} );
	}
}
