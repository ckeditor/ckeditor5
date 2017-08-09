/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import buildModelConverter from '../../src/conversion/buildmodelconverter';
import buildViewConverter from '../../src/conversion/buildviewconverter';
import ViewContainerElement from '../../src/view/containerelement';
import ViewEditableElement from '../../src/view/editableelement';
import { getData } from '../../src/dev-utils/model';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import './nestededitable.scss';

class NestedEditable extends Plugin {
	init() {
		const editor = this.editor;
		const document = editor.document;
		const editing = editor.editing;
		const viewDocument = editing.view;
		const data = editor.data;
		const schema = document.schema;

		schema.registerItem( 'figure' );
		schema.registerItem( 'figcaption' );
		schema.allow( { name: 'figure', inside: '$root' } );
		schema.allow( { name: 'figcaption', inside: 'figure' } );
		schema.objects.add( 'figure' );

		schema.allow( { name: '$inline', inside: 'figure' } );
		schema.allow( { name: '$inline', inside: 'figcaption' } );

		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromElement( 'figure' )
			.toElement( () => new ViewContainerElement( 'figure', { contenteditable: 'false' } ) );

		buildViewConverter().for( data.viewToModel )
			.fromElement( 'figure' )
			.toElement( 'figure' );

		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromElement( 'figcaption' )
			.toElement( () => {
				const element = new ViewEditableElement( 'figcaption', { contenteditable: 'true' } );
				element.document = viewDocument;

				element.on( 'change:isFocused', ( evt, property, is ) => {
					if ( is ) {
						element.addClass( 'focused' );
					} else {
						element.removeClass( 'focused' );
					}
				} );

				return element;
			} );

		buildViewConverter().for( data.viewToModel )
			.fromElement( 'figcaption' )
			.toElement( 'figcaption' );
	}
}

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, NestedEditable, Undo ],
		toolbar: [ 'undo', 'redo' ]
	} )
	.then( editor => {
		editor.document.on( 'changesDone', () => {
			printModelContents( editor );
		} );

		printModelContents( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const modelDiv = global.document.querySelector( '#model' );
function printModelContents( editor ) {
	modelDiv.innerText = getData( editor.document );
}
