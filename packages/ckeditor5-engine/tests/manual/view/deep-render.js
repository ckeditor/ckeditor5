/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console, document, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';

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
