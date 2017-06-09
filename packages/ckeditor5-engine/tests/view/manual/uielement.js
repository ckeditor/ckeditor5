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
import ContainerElement from '../../../src/view/containerelement';

class MyUIElement extends UIElement {
	render( domDocument ) {
		const root = super.render( domDocument );

		root.setAttribute( 'contenteditable', 'false' );
		root.classList.add( 'ui-element' );
		root.innerHTML = 'UIElement with some <b>structure</b> inside <img src="close.png" />';

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

		schema.registerItem( 'figure', '$block' );

		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromElement( 'figure' )
			.toElement( () => {
				return new ContainerElement( 'figure', null, new MyUIElement( 'div' ) );
			} );

		buildViewConverter().for( data.viewToModel )
			.fromElement( 'figure' )
			.toElement( 'figure' );
	}
}

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Undo, UIElementTestPlugin ],
	toolbar: [ 'undo', 'redo' ]
} );

/*
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import buildModelConverter from '../../../src/conversion/buildmodelconverter';
import buildViewConverter from '../../../src/conversion/buildviewconverter';
import UIElement from '../../../src/view/uielement';
import AttributeElement from '../../../src/view/attributeelement';

class MyUIElement extends UIElement {
	render( domDocument ) {
		const root = super.render( domDocument );

		root.setAttribute( 'contenteditable', 'false' );
		root.style.backgroundColor = 'red';
		root.style.display = 'inline-block';
		root.style.width = '5px';
		root.style.height = '5px';

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

		// Allow bold attribute on all inline nodes.
		editor.document.schema.allow( { name: '$inline', attributes: [ 'strong' ], inside: '$block' } );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromAttribute( 'strong' )
			.toElement( data => {
				return new AttributeElement( 'strong', null, [ new MyUIElement( 'span' ) ] );
				// return new UIElement( 'strong' );
			} );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 'strong' )
			.toAttribute( 'strong', true );
	}
}

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Undo, UIElementTestPlugin ],
	toolbar: [ 'undo', 'redo' ]
} );

 */
