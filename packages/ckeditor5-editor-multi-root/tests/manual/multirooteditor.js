/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window */

import MultiRootEditor from '../../src/multirooteditor';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';

const editorData = {
	intro: document.querySelector( '#editor-intro' ),
	content: document.querySelector( '#editor-content' ),
	outro: document.querySelector( '#editor-outro' )
};

let editor;

function initEditor() {
	MultiRootEditor
		.create( editorData, {
			plugins: [ Essentials, Paragraph, Heading, Bold, Italic ],
			toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ]
		} )
		.then( newEditor => {
			console.log( 'Editor was initialized', newEditor );

			document.querySelector( '.toolbar-container' ).appendChild( newEditor.ui.view.toolbar.element );

			window.editor = editor = newEditor;
			window.editables = newEditor.ui.view.editables;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

function destroyEditor() {
	editor.destroy()
		.then( () => {
			editor.ui.view.toolbar.element.remove();

			window.editor = editor = null;
			window.editables = null;

			console.log( 'Editor was destroyed' );
		} );
}

document.getElementById( 'initEditor' ).addEventListener( 'click', initEditor );
document.getElementById( 'destroyEditor' ).addEventListener( 'click', destroyEditor );
