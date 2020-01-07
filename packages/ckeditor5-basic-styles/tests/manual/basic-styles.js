/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '../../src/bold';
import Italic from '../../src/italic';
import Strikethrough from '../../src/strikethrough';
import Underline from '../../src/underline';
import Code from '../../src/code';
import Subscript from '../../src/subscript';
import Superscript from '../../src/superscript';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic, Strikethrough, Underline, Code, Subscript, Superscript ],
		toolbar: [ 'bold', 'italic', 'strikethrough', 'underline', 'code', 'undo', 'redo', 'subscript', 'superscript' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
