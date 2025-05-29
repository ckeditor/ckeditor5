/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '../../src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Link, Bold, Italic, Typing, Paragraph, Undo, Enter, TestPlugin ],
		toolbar: [ 'link', 'bold', 'italic', '|', 'undo', 'redo', '|', 'scrollToSelection', 'showBalloon' ],
		ui: { viewportOffset: { top: 120 } }
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function TestPlugin( editor ) {
	const editingView = editor.editing.view;

	editor.ui.componentFactory.add( 'scrollToSelection', () => {
		const view = new ButtonView( editor.locale );

		view.set( {
			label: 'Scroll to the selection',
			withText: true
		} );

		view.on( 'execute', () => {
			editor.editing.view.scrollToTheSelection();
			editor.editing.view.focus();
		} );

		return view;
	} );

	editor.ui.componentFactory.add( 'showBalloon', () => {
		const showButton = new ButtonView( editor.locale );

		showButton.set( {
			label: 'Show balloon',
			withText: true
		} );

		showButton.on( 'execute', () => {
			editor.editing.view.focus();
			showButton.isEnabled = false;

			const balloon = editor.plugins.get( 'ContextualBalloon' );
			const hideButton = new ButtonView( editor.locale );

			hideButton.set( {
				label: 'Hide balloon',
				withText: true
			} );

			hideButton.on( 'execute', () => {
				editor.editing.view.focus();
				balloon.remove( hideButton );
				editor.ui.stopListening( editor.ui, 'update', update );
				showButton.isEnabled = true;
			} );

			balloon.add( {
				view: hideButton,
				position: {
					target: editingView.domConverter.viewRangeToDom( editingView.document.selection.getFirstRange() )
				}
			} );

			editor.ui.on( 'update', update );

			function update() {
				balloon.updatePosition( {
					target: editingView.domConverter.viewRangeToDom( editingView.document.selection.getFirstRange() )
				} );
			}
		} );

		return showButton;
	} );
}

document.querySelector( '#header-size' ).addEventListener( 'click', evt => {
	evt.preventDefault();

	const header = document.querySelector( 'header' );
	const headerPlaceholder = document.querySelector( '#header-placeholder' );
	const height = window.editor.ui.viewportOffset.top > 100 ? 60 : 120;

	header.style.height = `${ height }px`;
	header.style.lineHeight = `${ height }px`;
	headerPlaceholder.style.height = `${ height }px`;

	window.editor.ui.viewportOffset = { top: height };
	window.editor.focus();
} );
