/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EnterPlugin from '@ckeditor/ckeditor5-enter/src/enter';
import TypingPlugin from '@ckeditor/ckeditor5-typing/src/typing';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '../../src/image';
import UndoPlugin from '@ckeditor/ckeditor5-undo/src/undo';
import ClipboardPlugin from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import ImageToolbar from '../../src/imagetoolbar';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EnterPlugin, TypingPlugin, ParagraphPlugin, HeadingPlugin, ImagePlugin, UndoPlugin, ClipboardPlugin, ImageToolbar ],
		toolbar: [ 'heading', '|', 'undo', 'redo' ],
		image: {
			toolbar: [ 'imageTextAlternative' ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
