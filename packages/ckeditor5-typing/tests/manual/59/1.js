/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Typing } from '../../../src/typing.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Typing, Paragraph, Bold ],
		toolbar: [ 'bold' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
