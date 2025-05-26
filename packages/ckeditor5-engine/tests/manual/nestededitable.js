/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { getData } from '../../src/dev-utils/model.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';

import './nestededitable.css';

class NestedEditable extends Plugin {
	init() {
		const editor = this.editor;
		const editing = editor.editing;
		const schema = editor.model.schema;

		schema.register( 'figure', {
			isObject: true
		} );
		schema.register( 'figcaption' );
		schema.extend( 'figure', { allowIn: '$root' } );
		schema.extend( 'figcaption', { allowIn: 'figure' } );
		schema.extend( '$text', {
			allowIn: [ 'figure', 'figcaption' ]
		} );

		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'figure',
			view: {
				name: 'figure',
				attribute: {
					contenteditable: 'false'
				}
			}
		} );

		editor.conversion.for( 'upcast' ).elementToElement( {
			model: 'figure',
			view: 'figure'
		} );

		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'figcaption',
			view: ( modelItem, { writer } ) => {
				const element = writer.createEditableElement( 'figcaption', { contenteditable: 'true' } );

				element.on( 'change:isFocused', ( evt, property, is ) => {
					if ( is ) {
						editing.view.change( writer => writer.addClass( 'focused', element ) );
					} else {
						editing.view.change( writer => writer.removeClass( 'focused', element ) );
					}
				} );

				return element;
			}
		} );

		editor.conversion.for( 'upcast' ).elementToElement( {
			model: 'figcaption',
			view: 'figcaption'
		} );
	}
}

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, NestedEditable, Undo ],
		toolbar: [ 'undo', 'redo' ]
	} )
	.then( editor => {
		editor.model.document.on( 'change', () => {
			printModelContents( editor );
		} );

		printModelContents( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const modelDiv = global.document.querySelector( '#model' );
function printModelContents( editor ) {
	modelDiv.innerText = getData( editor.model );
}
