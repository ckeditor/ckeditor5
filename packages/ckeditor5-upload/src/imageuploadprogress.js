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

			if ( status == 'reading' ) {
				viewFigure.addClass( 'ck-appear', 'ck-infinite-progress' );
				const viewImg = viewFigure.getChild( 0 );
				viewImg.setAttribute( 'src', placeholder );
			}

			if ( status == 'uploading' ) {
				viewFigure.removeClass( 'ck-infinite-progress' );
				const progressBar = createProgressBar();
				viewFigure.appendChildren( progressBar );
				const loader = fileRepository.loaders.get( uploadId );

				loader.on( 'change:uploadedPercent', ( evt, name, value ) => {
					progressBar.setStyle( 'width', value + '%' );
					editor.editing.view.render();
				} );
			}

			if ( status == 'complete' ) {
				const viewFigure = editor.editing.mapper.toViewElement( modelImage );
				const progressBar = getProgressBar( viewFigure );

				if ( progressBar ) {
					progressBar.remove();
					editor.editing.view.render();
				}
			}
		}
	}
}

const progressBarSymbol = Symbol( 'progress-bar' );

function createProgressBar() {
	const progressBar = new UIElement( 'div', { class: 'ck-progress-bar' } );
	progressBar.setCustomProperty( progressBarSymbol, true );

	return progressBar;
}

function getProgressBar( imageFigure ) {
	for ( const child of imageFigure.getChildren() ) {
		if ( child.getCustomProperty( progressBarSymbol ) ) {
			return child;
		}
	}

	return null;
}
