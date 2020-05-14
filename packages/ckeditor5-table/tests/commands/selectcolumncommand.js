/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import SelectColumnCommand from '../../src/commands/selectcolumncommand';
import TableSelection from '../../src/tableselection';
import { assertSelectedCells, defaultConversion, defaultSchema, modelTable } from '../_utils/utils';

describe( 'SelectColumnCommand', () => {
	let editor, model, modelRoot, command, tableSelection;

	beforeEach( () => {
		return VirtualTestEditor.create( { plugins: [ TableSelection ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				modelRoot = model.document.getRoot();
				command = new SelectColumnCommand( editor );
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

			tableSelection.setCellSelection(
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
		it( 'should select a column of a table cell with a collapsed selection', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '[]11', '12' ],
				[ '20', '21', '22' ]
			] ) );

			command.execute();

			assertSelectedCells( model, [
				[ 0, 1, 0 ],
				[ 0, 1, 0 ],
				[ 0, 1, 0 ]
			] );
		} );

		it( 'should select a column of table cell with a collapsed selection in first table cell', () => {
			setData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			assertSelectedCells( model, [
				[ 1, 0 ],
				[ 1, 0 ],
				[ 1, 0 ]
			] );
		} );

		it( 'should select a column of table cell with a collapsed selection in last cell in the first column', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '11' ],
				[ '20[]', '21' ]
			] ) );

			command.execute();

			assertSelectedCells( model, [
				[ 1, 0 ],
				[ 1, 0 ],
				[ 1, 0 ]
			] );
		} );

		it( 'should select a column of table cell with collapsed selection in the first cell of the last column', () => {
			setData( model, modelTable( [
				[ '00', '01[]' ],
				[ '10', '11' ]
			] ) );

			command.execute();

			assertSelectedCells( model, [
				[ 0, 1 ],
				[ 0, 1 ]
			] );
		} );

		describe( 'with col-spanned cells', () => {
			beforeEach( () => {
				// +----+----+----+----+
				// | 00                |
				// +----+----+----+----+
				// | 10           | 13 |
				// +----+----+----+----+
				// | 20      | 22 | 23 |
				// +----+----+----+----+
				// | 30 | 31      | 33 |
				// +----+----+----+----+
				// | 40 | 41 | 42 | 43 |
				// +----+----+----+----+
				setData( model, modelTable( [
					[ { colspan: 4, contents: '00' } ],
					[ { colspan: 3, contents: '10' }, '13' ],
					[ { colspan: 2, contents: '20' }, '22', '23' ],
					[ '30', { colspan: 2, contents: '31' }, '33' ],
					[ '40', '41', '42', '43' ]
				] ) );
			} );

			it( 'should select only one column if only one cell is selected', () => {
				// Selection in cell 10.
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0          ],
					[ 1,       0 ],
					[ 0,    0, 0 ],
					[ 0, 0,    0 ],
					[ 0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */

				command.execute();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 1          ],
					[ 1,       0 ],
					[ 1,    0, 0 ],
					[ 1, 0,    0 ],
					[ 1, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should not select col-spanned columns that start in other column', () => {
				// Selection in cell 42.
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 4, 2 ] ),
					modelRoot.getNodeByPath( [ 0, 4, 2 ] )
				);

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0          ],
					[ 0,       0 ],
					[ 0,    0, 0 ],
					[ 0, 0,    0 ],
					[ 0, 0, 1, 0 ]
				] );
				/* eslint-enable no-multi-spaces */

				command.execute();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0          ],
					[ 0,       0 ],
					[ 0,    1, 0 ],
					[ 0, 0,    0 ],
					[ 0, 0, 1, 0 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should not select col-spanned columns that start in other column but include those that start in selected column', () => {
				// Selection in cell 41.
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 4, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 4, 1 ] )
				);

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0          ],
					[ 0,       0 ],
					[ 0,    0, 0 ],
					[ 0, 0,    0 ],
					[ 0, 1, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */

				command.execute();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0          ],
					[ 0,       0 ],
					[ 0,    0, 0 ],
					[ 0, 1,    0 ],
					[ 0, 1, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should select properly for multiple not spanned cells selected', () => {
				// Selection in cells 40 - 41.
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 4, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 4, 1 ] )
				);

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0          ],
					[ 0,       0 ],
					[ 0,    0, 0 ],
					[ 0, 0,    0 ],
					[ 1, 1, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */

				command.execute();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 1          ],
					[ 1,       0 ],
					[ 1,    0, 0 ],
					[ 1, 1,    0 ],
					[ 1, 1, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should select properly for multiple cells selected including spanned one', () => {
				// Selection in cells 31 - 33.
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 3, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 3, 2 ] )
				);

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0          ],
					[ 0,       0 ],
					[ 0,    0, 0 ],
					[ 0, 1,    1 ],
					[ 0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */

				command.execute();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0          ],
					[ 0,       1 ],
					[ 0,    1, 1 ],
					[ 0, 1,    1 ],
					[ 0, 1, 1, 1 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );
		} );

		describe( 'with multiple columns selected', () => {
			beforeEach( () => {
				setData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ '10', '11', '12', '13' ],
					[ '20', '21', '22', '23' ]
				] ) );
			} );

			it( 'should properly select middle columns', () => {
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 0, 2 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 0, 1, 1, 0 ],
					[ 0, 1, 1, 0 ],
					[ 0, 1, 1, 0 ]
				] );
			} );

			it( 'should properly select middle columns in reversed order', () => {
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 2 ] ),
					modelRoot.getNodeByPath( [ 0, 0, 1 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 0, 1, 1, 0 ],
					[ 0, 1, 1, 0 ],
					[ 0, 1, 1, 0 ]
				] );
			} );

			it( 'should properly select tailing columns', () => {
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 2 ] ),
					modelRoot.getNodeByPath( [ 0, 0, 3 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 0, 0, 1, 1 ],
					[ 0, 0, 1, 1 ],
					[ 0, 0, 1, 1 ]
				] );
			} );

			it( 'should properly select beginning columns', () => {
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 0, 1 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 1, 1, 0, 0 ],
					[ 1, 1, 0, 0 ],
					[ 1, 1, 0, 0 ]
				] );
			} );

			it( 'should properly select multiple columns from square selection', () => {
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 2 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 0, 1, 1, 0 ],
					[ 0, 1, 1, 0 ],
					[ 0, 1, 1, 0 ]
				] );
			} );

			it( 'should support selecting mixed heading and cell columns', () => {
				setData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ '10', '11', '12', '13' ],
					[ '20', '21', '22', '23' ]
				], { headingRows: 1 } ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 0, 1 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 1, 1, 0, 0 ],
					[ 1, 1, 0, 0 ],
					[ 1, 1, 0, 0 ]
				] );
			} );
		} );

		describe( 'with entire column selected', () => {
			it( 'should select a column if all its cells are selected', () => {
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 1 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ]
				] );
			} );

			it( 'should properly select column if reversed selection is made', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 0, 0 ] )
				);

				command.execute();

				assertSelectedCells( model, [
					[ 1, 0 ],
					[ 1, 0 ]
				] );
			} );
		} );
	} );
} );
