/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/imageresizehandles
 */

import type { Element, ViewContainerElement, ViewElement } from 'ckeditor5/src/engine';
import { Plugin } from 'ckeditor5/src/core';
import { WidgetResize } from 'ckeditor5/src/widget';

import ImageLoadObserver, { type ImageLoadedEvent } from '../image/imageloadobserver';
import type ResizeImageCommand from './resizeimagecommand';

const RESIZABLE_IMAGES_CSS_SELECTOR =
	'figure.image.ck-widget > img,' +
	'figure.image.ck-widget > picture > img,' +
	'figure.image.ck-widget > a > img,' +
	'figure.image.ck-widget > a > picture > img,' +
	'span.image-inline.ck-widget > img,' +
	'span.image-inline.ck-widget > picture > img';

const IMAGE_WIDGETS_CLASSES_MATCH_REGEXP = /(image|image-inline)/;

const RESIZED_IMAGE_CLASS = 'image_resized';

/**
 * The image resize by handles feature.
 *
 * It adds the ability to resize each image using handles or manually by
 * {@link module:image/imageresize/imageresizebuttons~ImageResizeButtons} buttons.
 */
export default class ImageResizeHandles extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ WidgetResize ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageResizeHandles' {
		return 'ImageResizeHandles';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const command: ResizeImageCommand = this.editor.commands.get( 'resizeImage' )!;
		this.bind( 'isEnabled' ).to( command );

		this._setupResizerCreator();
	}

	/**
	 * Attaches the listeners responsible for creating a resizer for each image, except for images inside the HTML embed preview.
	 */
	private _setupResizerCreator(): void {
		const editor = this.editor;
		const editingView = editor.editing.view;

		editingView.addObserver( ImageLoadObserver );

		this.listenTo<ImageLoadedEvent>( editingView.document, 'imageLoaded', ( evt, domEvent ) => {
			// The resizer must be attached only to images loaded by the `ImageInsert`, `ImageUpload` or `LinkImage` plugins.
			if ( !( domEvent.target as HTMLElement ).matches( RESIZABLE_IMAGES_CSS_SELECTOR ) ) {
				return;
			}

			const domConverter = editor.editing.view.domConverter;
			const imageView = domConverter.domToView( domEvent.target as HTMLElement ) as ViewElement;
			const widgetView = imageView.findAncestor( { classes: IMAGE_WIDGETS_CLASSES_MATCH_REGEXP } ) as ViewContainerElement;
			let resizer = this.editor.plugins.get( WidgetResize ).getResizerByViewElement( widgetView );

			if ( resizer ) {
				// There are rare cases when the image will be triggered multiple times for the same widget, e.g. when
				// the image's source was changed after upload (https://github.com/ckeditor/ckeditor5/pull/8108#issuecomment-708302992).
				resizer.redraw();

				return;
			}

			const mapper = editor.editing.mapper;
			const imageModel = mapper.toModelElement( widgetView )!;

			resizer = editor.plugins
				.get( WidgetResize )
				.attachTo( {
					unit: editor.config.get( 'image.resizeUnit' )!,

					modelElement: imageModel,
					viewElement: widgetView,
					editor,

					getHandleHost( domWidgetElement ) {
						return domWidgetElement.querySelector( 'img' )!;
					},
					getResizeHost() {
						// Return the model image element parent to avoid setting an inline element (<a>/<span>) as a resize host.
						return domConverter.mapViewToDom( mapper.toViewElement( imageModel.parent as Element )! ) as HTMLElement;
					},
					// TODO consider other positions.
					isCentered() {
						const imageStyle = imageModel.getAttribute( 'imageStyle' );

						return !imageStyle || imageStyle == 'block' || imageStyle == 'alignCenter';
					},

					onCommit( newValue ) {
						// Get rid of the CSS class in case the command execution that follows is unsuccessful
						// (e.g. Track Changes can override it and the new dimensions will not apply). Otherwise,
						// the presence of the class and the absence of the width style will cause it to take 100%
						// of the horizontal space.
						editingView.change( writer => {
							writer.removeClass( RESIZED_IMAGE_CLASS, widgetView );
						} );

						editor.execute( 'resizeImage', { width: newValue } );
					}
				} );

			resizer.on( 'updateSize', () => {
				if ( !widgetView.hasClass( RESIZED_IMAGE_CLASS ) ) {
					editingView.change( writer => {
						writer.addClass( RESIZED_IMAGE_CLASS, widgetView );
					} );
				}
			} );

			resizer.bind( 'isEnabled' ).to( this );
		} );
	}
}
