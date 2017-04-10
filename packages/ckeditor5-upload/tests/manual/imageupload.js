/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, window, console */

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
import ImageUploadEngine from '../../src/imageuploadengine';
import { AdapterMock } from '../_utils/mocks';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [
		Enter, Typing, Paragraph, Heading, Undo, Bold, Italic, Heading, List, Image, ImageToolbar, Clipboard,
		ImageCaption, ImageStyle, ImageUploadEngine
	],
	toolbar: [ 'headings', 'undo', 'redo', 'bold', 'italic', 'bulletedList', 'numberedList' ]
} )
.then( editor => {
	window.editor = editor;

	// Register fake adapter.
	editor.plugins.get( 'fileRepository' ).createAdapter = loader => {
		const adapterMock = new AdapterMock( loader );

		return adapterMock;
	};
} )
.catch( err => {
	console.error( err.stack );
} );
