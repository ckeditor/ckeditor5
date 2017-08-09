/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import EssentialsPreset from '@ckeditor/ckeditor5-presets/src/essentials';
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

window.setInterval( function() {
	console.log( getData( window.editor.document ) );
}, 3000 );

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EssentialsPreset, Paragraph, Heading ],
		toolbar: [ 'headings', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
