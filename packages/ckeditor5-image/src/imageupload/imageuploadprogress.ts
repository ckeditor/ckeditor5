/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageupload/imageuploadprogress
 */

import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import { FileRepository, type FileLoader } from 'ckeditor5/src/upload.js';

import '../../theme/imageuploadprogress.css';
import '../../theme/imageuploadicon.css';
import '../../theme/imageuploadloader.css';
import type { GetCallback } from 'ckeditor5/src/utils.js';
import type {
	DowncastWriter,
	EditingView,
	ViewElement,
	ViewContainerElement,
	ViewUIElement,
	DowncastAttributeEvent,
	Element
} from 'ckeditor5/src/engine.js';
import type ImageUtils from '../imageutils.js';

/**
 * The image upload progress plugin.
 * It shows a placeholder when the image is read from the disk and a progress bar while the image is uploading.
 */
export default class ImageUploadProgress extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageUploadProgress' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * The image placeholder that is displayed before real image data can be accessed.
	 *
	 * For the record, this image is a 1x1 px GIF with an aspect ratio set by CSS.
	 */
	private placeholder: string;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this.placeholder = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		// Upload status change - update image's view according to that status.
		if ( editor.plugins.has( 'ImageBlockEditing' ) ) {
			editor.editing.downcastDispatcher.on<DowncastAttributeEvent>(
				'attribute:uploadStatus:imageBlock',
				this.uploadStatusChange
			);
		}

		if ( editor.plugins.has( 'ImageInlineEditing' ) ) {
			editor.editing.downcastDispatcher.on<DowncastAttributeEvent>(
				'attribute:uploadStatus:imageInline',
				this.uploadStatusChange
			);
		}
	}

	/**
	 * This method is called each time the image `uploadStatus` attribute is changed.
	 *
	 * @param evt An object containing information about the fired event.
	 * @param data Additional information about the change.
	 */
	private uploadStatusChange: GetCallback<DowncastAttributeEvent> = ( evt, data, conversionApi ) => {
		const editor = this.editor;
		const modelImage = data.item as Element;
		const uploadId = modelImage.getAttribute( 'uploadId' ) as string | number;

		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
		const fileRepository = editor.plugins.get( FileRepository );
		const status = uploadId ? data.attributeNewValue : null;
		const placeholder = this.placeholder;
		const viewFigure = editor.editing.mapper.toViewElement( modelImage )! as ViewContainerElement;
		const viewWriter = conversionApi.writer;

		if ( status == 'reading' ) {
			// Start "appearing" effect and show placeholder with infinite progress bar on the top
			// while image is read from disk.
			_startAppearEffect( viewFigure, viewWriter );
			_showPlaceholder( imageUtils, placeholder, viewFigure, viewWriter );

			return;
		}

		// Show progress bar on the top of the image when image is uploading.
		if ( status == 'uploading' ) {
			const loader = fileRepository.loaders.get( uploadId );

			// Start appear effect if needed - see https://github.com/ckeditor/ckeditor5-image/issues/191.
			_startAppearEffect( viewFigure, viewWriter );

			if ( !loader ) {
				// There is no loader associated with uploadId - this means that image came from external changes.
				// In such cases we still want to show the placeholder until image is fully uploaded.
				// Show placeholder if needed - see https://github.com/ckeditor/ckeditor5-image/issues/191.
				_showPlaceholder( imageUtils, placeholder, viewFigure, viewWriter );
			} else {
				// Hide placeholder and initialize progress bar showing upload progress.
				_hidePlaceholder( viewFigure, viewWriter );
				_showProgressBar( viewFigure, viewWriter, loader, editor.editing.view );
				_displayLocalImage( imageUtils, viewFigure!, viewWriter, loader );
			}

			return;
		}

		if ( status == 'complete' && fileRepository.loaders.get( uploadId ) ) {
			_showCompleteIcon( viewFigure, viewWriter, editor.editing.view );
		}

		// Clean up.
		_hideProgressBar( viewFigure, viewWriter );
		_hidePlaceholder( viewFigure, viewWriter );
		_stopAppearEffect( viewFigure, viewWriter );
	};
}

/**
 * Adds ck-appear class to the image figure if one is not already applied.
 */
function _startAppearEffect( viewFigure: ViewContainerElement, writer: DowncastWriter ) {
	if ( !viewFigure.hasClass( 'ck-appear' ) ) {
		writer.addClass( 'ck-appear', viewFigure );
	}
}

/**
 * Removes ck-appear class to the image figure if one is not already removed.
 */
function _stopAppearEffect( viewFigure: ViewContainerElement, writer: DowncastWriter ) {
	writer.removeClass( 'ck-appear', viewFigure );
}

