/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';

import Link from '../../src/link.js';
import AutoLink from '../../src/autolink.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Bold, Typing, Paragraph, Undo, Enter, ShiftEnter, Link, AutoLink ],
		toolbar: [ 'link', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
