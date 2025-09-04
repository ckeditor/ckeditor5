/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { global } from '@ckeditor/ckeditor5-utils';

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Bold, Italic, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { Enter, ShiftEnter } from '@ckeditor/ckeditor5-enter';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { Image, ImageCaption, ImageToolbar, ImageResize } from '@ckeditor/ckeditor5-image';
import { RemoveFormat } from '../../src/removeformat.js';
import { Link } from '@ckeditor/ckeditor5-link';

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [
			Bold, Clipboard, Enter, Italic, Link, Paragraph, RemoveFormat, ShiftEnter, Typing,
			Underline, Undo, Image, ImageCaption, ImageToolbar, ImageResize
		],
		toolbar: [ 'removeFormat', '|', 'italic', 'bold', 'link', 'underline', '|', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
