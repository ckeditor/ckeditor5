/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console */

import { getData } from '../../src/dev-utils/model';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

import './selection.css';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

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
			view: ( modelItem, viewWriter ) => {
				return toWidget( viewWriter.createContainerElement( 'table' ), viewWriter );
			}
		} );
		editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableRow', view: 'tr' } );

		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'tableCell',
			view: ( modelItem, viewWriter ) => {
				return toWidgetEditable( viewWriter.createEditableElement( 'td' ), viewWriter );
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
