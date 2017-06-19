/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import UIElement from '../../../src/view/uielement';

class MyUIElement extends UIElement {
	render( domDocument ) {
		const root = super.render( domDocument );

		root.setAttribute( 'contenteditable', 'false' );
		root.classList.add( 'ui-element' );
		root.innerHTML = '<span>END OF PARAGRAPH</span>';

		return root;
	}
}

class UIElementTestPlugin extends Plugin {
	init() {
		const editor = this.editor;
		const editing = editor.editing;

		// Add some UIElement to each paragraph.
		editing.modelToView.on( 'insert:paragraph', ( evt, data, consumable, conversionApi ) => {
			const viewP = conversionApi.mapper.toViewElement( data.item );
			viewP.appendChildren( new MyUIElement( 'div' ) );
		}, { priority: 'lowest' } );
	}
}

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Undo, UIElementTestPlugin ],
	toolbar: [ 'undo', 'redo' ]
} );
