/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/imageresizehandles
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetResize from '@ckeditor/ckeditor5-widget/src/widgetresize';
import ImageLoadObserver from './../image/imageloadobserver';

/**
 * The image resize by handles feature.
 *
 * It adds the ability to resize each image using handles or manually by
 * {@link module:image/imageresize/imageresizebuttons~ImageResizeButtons} buttons.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResizeHandles extends Plugin {
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
		return 'ImageResizeHandles';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const command = editor.commands.get( 'imageResize' );
		const editingView = editor.editing.view;

		editingView.addObserver( ImageLoadObserver );

		this.bind( 'isEnabled' ).to( command );

		editor.editing.downcastDispatcher.on( 'insert:image', ( evt, data, conversionApi ) => {
			const widget = conversionApi.mapper.toViewElement( data.item );

			// @todo: check if can be cleaned up
			editingView.change( writer => {
				writer.addClass( 'image_resizer_loading', widget );
			} );

			const resizer = editor.plugins
				.get( WidgetResize )
				.attachTo( {
					unit: editor.config.get( 'image.resizeUnit' ),

					modelElement: data.item,
					viewElement: widget,
					editor,

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
					editingView.change( writer => {
						writer.addClass( 'image_resized', widget );
					} );
				}
			} );

			this._hideResizerUntilImageIsLoaded( resizer, widget );

			resizer.bind( 'isEnabled' ).to( this );
		}, { priority: 'low' } );
	}

	/**
	 * @private
	 * @param {module:widget/widgetresize/resizer~Resizer} resizer
	 * @param {module:engine/view/containerelement~ContainerElement} widget
	 */
	_hideResizerUntilImageIsLoaded( resizer, widget ) {
		// Mitigation logic for #8088 (which is caused by a more complex problem #7548).
		const editingView = this.editor.editing.view;

		editingView.change( writer => {
			writer.addClass( 'image_resizer_loading', widget );
		} );

		editingView.document.on( 'imageLoaded', imageLoadCallback );

		function imageLoadCallback( evt, domEvent ) {
			const handleHost = resizer._getHandleHost();

			if ( domEvent.target.isSameNode( handleHost ) ) {
				editingView.change( writer => {
					resizer.redraw();
					writer.removeClass( 'image_resizer_loading', widget );
				} );

				// Remove image load listener for optimization, as it is no longer needed.
				editingView.document.off( 'imageLoaded', imageLoadCallback );
			}
		}
	}
}
