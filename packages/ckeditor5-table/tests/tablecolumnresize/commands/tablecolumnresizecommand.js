/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';

import TableColumnResize from '../../../src/tablecolumnresize.js';
import Table from '../../../src/table.js';
import { modelTable } from '../../_utils/utils.js';

const DEFAULT_TABLE_DATA = [
	[ '00', '01', '02' ],
	[ '10', '11', '12' ],
	[ '20', '21', '22' ]
];

describe( 'TableColumnResizeCommand', () => {
	let model, modelRoot, editor, editorElement, command, tableSelection;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Table, TableColumnResize, Paragraph, ClipboardPipeline ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
		command = editor.commands.get( 'resizeTableColumn' );
		tableSelection = editor.plugins.get( 'TableSelection' );

		setModelData( model, modelTable( DEFAULT_TABLE_DATA, { tableWidth: '40%' } ) );
		selectColumn();
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	describe( 'Check resize table columns width', () => {
		let resizeTableWidthSpy;

		beforeEach( () => {
			resizeTableWidthSpy = sinon.spy( editor, 'execute' );
		} );

		it( 'should be possible to make single selected column smaller', () => {
			command.execute( { newColumnWidth: 0.1 * getTableWidth() } );
			expectColumnInnerWidths( [ '33.33%', '10.02%', '56.66%' ] );
		} );

		it( 'should be possible to make single selected column bigger', () => {
			command.execute( { newColumnWidth: 0.5 * getTableWidth() } );
			expectColumnInnerWidths( [ '33.33%', '50.1%', '16.57%' ] );
		} );

		function expectColumnInnerWidths( columnWidths ) {
			const normalizePercentage = num => Number( num.toString().split( '.' )[ 0 ] );

			// Compare only integer part of percentage. Karma that runs in CI seems to use browser with different settings
			// and screen resolution. It leads to a bit shifted values in table scaling.
			expect( resizeTableWidthSpy ).to.be.calledWith( 'resizeTableWidth', {
				columnWidths: sinon.match( array => columnWidths.every(
					( item, index ) => normalizePercentage( item ) === normalizePercentage( array[ index ] ) )
				),
				table: sinon.match.object,
				tableWidth: sinon.match.string
			} );
		}

		function getTableWidth() {
			return document.querySelector( 'table' ).getBoundingClientRect().width;
		}
	} );

	function selectColumn( columnIndex = 1 ) {
		tableSelection.setCellSelection(
			modelRoot.getNodeByPath( [ 0, 0, columnIndex ] ),
			modelRoot.getNodeByPath( [ 0, 1, columnIndex ] )
		);
	}
} );
