/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, console, window */

import ClassicEditor from 'ckeditor5/editor-classic/classic.js';
import EnterPlugin from 'ckeditor5/enter/enter.js';
import TypingPlugin from 'ckeditor5/typing/typing.js';
import ParagraphPlugin from 'ckeditor5/paragraph/paragraph.js';
import HeadingPlugin from 'ckeditor5/heading/heading.js';
import ImagePlugin from 'ckeditor5/image/image.js';
import UndoPlugin from 'ckeditor5/undo/undo.js';
import ClipboardPlugin from 'ckeditor5/clipboard/clipboard.js';
import ImageStyle from 'ckeditor5/image/imagestyle/imagestyle.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ EnterPlugin, TypingPlugin, ParagraphPlugin, HeadingPlugin, ImagePlugin, UndoPlugin, ClipboardPlugin, ImageStyle ],
	toolbar: [ 'headings', 'undo', 'redo', 'imageStyleFull', 'imageStyleSide' ]
} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
