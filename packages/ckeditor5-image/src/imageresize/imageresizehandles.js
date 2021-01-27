/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/imageresizehandles
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetResize from '@ckeditor/ckeditor5-widget/src/widgetresize';
import ImageLoadObserver from '../image/imageloadobserver';

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
		const command = this.editor.commands.get( 'imageResize' );
		this.bind( 'isEnabled' ).to( command );

		this._setupResizerCreator();
	}

	/**
	 * Attaches the listeners responsible for creating a resizer for each image, except for images inside the HTML embed preview.
	 *
	 * @private
	 */
	_setupResizerCreator() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		editingView.addObserver( ImageLoadObserver );

		this.listenTo( editingView.document, 'imageLoaded', ( evt, domEvent ) => {
			// The resizer must be attached only to images loaded by the `ImageInsert`, `ImageUpload` or `LinkImage` plugins.
			if ( !domEvent.target.matches( 'figure.image.ck-widget > img, figure.image.ck-widget > a > img' ) ) {
				return;
			}

			const imageView = editor.editing.view.domConverter.domToView( domEvent.target );
			const widgetView = imageView.findAncestor( 'figure' );
			let resizer = this.editor.plugins.get( WidgetResize ).getResizerByViewElement( widgetView );

			if ( resizer ) {
				// There are rare cases when the image will be triggered multiple times for the same widget, e.g. when
				// the image's source was changed after upload (https://github.com/ckeditor/ckeditor5/pull/8108#issuecomment-708302992).
				resizer.redraw();

				return;
			}

			const mapper = editor.editing.mapper;
			const imageModel = mapper.toModelElement( widgetView );

			resizer = editor.plugins
				.get( WidgetResize )
				.attachTo( {
					unit: editor.config.get( 'image.resizeUnit' ),

					modelElement: imageModel,
					viewElement: widgetView,
					editor,

					getHandleHost( domWidgetElement ) {
						return domWidgetElement.querySelector( 'img' );
					},
					getResizeHost( domWidgetElement ) {
						return domWidgetElement;
					},
					// TODO consider other positions.
					isCentered() {
						const imageStyle = imageModel.getAttribute( 'imageStyle' );

						return !imageStyle || imageStyle == 'full' || imageStyle == 'alignCenter';
					},

					onCommit( newValue ) {
						editor.execute( 'imageResize', { width: newValue } );
					}
				} );

			resizer.on( 'updateSize', () => {
				if ( !widgetView.hasClass( 'image_resized' ) ) {
					editingView.change( writer => {
						writer.addClass( 'image_resized', widgetView );
					} );
				}
			} );

			resizer.bind( 'isEnabled' ).to( this );
		} );
	}
}
