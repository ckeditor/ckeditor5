/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import LegacyList from '../../src/legacylist.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Heading, Paragraph, Undo, LegacyList, Clipboard, Link ],
		toolbar: [ 'heading', '|', 'bulletedList', 'numberedList', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
		window.modelRoot = editor.model.document.getRoot();
		window.viewRoot = editor.editing.view.document.getRoot();
	} )
	.catch( err => {
		console.error( err.stack );
	} );
