/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import SelectRowCommand from '../../src/commands/selectrowcommand';
import TableSelection from '../../src/tableselection';
import { assertSelectedCells, defaultConversion, defaultSchema, modelTable } from '../_utils/utils';

describe( 'SelectRowCommand', () => {
	let editor, model, modelRoot, command, tableSelection;

	beforeEach( () => {
		return VirtualTestEditor.create( { plugins: [ TableSelection ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				modelRoot = model.document.getRoot();
				command = new SelectRowCommand( editor );
				tableSelection = editor.plugins.get( TableSelection );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true if the selection is inside table cell', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			] ) );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if the selection contains multiple cells', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 1 ] )
			);

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if the selection is outside a table', () => {
			setData( model, '<paragraph>11[]</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should select a row of a table cell with a collapsed selection', () => {
			setData( model, modelTable( [
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
			setData( model, modelTable( [
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
			setData( model, modelTable( [
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
			setData( model, modelTable( [
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
				setData( model, modelTable( [
					[ { rowspan: 4, contents: '00' }, { rowspan: 3, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
					[ { rowspan: 2, contents: '13' }, '14' ],
					[ '22', '23', '24' ],
					[ '30', '31', '32', '33', '34' ]
				] ) );
			} );

			it( 'should select only one row if only one cell is selected', () => {
				// Selection in cell 01.
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 0, 1 ] )
				);

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 1, 0, 0, 0 ],
					[          0, 0 ],
					[       0,    0 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */

				command.execute();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 1, 1, 1, 1, 1 ],
					[          0, 0 ],
					[       0,    0 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should not select row-spanned rows that start in other row', () => {
				// Selection in cell 24.
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 2, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 1 ] )
				);

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0 ],
					[          0, 0 ],
					[       0,    1 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */

				command.execute();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0 ],
					[          0, 0 ],
					[       1,    1 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should not select row-spanned rows that start in other row but include those that start in selected row', () => {
				// Selection in cell 14.
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0 ],
					[          0, 1 ],
					[       0,    0 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */

				command.execute();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0 ],
					[          1, 1 ],
					[       0,    0 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should select properly for multiple not spanned cells selected', () => {
				// Selection in cells 04 - 14.
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 4 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 1 ],
					[          0, 1 ],
					[       0,    0 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */

				command.execute();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 1, 1, 1, 1, 1 ],
					[          1, 1 ],
					[       0,    0 ],
					[    0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should select properly for multiple cells selected including spanned one', () => {
				// Selection in cells 13 - 33.
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 3, 2 ] )
				);

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0 ],
					[          1, 0 ],
					[       0,    0 ],
					[    0, 0, 1, 0 ]
				] );
				/* eslint-enable no-multi-spaces */

				command.execute();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0 ],
					[          1, 1 ],
					[       1,    1 ],
					[    1, 1, 1, 1 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );
		} );

		describe( 'with multiple rows selected', () => {
			it( 'should properly select middle rows', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				tableSelection._setCellSelection(
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
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				tableSelection._setCellSelection(
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
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				tableSelection._setCellSelection(
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
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				tableSelection._setCellSelection(
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
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ],
					[ '30', '31', '32' ]
				] ) );

				tableSelection._setCellSelection(
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
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingColumns: 1 } ) );

				tableSelection._setCellSelection(
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
		} );

		describe( 'with entire row selected', () => {
			it( 'should select a row if all its cells are selected', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				] ) );

				tableSelection._setCellSelection(
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
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				tableSelection._setCellSelection(
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
