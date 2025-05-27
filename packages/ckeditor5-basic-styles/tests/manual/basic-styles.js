/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '../../src/bold.js';
import Italic from '../../src/italic.js';
import Strikethrough from '../../src/strikethrough.js';
import Underline from '../../src/underline.js';
import Code from '../../src/code.js';
import Subscript from '../../src/subscript.js';
import Superscript from '../../src/superscript.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic, Strikethrough, Underline, Code, Subscript, Superscript ],
		toolbar: [ 'bold', 'italic', 'strikethrough', 'underline', 'code', 'undo', 'redo', 'subscript', 'superscript' ],
		menuBar: { isVisible: true }
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
