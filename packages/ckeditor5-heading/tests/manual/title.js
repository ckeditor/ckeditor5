/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Title from '../../src/title.js';
import Heading from '../../src/heading.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';

ClassicEditor
	.create( document.querySelector( '#editor1' ), {
		plugins: [ Enter, Typing, Undo, Heading, Title, Clipboard, Image, ImageUpload, Bold, Alignment ],
		toolbar: [ 'heading', '|', 'undo', 'redo', 'bold', 'uploadImage', 'alignment' ]
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
		toolbar: [ 'heading', '|', 'undo', 'redo', 'bold', 'uploadImage', 'alignment' ],
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
