/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Bookmark from '@ckeditor/ckeditor5-bookmark/src/bookmark.js';
import Emoji from '../../src/emoji.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Typing, Paragraph, Undo, Enter, Emoji, Bookmark ],
		toolbar: [ 'link', 'undo', 'redo', 'emoji', 'bookmark' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
