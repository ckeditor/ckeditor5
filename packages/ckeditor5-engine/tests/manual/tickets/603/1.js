/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Heading, Bold, Italic ],
		toolbar: [ 'heading', '|', 'bold', 'italic' ]
	} )
	.then( editor => {
		window.editor = editor;

		const sel = editor.model.document.selection;

		sel.on( 'change', ( evt, data ) => {
			const date = new Date();
			console.log( `${ date.getSeconds() }s${ String( date.getMilliseconds() ).slice( 0, 2 ) }ms`, evt.name, data );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
