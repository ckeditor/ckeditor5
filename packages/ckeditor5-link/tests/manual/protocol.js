/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Link from '../../src/link.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';

createEditorWithDefaultProtocol( '#editor0' );
createEditorWithDefaultProtocol( '#editor1', 'http://' );
createEditorWithDefaultProtocol( '#editor2', 'https://' );
createEditorWithDefaultProtocol( '#editor3', 'mailto:' );

function createEditorWithDefaultProtocol( editor, defaultProtocol ) {
	return ClassicEditor
		.create( document.querySelector( editor ), {
			plugins: [ Link, Typing, Paragraph, Undo, Enter, Superscript ],
			toolbar: [ 'link', 'undo', 'redo' ],
			link: {
				addTargetToExternalLinks: true,
				...defaultProtocol && { defaultProtocol }
			}
		} )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
