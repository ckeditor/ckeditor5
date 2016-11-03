/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document, window */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';
import Enter from '/ckeditor5/enter/enter.js';
import Typing from '/ckeditor5/typing/typing.js';
import Heading from '/ckeditor5/heading/heading.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	features: [ Enter, Typing, Heading ],
	toolbar: [ 'headings' ]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
