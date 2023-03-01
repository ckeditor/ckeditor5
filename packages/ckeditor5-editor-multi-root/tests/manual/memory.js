/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document */

import MultiRootEditor from '../../src/multirooteditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

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
