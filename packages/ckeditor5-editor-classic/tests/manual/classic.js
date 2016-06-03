/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import ClassicEditor from '/ckeditor5/creator-classic/classic.js';
import testUtils from '/tests/utils/_utils/utils.js';

let editor, editable, observer;

function initEditor() {
	ClassicEditor.create( document.querySelector( '#editor' ), {
		features: [ 'delete', 'enter', 'typing', 'paragraph', 'undo', 'formats', 'basic-styles/bold', 'basic-styles/italic' ],
		toolbar: [ 'formats', 'bold', 'italic', 'undo', 'redo' ]
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
