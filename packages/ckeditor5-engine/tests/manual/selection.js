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

import './selection.css';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';

class SelectionTest extends Plugin {
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		schema.register( 'table', {
			allowWhere: '$block',
			isObject: true,
			isLimit: true
		} );

		schema.register( 'tableRow', {
			allowIn: 'table',
			isLimit: true
		} );

		schema.register( 'tableCell', {
			allowIn: 'tableRow',
			allowContentOf: '$block',
			isLimit: true
		} );

		editor.conversion.for( 'upcast' ).elementToElement( { model: 'table', view: 'table' } );
		editor.conversion.for( 'upcast' ).elementToElement( { model: 'tableRow', view: 'tr' } );
		editor.conversion.for( 'upcast' ).elementToElement( { model: 'tableCell', view: 'td' } );

		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'table',
			view: ( modelItem, { writer } ) => {
				return toWidget( writer.createContainerElement( 'table' ), writer );
			}
		} );
		editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableRow', view: 'tr' } );

		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'tableCell',
			view: ( modelItem, { writer } ) => {
				return toWidgetEditable( writer.createEditableElement( 'td' ), writer );
			}
		} );
	}
}

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, SelectionTest, Undo, Widget ],
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
	modelDiv.innerText = formatTable( getData( editor.model ) );
}

function formatTable( tableString ) {
	return tableString
		.replace( /<table>/g, '\n<table>' )
		.replace( /<tableRow>/g, '\n<tableRow>\n    ' )
		.replace( /<thead>/g, '\n<thead>\n    ' )
		.replace( /<tbody>/g, '\n<tbody>\n    ' )
		.replace( /<tr>/g, '\n<tr>\n    ' )
		.replace( /<\/tableRow>/g, '\n</tableRow>' )
		.replace( /<\/thead>/g, '\n</thead>' )
		.replace( /<\/tbody>/g, '\n</tbody>' )
		.replace( /<\/tr>/g, '\n</tr>' )
		.replace( /<\/table>/g, '\n</table>' );
}
