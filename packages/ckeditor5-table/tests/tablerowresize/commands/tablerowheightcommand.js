/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';

import { TableSelection } from '../../../src/tableselection.js';
import { TableCellPropertiesEditing } from '../../../src/tablecellproperties/tablecellpropertiesediting.js';
import { TableRowResizeEditing } from '../../../src/tablerowresize/tablerowresizeediting.js';

describe( 'TableRowHeightCommand', () => {
	let editor, model, command;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableRowResizeEditing, TableCellPropertiesEditing, TableSelection, Paragraph, UndoEditing ]
		} );

		model = editor.model;
		command = editor.commands.get( 'tableRowHeight' );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	function getRow( index ) {
		return model.document.getRoot().getNodeByPath( [ 0, index ] );
	}

	function getCell( rowIndex, cellIndex ) {
		return getRow( rowIndex ).getChild( cellIndex );
	}

	function selectCells( fromCell, toCell ) {
		editor.plugins.get( TableSelection ).setCellSelection( fromCell, toCell );
	}

	const twoRowTable =
		'<table>' +
			'<tableRow rowHeight="40px">' +
				'<tableCell><paragraph>[]00</paragraph></tableCell>' +
				'<tableCell><paragraph>01</paragraph></tableCell>' +
			'</tableRow>' +
			'<tableRow>' +
				'<tableCell><paragraph>10</paragraph></tableCell>' +
				'<tableCell><paragraph>11</paragraph></tableCell>' +
			'</tableRow>' +
		'</table>';

	describe( 'isEnabled', () => {
		it( 'should be enabled when the selection is in a table cell', () => {
			_setModelData( model, twoRowTable );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be disabled when the selection is outside a table', () => {
			_setModelData( model, '<paragraph>[]foo</paragraph>' + twoRowTable.replace( '[]', '' ) );

			expect( command.isEnabled ).toBe( false );
		} );

		it( 'should be enabled when multiple cells are selected', () => {
			_setModelData( model, twoRowTable );
			selectCells( getCell( 0, 0 ), getCell( 1, 1 ) );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be disabled when the selected cells are in different tables', () => {
			_setModelData( model, twoRowTable + twoRowTable.replace( '[]', '' ) );

			const root = model.document.getRoot();

			model.change( writer => {
				writer.setSelection( [
					writer.createRangeOn( root.getNodeByPath( [ 0, 0, 0 ] ) ),
					writer.createRangeOn( root.getNodeByPath( [ 1, 1, 0 ] ) )
				] );
			} );

			expect( command.isEnabled ).toBe( false );
		} );
	} );

	describe( 'value', () => {
		it( 'should be the height of the row of the selected cell', () => {
			_setModelData( model, twoRowTable );

			expect( command.value ).toBe( '40px' );
		} );

		it( 'should be null when the row has no height', () => {
			_setModelData( model, twoRowTable.replace( '[]00', '00' ).replace( '>10<', '>[]10<' ) );

			expect( command.value ).toBe( null );
		} );

		it( 'should be null when the selection is outside a table', () => {
			_setModelData( model, '<paragraph>[]foo</paragraph>' );

			expect( command.value ).toBe( null );
		} );

		it( 'should be the height of the selected cell when the row has no height', () => {
			_setModelData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell tableCellHeight="100px"><paragraph>[]00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( command.value ).toBe( '100px' );
		} );

		it( 'should not be the height of another cell when the row has no height', () => {
			_setModelData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell tableCellHeight="100px"><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph>[]01</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( command.value ).toBe( null );
		} );

		it( 'should be the row height even when a cell height is higher', () => {
			_setModelData( model,
				'<table>' +
					'<tableRow rowHeight="60px">' +
						'<tableCell tableCellHeight="100px"><paragraph>[]00</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( command.value ).toBe( '60px' );
		} );

		it( 'should be the height of the selected cell spanning several rows when its last row has no height', () => {
			_setModelData( model,
				'<table>' +
					'<tableRow rowHeight="40px">' +
						'<tableCell rowspan="2" tableCellHeight="100px"><paragraph>[]00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( command.value ).toBe( '100px' );
		} );

		it( 'should be a height in any unit', () => {
			_setModelData( model,
				'<table>' +
					'<tableRow rowHeight="21pt">' +
						'<tableCell><paragraph>[]00</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( command.value ).toBe( '21pt' );
		} );

		it( 'should be the height of the first row when multiple rows are selected', () => {
			_setModelData( model, twoRowTable );
			selectCells( getCell( 1, 1 ), getCell( 0, 0 ) );

			expect( command.value ).toBe( '40px' );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should set the height of the row of the selected cell', () => {
			_setModelData( model, twoRowTable );

			command.execute( { value: '60px' } );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '60px' );
			expect( getRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
		} );

		it( 'should add the px unit to a numeric value', () => {
			_setModelData( model, twoRowTable );

			command.execute( { value: 60 } );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '60px' );
		} );

		it( 'should add the px unit to a numeric string value', () => {
			_setModelData( model, twoRowTable );

			command.execute( { value: '60.5' } );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '60.5px' );
		} );

		it( 'should accept a fractional height and a height with white spaces around', () => {
			_setModelData( model, twoRowTable );

			command.execute( { value: ' 60.5px ' } );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '60.5px' );
		} );

		it( 'should accept a zero height', () => {
			_setModelData( model, twoRowTable );

			command.execute( { value: 0 } );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '0px' );
		} );

		it( 'should set the height of every selected row', () => {
			_setModelData( model, twoRowTable );
			selectCells( getCell( 0, 0 ), getCell( 1, 0 ) );

			command.execute( { value: '60px' } );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '60px' );
			expect( getRow( 1 ).getAttribute( 'rowHeight' ) ).toBe( '60px' );
		} );

		it( 'should remove the height when the value is empty', () => {
			_setModelData( model, twoRowTable );

			command.execute( { value: '' } );

			expect( getRow( 0 ).hasAttribute( 'rowHeight' ) ).toBe( false );
		} );

		it( 'should remove the height when the value is only whitespace, as the height field accepts it as empty', () => {
			_setModelData( model, twoRowTable );

			command.execute( { value: '  ' } );

			expect( getRow( 0 ).hasAttribute( 'rowHeight' ) ).toBe( false );
		} );

		it( 'should remove the height when the value is not passed', () => {
			_setModelData( model, twoRowTable );

			command.execute();

			expect( getRow( 0 ).hasAttribute( 'rowHeight' ) ).toBe( false );
		} );

		for ( const value of [ '21pt', '1in', '2cm', '5em', '50%', '10vh', 'foo', 'NaNpx', 'pxpx', '-10px', '-1cm', -10, NaN ] ) {
			it( `should not change the model for an unsupported value (${ JSON.stringify( value ) })`, () => {
				_setModelData( model, twoRowTable );

				const dataBefore = _getModelData( model );

				command.execute( { value } );

				expect( _getModelData( model ) ).toBe( dataBefore );
			} );
		}

		it( 'should do nothing when the selection is outside a table', () => {
			_setModelData( model, '<paragraph>[]foo</paragraph>' + twoRowTable.replace( '[]', '' ) );

			const dataBefore = _getModelData( model );

			command.execute( { value: '60px' } );

			expect( _getModelData( model ) ).toBe( dataBefore );
		} );

		it( 'should make the change in the passed batch', () => {
			_setModelData( model, twoRowTable );

			const batch = model.createBatch();

			command.execute( { value: '60px', batch } );
			command.execute( { value: '70px', batch } );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '70px' );

			editor.execute( 'undo', batch );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
		} );

		it( 'should be a single undo step', () => {
			_setModelData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell tableCellHeight="100px"><paragraph>[]00</paragraph></tableCell>' +
						'<tableCell tableCellHeight="80px"><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			command.execute( { value: '60px' } );
			editor.execute( 'undo' );

			expect( getRow( 0 ).hasAttribute( 'rowHeight' ) ).toBe( false );
			expect( getCell( 0, 0 ).getAttribute( 'tableCellHeight' ) ).toBe( '100px' );
			expect( getCell( 0, 1 ).getAttribute( 'tableCellHeight' ) ).toBe( '80px' );
		} );

		describe( 'cells spanning several rows', () => {
			// A cell spanning rows 0-2, next to three regular rows.
			const spanningTable =
				'<table>' +
					'<tableRow rowHeight="40px">' +
						'<tableCell rowspan="3"><paragraph>[]00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow rowHeight="50px"><tableCell><paragraph>11</paragraph></tableCell></tableRow>' +
					'<tableRow rowHeight="60px"><tableCell><paragraph>21</paragraph></tableCell></tableRow>' +
				'</table>';

			it( 'should set the height of the last row the cell spans', () => {
				_setModelData( model, spanningTable );

				command.execute( { value: '90px' } );

				expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
				expect( getRow( 1 ).getAttribute( 'rowHeight' ) ).toBe( '50px' );
				expect( getRow( 2 ).getAttribute( 'rowHeight' ) ).toBe( '90px' );
			} );

			it( 'should have the value of the last row the cell spans', () => {
				_setModelData( model, spanningTable );

				expect( command.value ).toBe( '60px' );
			} );

			it( 'should set the height of the row of a regular cell in the first row the spanning cell covers', () => {
				_setModelData( model, spanningTable.replace( '[]00', '00' ).replace( '>01<', '>[]01<' ) );

				command.execute( { value: '90px' } );

				expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '90px' );
				expect( getRow( 2 ).getAttribute( 'rowHeight' ) ).toBe( '60px' );
			} );

			it( 'should set the heights of the rows of all selected cells, including a spanning one', () => {
				_setModelData( model, spanningTable );
				selectCells( getCell( 0, 0 ), getCell( 0, 1 ) );

				command.execute( { value: '90px' } );

				expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '90px' );
				expect( getRow( 1 ).getAttribute( 'rowHeight' ) ).toBe( '50px' );
				expect( getRow( 2 ).getAttribute( 'rowHeight' ) ).toBe( '90px' );
			} );
		} );

		describe( 'cell heights', () => {
			it( 'should remove the heights of the cells in the row', () => {
				_setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell tableCellHeight="100px"><paragraph>[]00</paragraph></tableCell>' +
							'<tableCell tableCellHeight="80px"><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { value: '60px' } );

				expect( getCell( 0, 0 ).hasAttribute( 'tableCellHeight' ) ).toBe( false );
				expect( getCell( 0, 1 ).hasAttribute( 'tableCellHeight' ) ).toBe( false );
			} );

			it( 'should remove the height of a cell spanning the row from a row above', () => {
				_setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell rowspan="2" tableCellHeight="100px"><paragraph>00</paragraph></tableCell>' +
							'<tableCell><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]11</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { value: '60px' } );

				expect( getRow( 1 ).getAttribute( 'rowHeight' ) ).toBe( '60px' );
				expect( getCell( 0, 0 ).hasAttribute( 'tableCellHeight' ) ).toBe( false );
			} );

			it( 'should not remove the heights of the cells in other rows', () => {
				_setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]00</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell tableCellHeight="100px"><paragraph>10</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { value: '60px' } );

				expect( getCell( 1, 0 ).getAttribute( 'tableCellHeight' ) ).toBe( '100px' );
			} );

			it( 'should remove the heights of the cells covering the row when the row height is removed', () => {
				_setModelData( model,
					'<table>' +
						'<tableRow rowHeight="40px">' +
							'<tableCell rowspan="2" tableCellHeight="120px"><paragraph>00</paragraph></tableCell>' +
							'<tableCell tableCellHeight="100px"><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell tableCellHeight="90px"><paragraph>[]11</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { value: '' } );

				// The cells covering the second row (including the one spanned from the first row) lose their heights.
				expect( getRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
				expect( getCell( 1, 0 ).hasAttribute( 'tableCellHeight' ) ).toBe( false );
				expect( getCell( 0, 0 ).hasAttribute( 'tableCellHeight' ) ).toBe( false );

				// The first row and its own cell are not touched.
				expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
				expect( getCell( 0, 1 ).getAttribute( 'tableCellHeight' ) ).toBe( '100px' );
			} );

			it( 'should clear a height that comes only from a cell, so the value becomes empty', () => {
				_setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell tableCellHeight="96px"><paragraph>[]00</paragraph></tableCell>' +
							'<tableCell><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				expect( command.value ).toBe( '96px' );

				command.execute( { value: '' } );

				expect( getCell( 0, 0 ).hasAttribute( 'tableCellHeight' ) ).toBe( false );
				expect( command.value ).toBe( null );
			} );
		} );
	} );
} );
