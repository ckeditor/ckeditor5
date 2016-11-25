/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document, window */

import ClassicEditor from 'ckeditor5/editor-classic/classic.js';
import Enter from 'ckeditor5/enter/enter.js';
import Typing from 'ckeditor5/typing/typing.js';
import Heading from 'ckeditor5/heading/heading.js';
import Paragraph from 'ckeditor5/paragraph/paragraph.js';
import Undo from 'ckeditor5/undo/undo.js';
import Bold from 'ckeditor5/basic-styles/bold.js';
import Italic from 'ckeditor5/basic-styles/italic.js';
import testUtils from 'tests/utils/_utils/utils.js';

let editor, editable, observer;

function initEditor() {
	ClassicEditor.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic ],
		toolbar: [ 'headings', 'bold', 'italic', 'undo', 'redo' ]
	} )
	.then( newEditor => {
		console.log( 'Editor was initialized', newEditor );
		console.log( 'You can now play with it using global `editor` and `editable` variables.' );

		window.editor = editor = newEditor;
		window.editable = editable = editor.editing.view.getRoot();

		observer = testUtils.createObserver();
		observer.observe( 'Editable', editable, [ 'isFocused' ] );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
}

function destroyEditor() {
	editor.destroy()
		.then( () => {
			window.editor = editor = null;
			window.editable = editable = null;

			observer.stopListening();
			observer = null;

			console.log( 'Editor was destroyed' );
		} );
}

document.getElementById( 'initEditor' ).addEventListener( 'click', initEditor );
document.getElementById( 'destroyEditor' ).addEventListener( 'click', destroyEditor );
