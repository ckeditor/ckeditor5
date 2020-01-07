/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Title from '../../src/title';
import Heading from '../../src/heading';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';

ClassicEditor
	.create( document.querySelector( '#editor1' ), {
		plugins: [ Enter, Typing, Undo, Heading, Title, Clipboard, Image, ImageUpload, Bold, Alignment ],
		toolbar: [ 'heading', '|', 'undo', 'redo', 'bold', 'imageUpload', 'alignment' ]
	} )
	.then( editor => {
		window.editor = editor;

		editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => new UploadAdapterMock( loader );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor2' ), {
		plugins: [ Enter, Typing, Undo, Heading, Title, Clipboard, Image, ImageUpload, Bold, Alignment ],
		toolbar: [ 'heading', '|', 'undo', 'redo', 'bold', 'imageUpload', 'alignment' ],
		placeholder: 'Custom body placeholder',
		title: {
			placeholder: 'Custom title placeholder'
		}
	} )
	.then( editor => {
		editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => new UploadAdapterMock( loader );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
