/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar.js';
import RemoveFormat from '../../src/removeformat.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';

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
