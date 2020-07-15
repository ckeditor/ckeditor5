/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import { createTableAsciiArt, modelTable, prepareModelTableInput, prettyFormatModelTableInput } from '../_utils/utils';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { diffString } from 'json-diff';
import { debounce } from 'lodash-es';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import TableWalker from '../../src/tablewalker';
import { getSelectionAffectedTableCells } from '../../src/utils/selection';

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

		editor.editing.view.document.on( 'paste', ( evt, data ) => {
			document.getElementById( 'clipboard' ).innerText = data.dataTransfer.getData( 'text/html' ).replace( />(?=<)/g, '>\n' );
		} );

		document.getElementById( 'clear-content' ).addEventListener( 'click', () => {
			editor.setData( '' );
		} );

		document.getElementById( 'set-model-data' ).addEventListener( 'click', () => {
			updateInputStatus();

			const table = findTable( editor );
			const inputModelData = parseModelData( modelData.value );

			if ( inputModelData ) {
				const element = setModelData._parse( modelTable( inputModelData ), editor.model.schema );

				editor.model.change( writer => {
					editor.model.insertContent( element, table ? editor.model.createRangeOn( table ) : null );
					writer.setSelection( element, 'on' );
				} );

				editor.editing.view.focus();
			}
		} );

		document.getElementById( 'get-model-data' ).addEventListener( 'click', () => {
			updateInputStatus();

			const table = findTable( editor, true );
			modelData.value = table ? prettyFormatModelTableInput( prepareModelTableInput( editor.model, table ) ) : '';

			updateAsciiAndDiff();
		} );

		document.getElementById( 'renumber-cells' ).addEventListener( 'click', () => {
			const table = findTable( editor, true );

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

		editor.model.document.on( 'change:data', debounce( () => updateAsciiAndDiff(), 100 ) );
		updateAsciiAndDiff();

		function updateAsciiAndDiff() {
			const tables = getAllTables( editor );

			if ( !tables.length ) {
				asciiOut.innerText = '-- table not found --';
				return;
			}

			const inputModelData = parseModelData( modelData.value );
			const currentModelData = prepareModelTableInput( editor.model, tables[ 0 ] );

			const diffOutput = inputModelData ? diffString( inputModelData, currentModelData, {
				theme: {
					' ': string => string,
					'+': string => `<span class="diff-add">${ string }</span>`,
					'-': string => `<span class="diff-del">${ string }</span>`
				}
			} ) : '-- no input --';

			const asciiArt = tables
				.map( table => createTableAsciiArt( editor.model, table ) )
				.join( '\n\n' );

			asciiOut.innerHTML = asciiArt + '\n\n' +
				'Diff: input vs post-fixed model (only first table):\n' + ( diffOutput ? diffOutput : '-- no differences --' );
		}

		function findTable( editor, useAnyTable = false ) {
			const selection = editor.model.document.selection;

			const tableCells = getSelectionAffectedTableCells( selection );

			if ( tableCells.length ) {
				return tableCells[ 0 ].findAncestor( 'table' );
			}

			const element = selection.getSelectedElement();

			if ( element && element.is( 'table' ) ) {
				return element;
			}

			if ( useAnyTable ) {
				const range = editor.model.createRangeIn( editor.model.document.getRoot() );

				for ( const element of range.getItems() ) {
					if ( element.is( 'table' ) ) {
						return element;
					}
				}
			}

			return null;
		}

		function getAllTables( editor ) {
			const range = editor.model.createRangeIn( editor.model.document.getRoot() );
			const tables = [];

			for ( const element of range.getItems() ) {
				if ( element.is( 'table' ) ) {
					tables.push( element );
				}
			}

			return tables;
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
