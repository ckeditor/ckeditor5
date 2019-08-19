/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetResize from '@ckeditor/ckeditor5-widget/src/widgetresize';
import ImageResizeCommand from './imageresize/imageresizecommand';

import '../theme/imageresize.css';

/**
 * The image resize plugin.
 *
 * It adds a possibility to resize each image using handles.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResize extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ WidgetResize ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageResize';
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

		editor.editing.downcastDispatcher.on( 'insert:image', ( evt, data, conversionApi ) => {
			const widget = conversionApi.mapper.toViewElement( data.item );

			const resizer = editor.plugins
				.get( WidgetResize )
				.attachTo( {
					unit: editor.config.get( 'image.resizeUnit' ) || '%',

					modelElement: data.item,
					viewElement: widget,
					downcastWriter: conversionApi.writer,

					getHandleHost( domWidgetElement ) {
						return domWidgetElement.querySelector( 'img' );
					},
					getResizeHost( domWidgetElement ) {
						return domWidgetElement;
					},
					// TODO consider other positions.
					isCentered() {
						const imageStyle = data.item.getAttribute( 'imageStyle' );

						return !imageStyle || imageStyle == 'full' || imageStyle == 'alignCenter';
					},

					onCommit( newValue ) {
						editor.execute( 'imageResize', { width: newValue } );
					}
				} );

			resizer.on( 'updateSize', () => {
				if ( !widget.hasClass( 'image_resized' ) ) {
					editor.editing.view.change( writer => {
						writer.addClass( 'image_resized', widget );
					} );
				}
			} );

			resizer.bind( 'isEnabled' ).to( command );
		}, { priority: 'low' } );
	}

	/**
	 * @private
	 */
	_registerSchema() {
		this.editor.model.schema.extend( 'image', {
			allowAttributes: 'width'
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

/**
 * The available options are `'px'` or `'%'`.
 *
 * Determines size unit applied to resized image.
 *
 * ```js
 * ClassicEditor
 * 	.create( editorElement, {
 * 		 image: {
 * 			 resizeUnit: 'px'
 * 		 }
 * 	 } )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * This option is used by the {@link module:image/imageresize~ImageResize} feature.
 *
 * @default '%'
 * @member {String} module:image/image~ImageConfig#resizeUnit
 */
