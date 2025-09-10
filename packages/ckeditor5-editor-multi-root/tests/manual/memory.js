/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { MultiRootEditor } from '../../src/multirooteditor.js';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';

function initEditor() {
	const editorData = {
		intro: document.querySelector( '#editor-intro' ),
		content: document.querySelector( '#editor-content' ),
		outro: document.querySelector( '#editor-outro' )
	};

	let editor;

	MultiRootEditor
		.create( editorData, {
			plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic ],
			toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ]
		} )
		.then( newEditor => {
			editor = newEditor;
			document.querySelector( '.toolbar-container' ).appendChild( newEditor.ui.view.toolbar.element );
		} )
		.catch( err => {
			console.error( err.stack );
		} );

	document.getElementById( 'destroyEditor' ).addEventListener( 'click', destroyEditor );

	function destroyEditor() {
		editor.destroy()
			.then( () => {
				editor.ui.view.toolbar.element.remove();
			} );

		document.getElementById( 'destroyEditor' ).removeEventListener( 'click', destroyEditor );
	}
}

document.getElementById( 'initEditor' ).addEventListener( 'click', initEditor );
