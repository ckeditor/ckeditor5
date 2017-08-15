/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import UIElement from '../../../src/view/uielement';
import Position from '../../../src/view/position';
import writer from '../../../src/view/writer';

class EndingUIElement extends UIElement {
	render( domDocument ) {
		const root = super.render( domDocument );

		root.classList.add( 'ui-element' );
		root.innerHTML = 'END OF PARAGRAPH';

		return root;
	}
}

class MiddleUIElement extends UIElement {
	render( domDocument ) {
		const root = super.render( domDocument );

		root.classList.add( 'ui-element' );
		root.innerHTML = 'X';

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
			viewP.appendChildren( new EndingUIElement( 'span' ) );
		}, { priority: 'lowest' } );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Undo, Bold, Italic, UIElementTestPlugin ],
		toolbar: [ 'undo', 'redo', 'bold', 'italic' ]
	} )
	.then( editor => {
		window.editor = editor;

		// Add some UI elements.
		const viewRoot = editor.editing.view.getRoot();
		const viewText1 = viewRoot.getChild( 0 ).getChild( 0 );
		const viewText2 = viewRoot.getChild( 1 ).getChild( 0 );

		writer.insert( new Position( viewText1, 20 ), new MiddleUIElement( 'span' ) );
		writer.insert( new Position( viewText1, 20 ), new MiddleUIElement( 'span' ) );
		writer.insert( new Position( viewText2, 0 ), new MiddleUIElement( 'span' ) );
		writer.insert( new Position( viewText2, 6 ), new MiddleUIElement( 'span' ) );

		editor.editing.view.render();
	} )
	.catch( err => {
		console.error( err.stack );
	} );

