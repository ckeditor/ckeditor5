/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module upload/imageupload
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageUploadEngine from './imageuploadengine';
import FileDialogButtonView from './ui/filedialogbuttonview';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import uploadingPlaceholder from '../theme/icons/image_placeholder.svg';
import UIElement from '@ckeditor/ckeditor5-engine/src/view/uielement';
import '../theme/theme.scss';

/**
 * Image upload plugin.
 * Adds `insertImage` button to UI component factory.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUpload extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageUploadEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Setup `insertImage` button.
		editor.ui.componentFactory.add( 'insertImage', ( locale ) => {
			const view = new FileDialogButtonView( locale );

			view.set( {
				label: t( 'Insert image' ),
				icon: imageIcon,
				tooltip: true,
				acceptedType: 'image/*',
				allowMultipleFiles: true
			} );

			view.on( 'done', ( evt, files ) => {
				for ( const file of files ) {
					editor.execute( 'imageUpload', { file: file } );
				}
			} );

			return view;
		} );

		const uploadEngine = editor.plugins.get( ImageUploadEngine );

		// TODO: to constructor?
		this.placeholder = 'data:image/svg+xml;utf8,' + uploadingPlaceholder;

		// Reading started.
		uploadEngine.on( 'upload:reading', ( evt, modelImage ) => {
			const viewFigure = editor.editing.mapper.toViewElement( modelImage );

			// TODO: do it better since there might be more elements.
			const viewImg = viewFigure.getChild( 0 );

			viewFigure.addClass( 'ck-appear', 'ck-infinite-progress' );

			viewImg.setAttribute( 'src', this.placeholder );
			editor.editing.view.render();
		} );

		// Uploading started.
		uploadEngine.on( 'upload:uploading', ( evt, modelImage, loader ) => {
			const viewFigure = editor.editing.mapper.toViewElement( modelImage );
			const progressBar = createProgressBar();
			viewFigure.appendChildren( progressBar );

			viewFigure.removeClass( 'ck-infinite-progress' );
			editor.editing.view.render();

			loader.on( 'change:uploadedPercent', ( evt, name, value ) => {
				progressBar.setStyle( 'width', value + '%' );
				editor.editing.view.render();
			} );
		} );

		uploadEngine.on( 'upload:complete', ( evt, modelImage ) => {
			const viewFigure = editor.editing.mapper.toViewElement( modelImage );
			const progressBar = getProgressBar( viewFigure );

			if ( progressBar ) {
				progressBar.remove();
				editor.editing.view.render();
			}
		} );
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
