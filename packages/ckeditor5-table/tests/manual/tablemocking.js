/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import { createTableAsciiArt, modelTable, prepareModelTableInput, prettyFormatModelTableInput } from '../_utils/utils';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { diffString } from 'json-diff';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import TableWalker from '../../src/tablewalker';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: [
			'insertTable', 'undo', 'redo'
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		}
	} )
	.then( editor => {
		window.editor = editor;

		const asciiOut = document.getElementById( 'ascii-art' );
		const modelData = document.getElementById( 'model-data' );

		document.getElementById( 'clear-content' ).addEventListener( 'click', () => {
			editor.setData( '' );
		} );

		document.getElementById( 'set-model-data' ).addEventListener( 'click', () => {
			updateInputStatus();

			const inputModelData = parseModelData( modelData.value );
			setModelData( editor.model, inputModelData ? modelTable( inputModelData ) : '' );
		} );

		document.getElementById( 'get-model-data' ).addEventListener( 'click', () => {
			updateInputStatus();

			const table = findTable( editor );
			modelData.value = table ? prettyFormatModelTableInput( prepareModelTableInput( editor.model, table ) ) : '';

			updateAsciiAndDiff();
		} );

		document.getElementById( 'renumber-cells' ).addEventListener( 'click', () => {
			const table = findTable( editor );

			if ( !table ) {
				return;
			}

			const useLetters = document.getElementById( 'use-letters' ).checked;

			editor.model.change( writer => {
				for ( const { row, column, cell } of new TableWalker( table ) ) {
					const selection = editor.model.createSelection( cell, 'in' );

					editor.model.insertContent( writer.createText( createCellText( row, column, useLetters ) ), selection );
				}
			} );

			updateAsciiAndDiff();
		} );

		editor.model.document.on( 'change:data', updateAsciiAndDiff );
		updateAsciiAndDiff();

		function updateAsciiAndDiff() {
			const table = findTable( editor );

			if ( !table ) {
				asciiOut.innerText = '-- table not found --';
				return;
			}

			const inputModelData = parseModelData( modelData.value );
			const currentModelData = prepareModelTableInput( editor.model, table );

			const diffOutput = inputModelData ? diffString( inputModelData, currentModelData, {
				theme: {
					' ': string => string,
					'+': string => `<span class="diff-add">${ string }</span>`,
					'-': string => `<span class="diff-del">${ string }</span>`
				}
			} ) : '-- no input --';

			asciiOut.innerHTML = createTableAsciiArt( editor.model, table ) + '\n\n' +
				'Diff: input vs post-fixed model:\n' + ( diffOutput ? diffOutput : '-- no differences --' );
		}

		function findTable( editor ) {
			const range = editor.model.createRangeIn( editor.model.document.getRoot() );

			for ( const element of range.getItems() ) {
				if ( element.is( 'table' ) ) {
					return element;
				}
			}

			return null;
		}

		function parseModelData( string ) {
			if ( !string.trim() ) {
				return null;
			}

			const jsonString = string
				.replace( /'/g, '"' )
				.replace( /([a-z0-9$_]+)\s*:/gi, '"$1":' );

			try {
				return JSON.parse( jsonString );
			} catch ( error ) {
				updateInputStatus( error.message );
			}

			return null;
		}

		function updateInputStatus( message = '' ) {
			document.getElementById( 'input-status' ).innerText = message;
		}

		function createCellText( row, column, useLetters ) {
			const rowLabel = useLetters ? String.fromCharCode( row + 'a'.charCodeAt( 0 ) ) : row;
			const columnLabel = useLetters ? String.fromCharCode( column + 'a'.charCodeAt( 0 ) ) : column;

			return `${ rowLabel }${ columnLabel }`;
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );
