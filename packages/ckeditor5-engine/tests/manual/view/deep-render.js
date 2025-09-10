/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Underline, Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Link } from '@ckeditor/ckeditor5-link';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Underline, Bold, Italic, Link ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'underline', 'italic', 'link' ]
	} )
	.then( editor => {
		window.editor = editor;

		const preview = document.querySelector( '#preview' );

		preview.innerText = editor.getData();

		editor.editing.view.on( 'render', () => {
			preview.innerText = editor.getData();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
