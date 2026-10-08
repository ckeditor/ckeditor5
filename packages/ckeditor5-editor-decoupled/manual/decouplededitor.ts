/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { DecoupledEditor } from '../src/decouplededitor.js';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { createObserver } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

import { getOverlayConfig, wrapInShadowRoot } from '@ckeditor/ckeditor5-ui/manual/_utils/shadow.js';

declare global {
	interface Window {
		editor: any;
		editable: any;
	}
}

const uiRoot: Document | ShadowRoot = wrapInShadowRoot( document.getElementById( 'editor-ui' )! ) ?? document;

const editorData = '<h2>Hello world</h2><p>This is the decoupled editor.</p>';
let editor: any, editable, observer: any;

function initEditor() {
	DecoupledEditor
		.create( {
			...getOverlayConfig(),
			root: {
				initialData: editorData,
				modelAttributes: {
					section: 'intro'
				}
			},
			plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic ],
			toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ]
		} )
		.then( newEditor => {
			console.log( 'Editor was initialized', newEditor );
			console.log( 'You can now play with it using global `editor` and `editable` variables.' );

			uiRoot.querySelector( '.menubar-container' )!.appendChild( newEditor.ui.view.menuBarView.element! );
			uiRoot.querySelector( '.toolbar-container' )!.appendChild( newEditor.ui.view.toolbar.element! );
			uiRoot.querySelector( '.editable-container' )!.appendChild( newEditor.ui.view.editable.element! );

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

document.getElementById( 'initEditor' )!.addEventListener( 'click', initEditor );
document.getElementById( 'destroyEditor' )!.addEventListener( 'click', destroyEditor );
