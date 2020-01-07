/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '../../src/enter';
import ShiftEnter from '../../src/shiftenter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, ShiftEnter, Typing, Heading, Undo, Bold, Italic ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
