/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic';
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

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [
		Enter, Typing, Paragraph, Heading, Undo, Bold, Italic, Heading, List, Image, ImageToolbar, Clipboard,
		ImageCaption, ImageStyle, ImageUpload
	],
	toolbar: [ 'headings', 'undo', 'redo', 'bold', 'italic', 'bulletedList', 'numberedList', 'insertImage' ]
} )
.then( editor => {
	// Register fake adapter.
	editor.plugins.get( 'upload/filerepository' ).createAdapter = loader => {
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
	const button = document.createElement( 'button' );
	button.innerHTML = 'Upload progress';

	container.appendChild( button );
	container.appendChild( progressInfo );

	buttonContainer.appendChild( container );

	let progress = 0;
	const total = 500;
	button.addEventListener( 'click', () => {
		progress += 100;
		adapterMock.mockProgress( progress, total );

		if ( progress == total ) {
			button.setAttribute( 'disabled', 'true' );
			adapterMock.mockSuccess( { original: './sample.jpg' } );
		}

		progressInfo.innerHTML = `File: ${ fileName }. Progress: ${ loader.uploadedPercent }%.`;
	} );
}

