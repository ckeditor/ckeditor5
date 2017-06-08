/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import buildModelConverter from '../../../src/conversion/buildmodelconverter';
import buildViewConverter from '../../../src/conversion/buildviewconverter';
import UIElement from '../../../src/view/uielement';

class MyUIElement extends UIElement {
	render( domDocument ) {
		const root = super.render( domDocument );

		root.setAttribute( 'contenteditable', 'false' );
		root.style.backgroundColor = 'red';
		root.innerHTML = 'This is UIElement';

		return root;
	}
}

class UIElementTestPlugin extends Plugin {
	init() {
		const editor = this.editor;
		const document = editor.document;
		const editing = editor.editing;
		const data = editor.data;
		const schema = document.schema;

		schema.registerItem( 'span', '$inline' );

		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromElement( 'span' )
			.toElement( () => new MyUIElement( 'span' ) );

		buildViewConverter().for( data.viewToModel )
			.fromElement( 'span' )
			.toElement( 'span' );
	}
}

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Undo, UIElementTestPlugin ],
	toolbar: [ 'undo', 'redo' ]
} );
