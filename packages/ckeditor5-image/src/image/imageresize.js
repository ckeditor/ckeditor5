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

const WIDTH_STYLE_NAME = WIDTH_ATTRIBUTE_NAME;

const RESIZE_CLASS_NAME = 'ck_resized';

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

			const context = editor.plugins.get( 'WidgetResizer' ).apply( widget, conversionApi.writer, {
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

			context.on( 'begin', function( evt ) {
				evt.source._temporaryResizeClassAdded = !evt.source.domResizeWrapper.parentElement.classList.contains( RESIZE_CLASS_NAME );

				this._temporaryResizeClassAdded = !this.domResizeWrapper.parentElement.classList.contains( RESIZE_CLASS_NAME );
			}, {
				priority: 'high'
			} );

			context.on( 'updateSize', function() {
				if ( this._temporaryResizeClassAdded ) {
					this.domResizeWrapper.parentElement.classList.add( RESIZE_CLASS_NAME );
				}
			} );

			context.on( 'cancel', () => {
				if ( this._temporaryResizeClassAdded ) {
					this.domResizeWrapper.parentElement.classList.remove( RESIZE_CLASS_NAME );
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
			dispatcher.on( `attribute:${ WIDTH_ATTRIBUTE_NAME }:image`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const figure = conversionApi.mapper.toViewElement( data.item );
				const img = figure.getChild( 0 );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setStyle( WIDTH_ATTRIBUTE_NAME, data.attributeNewValue + 'px', img );
					viewWriter.addClass( RESIZE_CLASS_NAME, figure );
				} else {
					viewWriter.removeStyle( WIDTH_ATTRIBUTE_NAME, img );
					viewWriter.removeClass( RESIZE_CLASS_NAME, figure );
				}
			} )
		);

		editor.conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'img',
					styles: {
						[ WIDTH_STYLE_NAME ]: /[\d.]+(px)?/
					}
				},
				model: {
					key: WIDTH_ATTRIBUTE_NAME,
					value: viewElement => viewElement.getStyle( WIDTH_STYLE_NAME ).replace( 'px', '' )
				}
			} );
	}
}
