/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from 'ckeditor5/editor-classic/classic.js';
import Enter from 'ckeditor5/enter/enter.js';
import Typing from 'ckeditor5/typing/typing.js';
import Heading from 'ckeditor5/heading/heading.js';
import Paragraph from 'ckeditor5/paragraph/paragraph.js';
import Bold from 'ckeditor5/basic-styles/bold.js';
import Italic from 'ckeditor5/basic-styles/italic.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Heading, Bold, Italic ],
	toolbar: [ 'headings', 'bold', 'italic' ]
} )
.then( editor => {
	window.editor = editor;

	const sel = editor.document.selection;

	sel.on( 'change', ( evt, data ) => {
		const date = new Date();
		console.log( `${ date.getSeconds() }s${ String( date.getMilliseconds() ).slice( 0, 2 ) }ms`, evt.name, data );
	} );
} )
.catch( err => {
	console.error( err.stack );
} );
