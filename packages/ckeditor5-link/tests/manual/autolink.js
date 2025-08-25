/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Enter, ShiftEnter } from '@ckeditor/ckeditor5-enter';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Undo } from '@ckeditor/ckeditor5-undo';

import { Link } from '../../src/link.js';
import { AutoLink } from '../../src/autolink.js';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';

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
