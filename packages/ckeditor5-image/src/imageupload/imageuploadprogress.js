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
import UIElement from '@ckeditor/ckeditor5-engine/src/view/uielement';

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
	 */
	uploadStatusChange( evt, data, consumable ) {
		const editor = this.editor;
		const modelImage = data.item;
		const uploadId = modelImage.getAttribute( 'uploadId' );

		if ( !consumable.consume( data.item, evt.name ) || !uploadId ) {
			return;
		}

		const fileRepository = editor.plugins.get( FileRepository );
		const placeholder = this.placeholder;
		const status = data.attributeNewValue;
		const viewFigure = editor.editing.mapper.toViewElement( modelImage );

		// Show placeholder with infinite progress bar on the top while image is read from disk.
		if ( status == 'reading' ) {
			viewFigure.addClass( 'ck-appear', 'ck-infinite-progress', 'ck-image-upload-placeholder' );
			const viewImg = viewFigure.getChild( 0 );
			viewImg.setAttribute( 'src', placeholder );

			return;
		}

		// Show progress bar on the top of the image when image is uploading.
		if ( status == 'uploading' ) {
			const loader = fileRepository.loaders.get( uploadId );

			if ( loader ) {
				const progressBar = createProgressBar();

				viewFigure.removeClass( 'ck-infinite-progress', 'ck-image-upload-placeholder' );
				viewFigure.appendChildren( progressBar );

				// Update progress bar width when uploadedPercent is changed.
				loader.on( 'change:uploadedPercent', ( evt, name, value ) => {
					progressBar.setStyle( 'width', value + '%' );
					editor.editing.view.render();
				} );
			}

			return;
		}

		// Hide progress bar and clean up classes.
		const progressBar = getProgressBar( viewFigure );

		if ( progressBar ) {
			progressBar.remove();
		} else {
			viewFigure.removeClass( 'ck-infinite-progress' );
		}

		viewFigure.removeClass( 'ck-appear', 'ck-image-upload-placeholder' );
	}
}

// Symbol added to progress bar UIElement to distinguish it from other elements.
const progressBarSymbol = Symbol( 'progress-bar' );

// Create progress bar element using {@link module:engine/view/uielement~UIElement}.
//
// @private
// @returns {module:engine/view/uielement~UIElement}
function createProgressBar() {
	const progressBar = new UIElement( 'div', { class: 'ck-progress-bar' } );
	progressBar.setCustomProperty( progressBarSymbol, true );

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
