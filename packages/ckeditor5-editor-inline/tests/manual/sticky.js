/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import InlineEditor from '../../src/inlineeditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';

InlineEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Link, Bold, Italic, Typing, Paragraph, Undo, Enter ],
		toolbar: [ 'link', 'bold', 'italic', '|', 'undo', 'redo' ],
		ui: { viewportOffset: { top: 120 } }
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
