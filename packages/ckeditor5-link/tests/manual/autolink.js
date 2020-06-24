/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

import Link from '../../src/link';
import AutoLink from '../../src/autolink';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

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
