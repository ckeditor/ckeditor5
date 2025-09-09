/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Title } from '../../src/title.js';
import { Heading } from '../../src/heading.js';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';
import { Image, ImageUpload } from '@ckeditor/ckeditor5-image';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { Alignment } from '@ckeditor/ckeditor5-alignment';

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
