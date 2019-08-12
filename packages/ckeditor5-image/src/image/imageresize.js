/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imageresize
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetResizer from '@ckeditor/ckeditor5-widget/src/widgetresizer';

const WIDTH_ATTRIBUTE_NAME = 'width';

/**
 *	Image resize plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResize extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ WidgetResizer ];
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

		editor.editing.downcastDispatcher.on( 'insert:image', ( evt, data, conversionApi ) => {
			const widget = conversionApi.mapper.toViewElement( data.item );

			editor.plugins.get( 'WidgetResizer' ).apply( widget, conversionApi.writer, {
				getResizeHost( wrapper ) {
					return wrapper.querySelector( 'img' );
				},
				getAspectRatio( resizeHost ) {
					return resizeHost.naturalWidth / resizeHost.naturalHeight;
				},
				isCentered( context ) {
					const imageStyle = context._getModel( editor, context.widgetWrapperElement ).getAttribute( 'imageStyle' );

					return !imageStyle || imageStyle == 'full';
				}
			} );
		}, {
			priority: 'low'
		} );

		this._registerSchema();
		this._registerConverters();
	}

	/**
	 * @private
	 */
	_registerSchema() {
		this.editor.model.schema.extend( 'image', {
			allowAttributes: WIDTH_ATTRIBUTE_NAME
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
				const img = conversionApi.mapper.toViewElement( data.item ).getChild( 0 );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setStyle( WIDTH_ATTRIBUTE_NAME, data.attributeNewValue + 'px', img );
				} else {
					viewWriter.removeStyle( WIDTH_ATTRIBUTE_NAME, img );
				}
			} )
		);

		editor.conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'img',
					styles: {
						'width': /[\d.]+(px)?/
					}
				},
				model: {
					key: WIDTH_ATTRIBUTE_NAME,
					value: viewElement => viewElement.getStyle( 'width' ).replace( 'px', '' )
				}
			} );
	}
}
