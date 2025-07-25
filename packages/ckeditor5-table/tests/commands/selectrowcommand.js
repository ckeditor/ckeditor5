/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { _setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { TableEditing } from '../../src/tableediting.js';
import { TableSelection } from '../../src/tableselection.js';
import { assertSelectedCells, modelTable } from '../_utils/utils.js';

import { SelectRowCommand } from '../../src/commands/selectrowcommand.js';

describe( 'SelectRowCommand', () => {
	let editor, model, modelRoot, command, tableSelection;

	beforeEach( () => {
		return VirtualTestEditor.create( { plugins: [ Paragraph, TableEditing, TableSelection ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				modelRoot = model.document.getRoot();
				command = new SelectRowCommand( editor );
				tableSelection = editor.plugins.get( TableSelection );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'sets public properties', () => {
			expect( command ).to.have.property( 'affectsData', false );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be true if the selection is inside table cell', () => {
			_setModelData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			] ) );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if the selection contains multiple cells', () => {
			_setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 1 ] )
			);

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if the selection is inside the table and the editor is read-only', () => {
			_setModelData( model, modelTable( [
				[ '00[]' ]
			] ) );

			editor.enableReadOnlyMode( 'unit-test' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if the selection is outside a table', () => {
			_setModelData( model, '<paragraph>11[]</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should select a row of a table cell with a collapsed selection', () => {
			_setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			assertSelectedCells( model, [
				[ 0, 0 ],
				[ 1, 1 ],
				[ 0, 0 ]
			] );
		} );

		it( 'should select a row of table cell with a collapsed selection in first table cell', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			assertSelectedCells( model, [
				[ 1, 1 ],
				[ 0, 0 ],
				[ 0, 0 ]
			] );
		} );

		it( 'should select a row of table cell with a collapsed selection in last cell in the first column', () => {
			_setModelData( model, modelTable( [
				[ '00', '01[]' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			assertSelectedCells( model, [
				[ 1, 1 ],
				[ 0, 0 ],
				[ 0, 0 ]
			] );
		} );

		it( 'should select a row of table cell with collapsed selection in the first cell of the last column', () => {
			_setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ]
			] ) );

			command.execute();

			assertSelectedCells( model, [
				[ 0, 0 ],
				[ 1, 1 ]
			] );
		} );

		describe( 'with row-spanned cells', () => {
			beforeEach( () => {
				// +----+----+----+----+----+
				// | 00 | 01 | 02 | 03 | 04 |
				// +    +    +    +----+----+
				// |    |    |    | 13 | 14 |
				// +    +    +----+    +----+
				// |    |    | 22 |    | 24 |
				// +    +----+----+----+----+
				// |    | 31 | 32 | 33 | 34 |
				// +----+----+----+----+----+
				_setModelData( model, modelTable( [
					[ { rowspan: 4, contents: '00' }, { rowspan: 3, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
					[ { rowspan: 2, contents: '13' }, '14' ],
					[ '22', '23', '24' ],
					[ '30', '31', '32', '33', '34' ]
				] ) );
			} );

			it( 'should select only one row if only one cell is selected', () => {
				// Selection in cell 01.
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 0, 1 ] )
				);

				/* eslint-disable @stylistic/no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 1, 0, 0, 0 ],
					[          0, 0 ],
					[       0,    0 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable @stylistic/no-multi-spaces */

				command.execute();

				/* eslint-disable @stylistic/no-multi-spaces */
				assertSelectedCells( model, [
					[ 1, 1, 1, 1, 1 ],
					[          0, 0 ],
					[       0,    0 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable @stylistic/no-multi-spaces */
			} );

			it( 'should not select row-spanned rows that start in other row', () => {
				// Selection in cell 24.
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 2, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 1 ] )
				);

				/* eslint-disable @stylistic/no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0 ],
					[          0, 0 ],
					[       0,    1 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable @stylistic/no-multi-spaces */

				command.execute();

				/* eslint-disable @stylistic/no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0 ],
					[          0, 0 ],
					[       1,    1 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable @stylistic/no-multi-spaces */
			} );

			it( 'should not select row-spanned rows that start in other row but include those that start in selected row', () => {
				// Selection in cell 14.
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				/* eslint-disable @stylistic/no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0 ],
					[          0, 1 ],
					[       0,    0 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable @stylistic/no-multi-spaces */

				command.execute();

				/* eslint-disable @stylistic/no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0 ],
					[          1, 1 ],
					[       0,    0 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable @stylistic/no-multi-spaces */
			} );

			it( 'should select properly for multiple not spanned cells selected', () => {
				// Selection in cells 04 - 14.
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 4 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				/* eslint-disable @stylistic/no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 1 ],
					[          0, 1 ],
					[       0,    0 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable @stylistic/no-multi-spaces */

				command.execute();

				/* eslint-disable @stylistic/no-multi-spaces */
				assertSelectedCells( model, [
					[ 1, 1, 1, 1, 1 ],
					[          1, 1 ],
					[       0,    0 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable @stylistic/no-multi-spaces */
			} );

			it( 'should select properly for multiple cells selected including spanned one', () => {
				// Selection in cells 13 - 33.
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 3, 2 ] )
				);

				/* eslint-disable @stylistic/no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0 ],
					[          1, 0 ],
					[       0,    0 ],
					[    0, 0, 1, 0 ]
				] );
				/* eslint-enable @stylistic/no-multi-spaces */

				command.execute();

				/* eslint-disable @stylistic/no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0 ],
					[          1, 1 ],
					[       1,    1 ],
					[    1, 1, 1, 1 ]
				] );
				/* eslint-enable @stylistic/no-multi-spaces */
			} );
		} );

		describe( 'with multiple rows selected', () => {
			it( 'should properly select middle rows', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 0 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 0, 0 ],
					[ 1, 1 ],
					[ 1, 1 ],
					[ 0, 0 ]
				] );
			} );

			it( 'should properly select middle rows in reversed order', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 2, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 0, 0 ],
					[ 1, 1 ],
					[ 1, 1 ],
					[ 0, 0 ]
				] );
			} );

			it( 'should properly select tailing rows', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 2, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 3, 0 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 0, 0 ],
					[ 0, 0 ],
					[ 1, 1 ],
					[ 1, 1 ]
				] );
			} );

			it( 'should properly select beginning rows', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 1, 1 ],
					[ 1, 1 ],
					[ 0, 0 ],
					[ 0, 0 ]
				] );
			} );

			it( 'should properly select multiple rows from square selection', () => {
				_setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ],
					[ '30', '31', '32' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 1 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 0, 0, 0 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 0, 0, 0 ]
				] );
			} );

			it( 'should support selecting mixed heading and cell rows', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingColumns: 1 } ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 1, 1 ],
					[ 1, 1 ],
					[ 0, 0 ]
				] );
			} );

			it( 'should properly select more than 10 rows selected (array sort bug)', () => {
				_setModelData( model, modelTable( [
					[ '0', 'x' ],
					[ '1', 'x' ],
					[ '2', 'x' ],
					[ '3', 'x' ],
					[ '4', 'x' ],
					[ '5', 'x' ],
					[ '6', 'x' ],
					[ '7', 'x' ],
					[ '8', 'x' ],
					[ '9', 'x' ],
					[ '10', 'x' ],
					[ '11', 'x' ],
					[ '12', 'x' ],
					[ '13', 'x' ],
					[ '14', 'x' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 12, 0 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 0, 0 ], // '0'
					[ 1, 1 ], // '1'
					[ 1, 1 ], // '2'
					[ 1, 1 ], // '3'
					[ 1, 1 ], // '4'
					[ 1, 1 ], // '5'
					[ 1, 1 ], // '6'
					[ 1, 1 ], // '7'
					[ 1, 1 ], // '8'
					[ 1, 1 ], // '9'
					[ 1, 1 ], // '10'
					[ 1, 1 ], // '11'
					[ 1, 1 ], // '12'
					[ 0, 0 ], // '13'
					[ 0, 0 ] //  '14
				] );
			} );
		} );

		describe( 'with entire row selected', () => {
			it( 'should select a row if all its cells are selected', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 0, 0 ],
					[ 1, 1 ],
					[ 0, 0 ]
				] );
			} );

			it( 'should properly select row if reversed selection is made', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 0, 0 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 1, 1 ],
					[ 0, 0 ]
				] );
			} );
		} );
	} );
} );
