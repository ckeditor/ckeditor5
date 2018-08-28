/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Table from '@ckeditor/ckeditor5-table/src/table';

import { stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import PasteFromOffice from '../../src/pastefromoffice';

const htmlDiv = document.querySelector( '#html' );
const textDiv = document.querySelector( '#text' );
const dataDiv = document.querySelector( '#data' );

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Strikethrough, Underline, Table, PasteFromOffice ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'strikethrough', 'underline', 'link',
			'bulletedList', 'numberedList', 'blockQuote', 'table', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
		const clipboard = editor.plugins.get( 'Clipboard' );

		editor.editing.view.document.on( 'paste', ( evt, data ) => {
			console.clear();

			console.log( '----- paste -----' );
			console.log( data );
			console.log( 'text/html\n', data.dataTransfer.getData( 'text/html' ) );
			console.log( 'text/plain\n', data.dataTransfer.getData( 'text/plain' ) );

			htmlDiv.innerText = data.dataTransfer.getData( 'text/html' );
			textDiv.innerText = data.dataTransfer.getData( 'text/plain' );
		} );

		clipboard.on( 'inputTransformation', ( evt, data ) => {
			console.log( '----- clipboardInput -----' );
			console.log( 'stringify( data.dataTransfer )\n', stringifyView( data.content ) );

			dataDiv.innerText = stringifyView( data.content );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
