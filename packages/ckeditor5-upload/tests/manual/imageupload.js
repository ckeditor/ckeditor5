/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import List from '@ckeditor/ckeditor5-list/src/list';
import ImageUpload from '../../src/imageupload';
import { AdapterMock } from '../_utils/mocks';

const buttonContainer = document.getElementById( 'button-container' );

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Enter, Typing, Paragraph, Heading, Undo, Bold, Italic, Heading, List, Image, ImageToolbar, Clipboard,
			ImageCaption, ImageStyle, ImageUpload
		],
		toolbar: [ 'headings', 'undo', 'redo', 'bold', 'italic', 'bulletedList', 'numberedList', 'insertImage' ],
		image: {
			toolbar: [ 'imageStyleFull', 'imageStyleSide', '|', 'imageTextAlternative' ]
		}
	} )
	.then( editor => {
		// Register fake adapter.
		editor.plugins.get( 'FileRepository' ).createAdapter = loader => {
			const adapterMock = new AdapterMock( loader );
			createProgressButton( loader, adapterMock );

			return adapterMock;
		};
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function createProgressButton( loader, adapterMock ) {
	const fileName = loader.file.name;
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
}

