/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Paragraph from '../../src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Typing,
			Paragraph,
			Undo,
			Enter,
			Clipboard,
			Link,
			Bold,
			Italic
		],
		toolbar: [ 'bold', 'italic', 'link', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
