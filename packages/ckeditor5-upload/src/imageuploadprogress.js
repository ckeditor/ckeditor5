/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module upload/imageuploadprogress
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { eventNameToConsumableType } from '@ckeditor/ckeditor5-engine/src/conversion/model-to-view-converters';
import FileRepository from './filerepository';
import uploadingPlaceholder from '../theme/icons/image_placeholder.svg';
import UIElement from '@ckeditor/ckeditor5-engine/src/view/uielement';

import '../theme/imageuploadprogress.scss';

/**
 * Image upload progress plugin.
 * Shows placeholder when image is read from disk and progress bar while image is uploading.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUploadProgress extends Plugin {
	constructor( editor ) {
		super( editor );

		/**
		 * Image's placeholder that is displayed before real image data can be accessed.
		 *
		 * @protected
		 * @member {String} #placeholder
		 */
		this.placeholder = 'data:image/svg+xml;utf8,' + uploadingPlaceholder;
	}

	init() {
		const editor = this.editor;
		const fileRepository = editor.plugins.get( FileRepository );
		const placeholder = this.placeholder;

		// Upload status change - update image's view according to that status.
		editor.editing.modelToView.on( 'addAttribute:uploadStatus:image', uploadStatusChange );
		editor.editing.modelToView.on( 'changeAttribute:uploadStatus:image', uploadStatusChange );

		// Called each time uploadStatus attribute is added or changed.
		function uploadStatusChange( evt, data, consumable ) {
			if ( !consumable.consume( data.item, eventNameToConsumableType( evt.name ) ) ) {
				return;
			}

			const status = data.attributeNewValue;
			const modelImage = data.item;
			const viewFigure = editor.editing.mapper.toViewElement( modelImage );
			const uploadId = modelImage.getAttribute( 'uploadId' );

			if ( !uploadId ) {
				return;
			}

			// Show placeholder with infinite progress bar on the top while image is read from disk.
			if ( status == 'reading' ) {
				viewFigure.addClass( 'ck-appear', 'ck-infinite-progress' );
				const viewImg = viewFigure.getChild( 0 );
				viewImg.setAttribute( 'src', placeholder );

				return;
			}

			// Show progress bar on the top of the image when image is uploading.
			if ( status == 'uploading' ) {
				viewFigure.removeClass( 'ck-infinite-progress' );
				const progressBar = createProgressBar();
				viewFigure.appendChildren( progressBar );
				const loader = fileRepository.loaders.get( uploadId );

				// Update progress bar width when uploadedPercent is changed.
				loader.on( 'change:uploadedPercent', ( evt, name, value ) => {
					progressBar.setStyle( 'width', value + '%' );
					editor.editing.view.render();
				} );

				return;
			}

			// Hide progress bar and clean up classes.
			if ( status == 'complete' ) {
				const viewFigure = editor.editing.mapper.toViewElement( modelImage );
				const progressBar = getProgressBar( viewFigure );

				viewFigure.removeClass( 'ck-appear' );

				if ( progressBar ) {
					progressBar.remove();
					editor.editing.view.render();
				}
			}
		}
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

// Returns progress bar {@link module:engine/view/uielement~UIElement} from image figure element. Returns `null` if
// progress bar element is not found.
//
// @private
// @param {module:engine/view/element~Element} imageFigure
// @returns {module:engine/view/uielement~UIElement|null}
function getProgressBar( imageFigure ) {
	for ( const child of imageFigure.getChildren() ) {
		if ( child.getCustomProperty( progressBarSymbol ) ) {
			return child;
		}
	}

	return null;
}
