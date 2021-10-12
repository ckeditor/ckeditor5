/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window */

import ClassicEditor from '../../src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import { createObserver } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { Command, Plugin } from '@ckeditor/ckeditor5-core';

let editor, editable, observer;

class MyCommand extends Command {
	execute() {
		this.editor.model.change( writer => {
			// Insert <simpleBox>*</simpleBox> at the current selection position
			// in a way that will result in creating a valid model structure.
			this.editor.model.insertContent( writer.createElement( 'el' ) );
		} );
	}

	refresh() {
		this.isEnabled = true;
	}
}

class TestPlugin extends Plugin {
	init() {
		this.editor.commands.add( 'myCommand', new MyCommand( this.editor ) );

		this.editor.model.schema.register( 'el', {
			inheritAllFrom: '$block'
		} );

		this.editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'el',
			view: ( modelElement, { writer } ) => {
				const section = writer.createContainerElement( 'section' );
				const img = writer.createEmptyElement( 'img' );

				writer.insert( writer.createPositionAt( section, 0 ), img );

				return section;
			}
		} );
	}
}

function initEditor() {
	ClassicEditor
		.create( document.querySelector( '#editor' ), {
			plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic, TestPlugin ],
			toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ]
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
