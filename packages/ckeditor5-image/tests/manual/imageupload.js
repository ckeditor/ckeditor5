/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import Table from '@ckeditor/ckeditor5-table/src/table';
import ImageStyle from '../../src/imagestyle';
import ImageToolbar from '../../src/imagetoolbar';
import Image from '../../src/image';
import ImageCaption from '../../src/imagecaption';
import ImageUpload from '../../src/imageupload';

const buttonContainer = document.getElementById( 'button-container' );

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Enter, Typing, Paragraph, Heading, Undo, Bold, Italic, Heading, List, Image, ImageToolbar, Clipboard,
			ImageCaption, ImageStyle, ImageUpload, Table
		],
		toolbar: [ 'heading', '|', 'undo', 'redo', 'bold', 'italic', 'bulletedList', 'numberedList', 'insertTable', '|', 'imageUpload' ],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
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

