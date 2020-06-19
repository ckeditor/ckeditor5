/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Link from '../../src/link';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';

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
