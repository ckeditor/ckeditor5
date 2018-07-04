/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imageupload/imageuploadprogress
 */

/* globals setTimeout */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import UIElement from '@ckeditor/ckeditor5-engine/src/view/uielement';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';

import '../../theme/imageuploadprogress.css';
import '../../theme/imageuploadicon.css';

// Data-uri with blank image that will be set as a img#src while placeholder is displayed.
const blankImage = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

/**
 * The image upload progress plugin.
 * It shows a placeholder when the image is read from the disk and a progress bar while the image is uploading.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUploadProgress extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Upload status change - update image's view according to that status.
		editor.editing.downcastDispatcher.on( 'attribute:uploadStatus:image', ( ...args ) => this.uploadStatusChange( ...args ) );
	}

	/**
	 * This method is called each time the image `uploadStatus` attribute is changed.
	 *
	 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi
	 */
	uploadStatusChange( evt, data, conversionApi ) {
		const editor = this.editor;
		const modelImage = data.item;
		const uploadId = modelImage.getAttribute( 'uploadId' );

		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const fileRepository = editor.plugins.get( FileRepository );
		const status = uploadId ? data.attributeNewValue : null;
		const viewFigure = editor.editing.mapper.toViewElement( modelImage );
		const viewWriter = conversionApi.writer;

		if ( status == 'reading' ) {
			// Start "appearing" effect and show placeholder with infinite progress bar on the top
			// while image is read from disk.
			_startAppearEffect( viewFigure, viewWriter );
			_showPlaceholder( viewFigure, viewWriter );

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
				_showPlaceholder( viewFigure, viewWriter );
			} else {
				// Hide placeholder and initialize progress bar showing upload progress.
				_hidePlaceholder( viewFigure, viewWriter );
				_showProgressBar( viewFigure, viewWriter, loader, editor.editing.view );
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
	}
}

// Symbol added to progress bar UIElement to distinguish it from other elements.
const progressBarSymbol = Symbol( 'progress-bar' );

// Symbol added to placeholder UIElement to distinguish it from other elements.
const placeholderSymbol = Symbol( 'placeholder' );

// Adds ck-appear class to the image figure if one is not already applied.
//
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/writer~Writer} writer
function _startAppearEffect( viewFigure, writer ) {
	if ( !viewFigure.hasClass( 'ck-appear' ) ) {
		writer.addClass( 'ck-appear', viewFigure );
	}
}

// Removes ck-appear class to the image figure if one is not already removed.
//
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/writer~Writer} writer
function _stopAppearEffect( viewFigure, writer ) {
	writer.removeClass( 'ck-appear', viewFigure );
}

// Shows placeholder together with infinite progress bar on given image figure.
//
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/writer~Writer} writer
function _showPlaceholder( viewFigure, writer ) {
	if ( !viewFigure.hasClass( 'ck-image-upload-placeholder' ) ) {
		writer.addClass( 'ck-image-upload-placeholder', viewFigure );
	}

	if ( !viewFigure.hasClass( 'ck-infinite-progress' ) ) {
		writer.addClass( 'ck-infinite-progress', viewFigure );
	}

	const viewImg = viewFigure.getChild( 0 );

	if ( viewImg.getAttribute( 'src' ) !== blankImage ) {
		writer.setAttribute( 'src', blankImage, viewImg );
	}

	if ( !_getUIElement( viewFigure, placeholderSymbol ) ) {
		writer.insert( ViewPosition.createAfter( viewImg ), _createPlaceholder( writer ) );
	}
}

// Removes placeholder together with infinite progress bar on given image figure.
//
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/writer~Writer} writer
function _hidePlaceholder( viewFigure, writer ) {
	if ( viewFigure.hasClass( 'ck-image-upload-placeholder' ) ) {
		writer.removeClass( 'ck-image-upload-placeholder', viewFigure );
	}

	if ( viewFigure.hasClass( 'ck-infinite-progress' ) ) {
		writer.removeClass( 'ck-infinite-progress', viewFigure );
	}

	_removeUIElement( viewFigure, writer, placeholderSymbol );
}

// Shows progress bar displaying upload progress.
// Attaches it to the file loader to update when upload percentace is changed.
//
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/writer~Writer} writer
// @param {module:upload/filerepository~FileLoader} loader
// @param {module:engine/view/view~View} view
function _showProgressBar( viewFigure, writer, loader, view ) {
	const progressBar = _createProgressBar( writer );
	writer.insert( ViewPosition.createAt( viewFigure, 'end' ), progressBar );

	// Update progress bar width when uploadedPercent is changed.
	loader.on( 'change:uploadedPercent', ( evt, name, value ) => {
		view.change( writer => {
			writer.setStyle( 'width', value + '%', progressBar );
		} );
	} );
}

// Hides upload progress bar.
//
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/writer~Writer} writer
function _hideProgressBar( viewFigure, writer ) {
	_removeUIElement( viewFigure, writer, progressBarSymbol );
}

// Shows complete icon and hides after a certain amount of time.
//
// @param {module:engine/view/containerelement~ContainerElement} viewFigure
// @param {module:engine/view/writer~Writer} writer
// @param {module:engine/view/view~View} view
function _showCompleteIcon( viewFigure, writer, view ) {
	const completeIcon = new UIElement( 'div', { class: 'ck-image-upload-complete-icon' } );

	writer.insert( ViewPosition.createAt( viewFigure, 'end' ), completeIcon );

	setTimeout( () => {
		view.change( writer => writer.remove( ViewRange.createOn( completeIcon ) ) );
	}, 3000 );
}

// Create progress bar element using {@link module:engine/view/uielement~UIElement}.
//
// @private
// @param {module:engine/view/writer~Writer} writer
// @returns {module:engine/view/uielement~UIElement}
function _createProgressBar( writer ) {
	const progressBar = writer.createUIElement( 'div', { class: 'ck-progress-bar' } );

	writer.setCustomProperty( progressBarSymbol, true, progressBar );

	return progressBar;
}

// Create placeholder element using {@link module:engine/view/uielement~UIElement}.
//
// @private
// @param {module:engine/view/writer~Writer} writer
// @returns {module:engine/view/uielement~UIElement}
function _createPlaceholder( writer ) {
	const placeholder = writer.createUIElement( 'div', { class: 'ck-upload-placeholder' } );

	writer.setCustomProperty( placeholderSymbol, true, placeholder );

	placeholder.render = function ( domDocument ) {
		const domElement = this.toDomElement( domDocument );
		domElement.innerHTML = '<div class="ck-upload-placeholder_loader"></div>';
	};

	return placeholder;
}

// Returns {@link module:engine/view/uielement~UIElement} of given unique property from image figure element.
// Returns `undefined` if element is not found.
//
// @private
// @param {module:engine/view/element~Element} imageFigure
// @param {Symbol} uniqueProperty
// @returns {module:engine/view/uielement~UIElement|undefined}
function _getUIElement( imageFigure, uniqueProperty ) {
	for ( const child of imageFigure.getChildren() ) {
		if ( child.getCustomProperty( uniqueProperty ) ) {
			return child;
		}
	}
}

// Removes {@link module:engine/view/uielement~UIElement} of given unique property from image figure element.
//
// @private
// @param {module:engine/view/element~Element} imageFigure
// @param {module:engine/view/writer~Writer} writer
// @param {Symbol} uniqueProperty
function _removeUIElement( viewFigure, writer, uniqueProperty ) {
	const element = _getUIElement( viewFigure, uniqueProperty );

	if ( element ) {
		writer.remove( ViewRange.createOn( element ) );
	}
}
