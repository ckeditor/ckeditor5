/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import ImageUpload from '../../src/imageupload.js';

import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';

const buttonContainer = document.getElementById( 'button-container' );

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, ImageUpload ],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'uploadImage',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'toggleImageCaption', 'imageTextAlternative' ]
		}
	} )
	.then( editor => {
		window.editor = editor;

		// Register fake adapter.
		editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => {
			const adapterMock = new UploadAdapterMock( loader );
			createProgressButton( loader, adapterMock );

			return adapterMock;
		};
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function createProgressButton( loader, adapterMock ) {
	loader.file.then( file => {
		const fileName = file.name;
		const container = document.createElement( 'div' );
		const progressInfo = document.createElement( 'span' );
		progressInfo.innerHTML = `File: ${ fileName }. Progress: 0%.`;
		const progressButton = document.createElement( 'button' );
		const errorButton = document.createElement( 'button' );
		const abortButton = document.createElement( 'button' );
		progressButton.innerHTML = 'Upload progress';
		errorButton.innerHTML = 'Simulate error';
		abortButton.innerHTML = 'Simulate aborting';

		container.appendChild( progressButton );
		container.appendChild( errorButton );
		container.appendChild( abortButton );
		container.appendChild( progressInfo );

		buttonContainer.appendChild( container );

		let progress = 0;
		const total = 500;
		progressButton.addEventListener( 'click', () => {
			progress += 100;
			adapterMock.mockProgress( progress, total );

			if ( progress == total ) {
				disableButtons();
				adapterMock.mockSuccess( { default: './sample.jpg' } );
			}

			progressInfo.innerHTML = `File: ${ fileName }. Progress: ${ loader.uploadedPercent }%.`;
		} );

		errorButton.addEventListener( 'click', () => {
			adapterMock.mockError( 'Upload error!' );
			disableButtons();
		} );

		abortButton.addEventListener( 'click', () => {
			loader.abort();
			disableButtons();
		} );

		function disableButtons() {
			progressButton.setAttribute( 'disabled', 'true' );
			errorButton.setAttribute( 'disabled', 'true' );
			abortButton.setAttribute( 'disabled', 'true' );
		}
	} );
}

