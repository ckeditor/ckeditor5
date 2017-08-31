/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPreset from '@ckeditor/ckeditor5-presets/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '../../src/bold';
import Italic from '../../src/italic';
import Underline from '../../src/underline';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EssentialsPreset, Paragraph, Bold, Italic, Underline ],
		toolbar: [ 'bold', 'italic', 'underline', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
