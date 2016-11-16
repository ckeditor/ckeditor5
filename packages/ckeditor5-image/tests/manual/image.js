/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, console, window */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';
import EnterFeature from '/ckeditor5/enter/enter.js';
import TypingFeature from '/ckeditor5/typing/typing.js';
import ParagraphFeature from '/ckeditor5/paragraph/paragraph.js';
import HeadingFeature from '/ckeditor5/heading/heading.js';
import ImageFeature from '/ckeditor5/image/image.js';
import UndoFeature from '/ckeditor5/undo/undo.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	features: [ EnterFeature, TypingFeature, ParagraphFeature, HeadingFeature, ImageFeature, UndoFeature ],
	toolbar: [ 'headings', 'undo', 'redo' ]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
