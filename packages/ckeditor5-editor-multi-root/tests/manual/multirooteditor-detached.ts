/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { MultiRootEditor } from '../../src/multirooteditor.js';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
declare global {
	interface Window {
		editor: any;
		editables: any;
	}
}

const roots = {
	intro: {
		initialData: '<p><strong>Exciting</strong> intro text to an article.</p>',
		modelElement: '$inlineRoot',
		element: 'h1',
		placeholder: 'Type title'
	},
	content: {
		initialData: '<h2>Exciting news!</h2><p>Lorem ipsum dolor sit amet.</p>',
		placeholder: 'Type content'
	},
	outro: {
		initialData: '<p>Closing text.</p>',
		modelElement: '$inlineRoot',
		element: {
			name: 'span',
			styles: {
				display: 'inline-block',
				'max-width': 'fit-content',
				'vertical-align': 'middle'
			}
		},
		placeholder: '-- sign --'
	}
};
let editor: any;

function initEditor() {
	MultiRootEditor
		.create( {
			roots,
			plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic ],
			toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ]
		} )
		.then( newEditor => {
			console.log( 'Editor was initialized', newEditor );

			document.querySelector( '.toolbar-container' )!.appendChild( newEditor.ui.view.toolbar.element! );
			document.querySelector( '.menubar-container' )!.appendChild( newEditor.ui.view.menuBarView.element! );

			const editableContainer = document.querySelector( '.editable-container' );

			editableContainer!.insertBefore( newEditor.ui.getEditableElement( 'intro' )!, editableContainer!.lastElementChild );
			editableContainer!.insertBefore( newEditor.ui.getEditableElement( 'content' )!, editableContainer!.lastElementChild );

			document.querySelector( '.signature-container' )!.appendChild( newEditor.ui.getEditableElement( 'outro' )! );

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
			editor.ui.view.menuBarView.element.remove();

			for ( const editable of Object.values( editor.ui.view.editables ) ) {
				( editable as any ).element.remove();
			}

			window.editor = editor = null;
			window.editables = null;

			console.log( 'Editor was destroyed' );
		} );
}

document.getElementById( 'initEditor' )!.addEventListener( 'click', initEditor );
document.getElementById( 'destroyEditor' )!.addEventListener( 'click', destroyEditor );

initEditor();
