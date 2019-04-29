/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EnterPlugin from '@ckeditor/ckeditor5-enter/src/enter';
import TypingPlugin from '@ckeditor/ckeditor5-typing/src/typing';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '../../src/image';
import UndoPlugin from '@ckeditor/ckeditor5-undo/src/undo';
import ClipboardPlugin from '@ckeditor/ckeditor5-clipboard/src/clipboard';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

class ResizeFeaturePlugin extends Plugin {
	init() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;

		this.listenTo( viewDocument, 'selectionChange', ( ...args ) => this._onSelectionChange( ...args ) );
		// viewDocument.selection.on( 'change', this._onSelectionChange );
	}

	_onSelectionChange( eventInfo, data ) {
		console.log( 'sel change' );
		const selection = data.newSelection;
		const selectedElement = selection.getSelectedElement();

		if ( selectedElement && selectedElement.hasClass( 'ck-widget' ) ) {

			// const mapper = this.editor.editing.mapper;
			// const modelElement = mapper.toModelElement( selectedElement );
			// foo
		}

		console.log( selectedElement );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			EnterPlugin,
			TypingPlugin,
			ParagraphPlugin,
			HeadingPlugin,
			ImagePlugin,
			UndoPlugin,
			ClipboardPlugin,
			ResizeFeaturePlugin
		],
		toolbar: [ 'heading', '|', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
