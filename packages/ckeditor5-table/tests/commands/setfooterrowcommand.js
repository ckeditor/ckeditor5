/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

import { TableEditing } from '../../src/tableediting.js';
import { TableSelection } from '../../src/tableselection.js';
import { TableLayoutEditing } from '../../src/index.js';
import { assertSelectedCells, modelTable } from '../_utils/utils.js';

import { SetFooterRowCommand } from '../../src/commands/setfooterrowcommand.js';

describe( 'SetFooterRowCommand', () => {
	let editor, model, command;

	beforeEach( async () => {
		editor = await ModelTestEditor.create( {
			plugins: [ Paragraph, TableEditing, TableSelection ],
			table: {
				useTfootElement: true
			}
		} );

		model = editor.model;
		command = new SetFooterRowCommand( editor );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be false if selection is not in a table', () => {
			_setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true if selection is in table', () => {
			_setModelData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if multiple cells are selected', () => {
			_setModelData( model, modelTable( [
				[ '01', '02', '03' ]
			] ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 1 ] )
			);

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if multiple cells in a footer row are selected', () => {
			_setModelData( model, modelTable( [
				[ '01', '02', '03' ]
			], { footerRows: 1 } ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 1 ] )
			);

			expect( command.isEnabled ).to.be.true;
		} );

		describe( 'with `TableLayout` plugin', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableEditing, TableSelection, TableLayoutEditing ],
					table: {
						useTfootElement: true
					}
				} );

				model = editor.model;
				command = new SetFooterRowCommand( editor );
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			it( 'should be true if selection is in table', () => {
				_setModelData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if selection is in table with `tableType="layout"`', () => {
				_setModelData( model,
					'<table tableType="layout">' +
						'<tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow>' +
					'</table>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );
	} );

	describe( 'value', () => {
		it( 'should be false if selection is not in a table without footer row', () => {
			_setModelData( model, modelTable( [
				[ '01[]', '02' ],
				[ '11', '12' ]
			] ) );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false if selection is not in a footer row', () => {
			_setModelData( model, modelTable( [
				[ '01[]', '02' ],
				[ '11', '12' ]
			], { footerRows: 1 } ) );

			expect( command.value ).to.be.false;
		} );

		it( 'should be true if selection is in a footer row', () => {
			_setModelData( model, modelTable( [
				[ '01', '02' ],
				[ '11', '12[]' ]
			], { footerRows: 1 } ) );

			expect( command.value ).to.be.true;
		} );

		it( 'should be true if multiple footer rows are selected', () => {
			_setModelData( model, modelTable( [
				[ '01', '02' ],
				[ '11', '12' ]
			], { footerRows: 2 } ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			expect( command.value ).to.be.true;
		} );

		it( 'should be false if only part of selected columns are footers', () => {
			_setModelData( model, modelTable( [
				[ '01', '02' ],
				[ '11', '12' ]
			], { footerRows: 1 } ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 0 ] )
			);

			expect( command.value ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should set footer rows attribute that cover row in which is selection', () => {
			_setModelData( model, modelTable( [
				[ '00' ],
				[ '10' ],
				[ '[]20' ],
				[ '30' ]
			] ) );

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '00' ],
				[ '10' ],
				[ '[]20' ],
				[ '30' ]
			], { footerRows: 2 } ) );
		} );

		it( 'should toggle footer rows attribute', () => {
			_setModelData( model, modelTable( [
				[ '00' ],
				[ '10' ],
				[ '[]20' ],
				[ '30' ]
			], { footerRows: 2 } ) );

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '00' ],
				[ '10' ],
				[ '[]20' ],
				[ '30' ]
			], { footerRows: 1 } ) );

			command.execute();

			_setModelData( model, modelTable( [
				[ '00' ],
				[ '10' ],
				[ '[]20' ],
				[ '30' ]
			], { footerRows: 2 } ) );
		} );

		it( 'should set footer rows attribute if currently selected row is a footer so the footer section is below this row', () => {
			_setModelData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { footerRows: 3 } ) );

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { footerRows: 2 } ) );
		} );

		it( 'should remove "footerRows" attribute from table if no value was given', () => {
			_setModelData( model, modelTable( [
				[ '00' ],
				[ '10' ],
				[ '20' ],
				[ '30[]' ]
			], { footerRows: 3 } ) );

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '00' ],
				[ '10' ],
				[ '20' ],
				[ '30[]' ]
			] ) );
		} );

		describe( 'multi-cell selection', () => {
			it( 'should set it correctly in a middle of multi-row table', () => {
				_setModelData( model, modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ],
					[ '30' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 0 ] )
				);

				command.execute();

				// Rows 1 and 2 selected. 10 (row 1) and 20 (row 2).
				// We want rows 1, 2, 3 to become footer. 3 is automatically footer if 1 is footer.
				// footerRows = 3.

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ],
					[ '30' ]
				], {
					footerRows: 3
				} ) );

				assertSelectedCells( model, [
					[ 0 ],
					[ 1 ],
					[ 1 ],
					[ 0 ]
				] );
			} );

			it( 'should set it correctly in a middle of multi-row table - reversed selection', () => {
				_setModelData( model, modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ],
					[ '30' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 2, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ],
					[ '30' ]
				], {
					footerRows: 3
				} ) );

				assertSelectedCells( model, [
					[ 0 ],
					[ 1 ],
					[ 1 ],
					[ 0 ]
				] );
			} );

			it( 'should remove footer rows in case of multiple cell selection', () => {
				_setModelData( model, modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ],
					[ '30' ]
				], { footerRows: 3 } ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 0 ] )
				);

				// Rows 1, 2 selected. current footer 3 (rows 1, 2, 3).
				// Value is true.
				// Execute should set it to end after selection.
				// Selected last row is 2.
				// Footer should start after row 2. So row 3 (last one).
				// footerRows = 1.

				command.execute();

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ],
					[ '30' ]
				], {
					footerRows: 1
				} ) );
			} );
		} );

		it( 'should respect forceValue parameter (forceValue=true)', () => {
			_setModelData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { footerRows: 3 } ) );

			command.execute( { forceValue: true } );

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { footerRows: 3 } ) );
		} );

		it( 'should respect forceValue parameter (forceValue=false)', () => {
			_setModelData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { footerRows: 1 } ) );

			// Row 1 selected. footerRows: 1 (row 3).
			// Value is false.
			// forceValue is false.
			// Should do nothing as it matches intent? Or just set value to false (unset all footers)?
			// Wait, forceValue means "Set footer state to false".
			// If I forceValue=false on a non-footer row, it should probably ensure this row is NOT a footer.
			// But the command sets the footer attribute for the table.
			// If forceValue=false, it means we want to UNSET footer for the selected row.
			// Since row 1 is NOT a footer, nothing should happen?
			// Let's check logic:
			// if ( options.forceValue === this.value ) return;
			// Here value is false. forceValue is false. Return. Correct.

			command.execute( { forceValue: false } );

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { footerRows: 1 } ) );
		} );

		it( 'should fix rowspaned cells on the edge of an table footer section', () => {
			// Row 1 selected.
			// Set footer rows to cover row 1 and 2. footerRows = 2.
			// But '10' covers row 1 and 2.
			// Wait, if I set footerRows=2, start is row 1.
			// Does '10' overlap the boundary?
			// Boundary is between row 0 and 1.
			// '10' starts at row 1. It is below the boundary. No split needed.

			// Let's create a case where it DOES overlap.
			// Table 3 rows.
			// Cell in row 0 spans 2 rows (0, 1).
			// Mark row 1 as footer. (Rows 1, 2).
			// Boundary is between 0 and 1.
			// Cell spans 0-1. Checks overlap at row 1. Yes.

			_setModelData( model, modelTable( [
				[ { rowspan: 2, contents: '00' }, '01' ],
				[ '[]11' ],
				[ '21', '22' ]
			] ) );

			// Select row 1.
			// Execute -> value is false.
			// footerRowsToSet = 2 (rows 1, 2).
			// Footer start row = 3 - 2 = 1.
			// Overlap check at row 1.
			// Cell '00' is at row 0, rowspan 2. End row 1.
			// Ranges: [0, 1].
			// Overlas row 1? Yes.
			// Should split.

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '00', '01' ],
				[ '', '[]11' ],
				[ '21', '22' ]
			], { footerRows: 2 } ) );
		} );

		it( 'should split to at most 2 table cells when fixing rowspaned cells on the edge of an table footer section', () => {
			_setModelData( model, modelTable( [
				[ { rowspan: 5, contents: '00' }, '01' ],
				[ '11' ],
				[ '21[]' ],
				[ '31' ],
				[ '41' ]
			] ) );

			// 5 rows.
			// Select row 2 ('21').
			// Footer rows = 3 (rows 2, 3, 4).
			// Split at row 2.
			// '00' spans 0-4.
			// Should split at 2.
			// Top cell: 0-1 (rowspan 2).
			// Bottom cell: 2-4 (rowspan 3).

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ { rowspan: 2, contents: '00' }, '01' ],
				[ '11' ],
				[ { rowspan: 3, contents: '' }, '21[]' ],
				[ '31' ],
				[ '41' ]
			], { footerRows: 3 } ) );
		} );
	} );
} );
