/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imageupload/imageuploadprogress
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import uploadingPlaceholder from '../../theme/icons/image_placeholder.svg';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';

import '../../theme/imageuploadprogress.css';

/**
 * Image upload progress plugin.
 * Shows placeholder when image is read from disk and progress bar while image is uploading.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUploadProgress extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Image's placeholder that is displayed before real image data can be accessed.
		 *
		 * @protected
		 * @member {String} #placeholder
		 */
		this.placeholder = 'data:image/svg+xml;utf8,' + encodeURIComponent( uploadingPlaceholder );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Upload status change - update image's view according to that status.
		editor.editing.downcastDispatcher.on( 'attribute:uploadStatus:image', ( ...args ) => this.uploadStatusChange( ...args ) );
	}

	/**
	 * This ethod is called each time image's `uploadStatus` attribute is changed.
	 *
	 * @param {module:utils/eventinfo~EventInfo} evt Object containing information about the fired event.
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi
	 */
	uploadStatusChange( evt, data, conversionApi ) {
		const editor = this.editor;
		const modelImage = data.item;
		const uploadId = modelImage.getAttribute( 'uploadId' );

		if ( !conversionApi.consumable.consume( data.item, evt.name ) || !uploadId ) {
			return;
		}

		const fileRepository = editor.plugins.get( FileRepository );
		const status = data.attributeNewValue;
		const placeholder = this.placeholder;
		const viewFigure = editor.editing.mapper.toViewElement( modelImage );
		const viewWriter = conversionApi.writer;

		if ( status == 'reading' ) {
			// Start "appearing" effect and show placeholder with infinite progress bar on the top
			// while image is read from disk.
			_startAppearEffect( viewFigure, viewWriter );
			_showPlaceholder( placeholder, viewFigure, viewWriter );

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
				_showPlaceholder( placeholder, viewFigure, viewWriter );
			} else {
				// Hide placeholder and initialize progress bar showing upload progress.
				_hidePlaceholder( viewFigure, viewWriter );
				_showProgressBar( viewFigure, viewWriter, loader, editor.editing.view );
			}

			return;
		}

		// Clean up.
		_hideProgressBar( viewFigure, viewWriter );
		_hidePlaceholder( viewFigure, viewWriter );
		_stopAppearAffect( viewFigure, viewWriter );
	}
}

// Symbol added to progress bar UIElement to distinguish it from other elements.
const progressBarSymbol = Symbol( 'progress-bar' );

function _startAppearEffect( viewFigure, writer ) {
	if ( !viewFigure.hasClass( 'ck-appear' ) ) {
		writer.addClass( 'ck-appear', viewFigure );
	}
}

function _stopAppearAffect( viewFigure, writer ) {
	if ( viewFigure.hasClass( 'ck-appear' ) ) {
		writer.removeClass( 'ck-appear', viewFigure );
	}
}

function _showPlaceholder( placeholder, viewFigure, writer ) {
	if ( !viewFigure.hasClass( 'ck-image-upload-placeholder' ) ) {
		writer.addClass( 'ck-image-upload-placeholder', viewFigure );
	}

	if ( !viewFigure.hasClass( 'ck-infinite-progress' ) ) {
		writer.addClass( 'ck-infinite-progress', viewFigure );
	}

	const viewImg = viewFigure.getChild( 0 );

	if ( viewImg.getAttribute( 'src' ) !== placeholder ) {
		writer.setAttribute( 'src', placeholder, viewImg );
	}
}

function _hidePlaceholder( viewFigure, writer ) {
	if ( viewFigure.hasClass( 'ck-image-upload-placeholder' ) ) {
		writer.removeClass( 'ck-image-upload-placeholder', viewFigure );
	}

	if ( viewFigure.hasClass( 'ck-infinite-progress' ) ) {
		writer.removeClass( 'ck-infinite-progress', viewFigure );
	}
}

function _showProgressBar( viewFigure, writer, loader, view ) {
	const progressBar = createProgressBar( writer );
	writer.insert( ViewPosition.createAt( viewFigure, 'end' ), progressBar );

	// Update progress bar width when uploadedPercent is changed.
	loader.on( 'change:uploadedPercent', ( evt, name, value ) => {
		view.change( writer => {
			writer.setStyle( 'width', value + '%', progressBar );
		} );
	} );
}

function _hideProgressBar( viewFigure, writer ) {
	const progressBar = getProgressBar( viewFigure );

	if ( progressBar ) {
		writer.remove( ViewRange.createOn( progressBar ) );
	}
}

// Create progress bar element using {@link module:engine/view/uielement~UIElement}.
//
// @private
// @param {module:engine/view/writer~Writer} writer
// @returns {module:engine/view/uielement~UIElement}
function createProgressBar( writer ) {
	const progressBar = writer.createUIElement( 'div', { class: 'ck-progress-bar' } );
	writer.setCustomProperty( progressBarSymbol, true, progressBar );

	return progressBar;
}

// Returns progress bar {@link module:engine/view/uielement~UIElement} from image figure element. Returns `undefined` if
// progress bar element is not found.
//
// @private
// @param {module:engine/view/element~Element} imageFigure
// @returns {module:engine/view/uielement~UIElement|undefined}
function getProgressBar( imageFigure ) {
	for ( const child of imageFigure.getChildren() ) {
		if ( child.getCustomProperty( progressBarSymbol ) ) {
			return child;
		}
	}
}
