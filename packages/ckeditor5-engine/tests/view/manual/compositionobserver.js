/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Typing, Paragraph ]
	} )
	.then( editor => {
		window.editor = editor;

		const view = editor.editing.view;
		const viewDocument = view.document;

		viewDocument.on( 'compositionstart', ( evt, data ) => console.log( 'compositionstart', data ) );
		viewDocument.on( 'compositionupdate', ( evt, data ) => console.log( 'compositionupdate', data ) );
		viewDocument.on( 'compositionend', ( evt, data ) => console.log( 'compositionend', data ) );

		view.focus();
	} )
	.catch( err => {
		console.error( err.stack );
	} );
