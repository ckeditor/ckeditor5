/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresizeediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageResizeCommand from './imageresizecommand';

/**
 * The image resize editing feature.
 *
 * It adds a possibility to resize each image using handles or manually by
 * {@link module:image/imageresize/imageresizeui~ImageResizeUI} buttons.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResizeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageResizeEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const command = new ImageResizeCommand( editor );

		this._registerSchema();
		this._registerConverters();

		editor.commands.add( 'imageResize', command );
	}

	/**
	 * @private
	 */
	_registerSchema() {
		this.editor.model.schema.extend( 'image', { allowAttributes: 'width' } );
		this.editor.model.schema.setAttributeProperties( 'width', {
			isFormatting: true
		} );
	}

	/**
	 * Registers image resize converters.
	 *
	 * @private
	 */
	_registerConverters() {
		const editor = this.editor;

		// Dedicated converter to propagate image's attribute to the img tag.
		editor.conversion.for( 'downcast' ).add( dispatcher =>
			dispatcher.on( 'attribute:width:image', ( evt, data, conversionApi ) => {
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
					name: 'figure',
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
