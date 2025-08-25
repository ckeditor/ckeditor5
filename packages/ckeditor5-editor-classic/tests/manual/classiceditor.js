/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '../../src/classiceditor.js';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { createObserver } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

let editor, editable, observer;

function initEditor() {
	ClassicEditor
		.create( document.querySelector( '#editor' ), {
			plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic ],
			toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ],
			menuBar: { isVisible: true }
		} )
		.then( newEditor => {
			console.log( 'Editor was initialized', newEditor );
			console.log( 'You can now play with it using global `editor` and `editable` variables.' );

			window.editor = editor = newEditor;
			window.editable = editable = editor.editing.view.document.getRoot();

			observer = createObserver();
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