/**
 * Shows placeholder together with infinite progress bar on given image figure.
 */
function _showPlaceholder( imageUtils: ImageUtils, placeholder: string, viewFigure: ViewContainerElement, writer: DowncastWriter ) {
	if ( !viewFigure.hasClass( 'ck-image-upload-placeholder' ) ) {
		writer.addClass( 'ck-image-upload-placeholder', viewFigure );
	}

	const viewImg = imageUtils.findViewImgElement( viewFigure )!;

	if ( viewImg.getAttribute( 'src' ) !== placeholder ) {
		writer.setAttribute( 'src', placeholder, viewImg );
	}

	if ( !_getUIElement( viewFigure, 'placeholder' ) ) {
		writer.insert( writer.createPositionAfter( viewImg ), _createPlaceholder( writer ) );
	}
}

/**
 * Removes placeholder together with infinite progress bar on given image figure.
 */
function _hidePlaceholder( viewFigure: ViewContainerElement, writer: DowncastWriter ) {
	if ( viewFigure.hasClass( 'ck-image-upload-placeholder' ) ) {
		writer.removeClass( 'ck-image-upload-placeholder', viewFigure );
	}

	_removeUIElement( viewFigure, writer, 'placeholder' );
}

/**
 * Shows progress bar displaying upload progress.
 * Attaches it to the file loader to update when upload percentace is changed.
 */
function _showProgressBar( viewFigure: ViewContainerElement, writer: DowncastWriter, loader: FileLoader, view: EditingView ) {
	const progressBar = _createProgressBar( writer );
	writer.insert( writer.createPositionAt( viewFigure, 'end' ), progressBar );

	// Update progress bar width when uploadedPercent is changed.
	loader.on( 'change:uploadedPercent', ( evt, name, value ) => {
		view.change( writer => {
			writer.setStyle( 'width', value + '%', progressBar );
		} );
	} );
}

/**
 * Hides upload progress bar.
 */
function _hideProgressBar( viewFigure: ViewContainerElement, writer: DowncastWriter ) {
	_removeUIElement( viewFigure, writer, 'progressBar' );
}

/**
 * Shows complete icon and hides after a certain amount of time.
 */
function _showCompleteIcon( viewFigure: ViewContainerElement, writer: DowncastWriter, view: EditingView ) {
	const completeIcon = writer.createUIElement( 'div', { class: 'ck-image-upload-complete-icon' } );

	writer.insert( writer.createPositionAt( viewFigure, 'end' ), completeIcon );

	setTimeout( () => {
		view.change( writer => writer.remove( writer.createRangeOn( completeIcon ) ) );
	}, 3000 );
}

/**
 * Create progress bar element using {@link module:engine/view/uielement~UIElement}.
 */
function _createProgressBar( writer: DowncastWriter ): ViewUIElement {
	const progressBar = writer.createUIElement( 'div', { class: 'ck-progress-bar' } );

	writer.setCustomProperty( 'progressBar', true, progressBar );

	return progressBar;
}

/**
 * Create placeholder element using {@link module:engine/view/uielement~UIElement}.
 */
function _createPlaceholder( writer: DowncastWriter ): ViewUIElement {
	const placeholder = writer.createUIElement( 'div', { class: 'ck-upload-placeholder-loader' } );

	writer.setCustomProperty( 'placeholder', true, placeholder );

	return placeholder;
}

/**
 * Returns {@link module:engine/view/uielement~UIElement} of given unique property from image figure element.
 * Returns `undefined` if element is not found.
 */
function _getUIElement( imageFigure: ViewElement, uniqueProperty: string ): ViewUIElement | undefined {
	for ( const child of imageFigure.getChildren() ) {
		if ( ( child as ViewElement ).getCustomProperty( uniqueProperty ) ) {
			return child as ViewUIElement;
		}
	}
}

/**
 * Removes {@link module:engine/view/uielement~UIElement} of given unique property from image figure element.
 */
function _removeUIElement( viewFigure: ViewContainerElement, writer: DowncastWriter, uniqueProperty: string ) {
	const element = _getUIElement( viewFigure, uniqueProperty );

	if ( element ) {
		writer.remove( writer.createRangeOn( element ) );
	}
}

/**
 * Displays local data from file loader.
 */
function _displayLocalImage( imageUtils: ImageUtils, viewFigure: ViewElement, writer: DowncastWriter, loader: FileLoader ) {
	if ( loader.data ) {
		const viewImg = imageUtils.findViewImgElement( viewFigure )!;

		writer.setAttribute( 'src', loader.data, viewImg );
	}
}
