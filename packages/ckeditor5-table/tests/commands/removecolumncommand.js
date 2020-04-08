/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import RemoveColumnCommand from '../../src/commands/removecolumncommand';
import TableSelection from '../../src/tableselection';
import { defaultConversion, defaultSchema, modelTable } from '../_utils/utils';
import TableUtils from '../../src/tableutils';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'RemoveColumnCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ TableUtils, TableSelection ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new RemoveColumnCommand( editor );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true if selection is inside table cell', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			] ) );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if selection contains multiple cells', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			] ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 1 ] )
			);

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if selection is inside table with one column only', () => {
			setData( model, modelTable( [
				[ '00' ],
				[ '10[]' ],
				[ '20[]' ]
			] ) );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if all columns are selected', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			] ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 2 ] )
			);

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection is outside a table', () => {
			setData( model, '<paragraph>11[]</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should remove a given column', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '[]11', '12' ],
				[ '20', '21', '22' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '02' ],
				[ '10', '[]12' ],
				[ '20', '22' ]
			] ) );
		} );

		it( 'should remove a given column from a table start', () => {
			setData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '[]01' ],
				[ '11' ],
				[ '21' ]
			] ) );
		} );

		describe( 'with multiple cells selected', () => {
			it( 'should properly remove the first column', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 0 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '01' ],
					[ '11' ],
					[ '[]21' ],
					[ '31' ]
				] ) );
			} );

			it( 'should properly remove a middle column', () => {
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ],
					[ '30', '31', '32' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 1 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '00', '02' ],
					[ '10', '12' ],
					[ '20', '[]22' ],
					[ '30', '32' ]
				] ) );
			} );

			it( 'should properly remove the last column', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 1 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '00' ],
					[ '[]10' ],
					[ '20' ],
					[ '30' ]
				] ) );
			} );

			it( 'should properly remove two first columns', () => {
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ],
					[ '30', '31', '32' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '02' ],
					[ '[]12' ],
					[ '22' ],
					[ '32' ]
				] ) );
			} );

			it( 'should properly remove two middle columns', () => {
				setData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ '10', '11', '12', '13' ],
					[ '20', '21', '22', '23' ],
					[ '30', '31', '32', '33' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 2 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '00', '03' ],
					[ '10', '13' ],
					[ '20', '[]23' ],
					[ '30', '33' ]
				] ) );
			} );

			it( 'should properly remove two middle columns with reversed selection', () => {
				setData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ '10', '11', '12', '13' ],
					[ '20', '21', '22', '23' ],
					[ '30', '31', '32', '33' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 2, 2 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '00', '03' ],
					[ '10', '13' ],
					[ '20', '[]23' ],
					[ '30', '33' ]
				] ) );
			} );

			it( 'should properly remove two last columns', () => {
				// There's no handling for selection in case like that.
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ],
					[ '30', '31', '32' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 2 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '00' ],
					[ '[]10' ],
					[ '20' ],
					[ '30' ]
				] ) );
			} );

			it( 'should properly remove multiple heading columns', () => {
				// There's no handling for selection in case like that.
				setData( model, modelTable( [
					[ '00', '01', '02', '03', '04' ],
					[ '10', '11', '12', '13', '14' ]
				], { headingColumns: 3 } ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 3 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '00', '04' ],
					[ '10', '[]14' ]
				], { headingColumns: 1 } ) );
			} );

			it( 'should properly calculate truncated colspans', () => {
				setData( model, modelTable( [
					[ { contents: '00', colspan: 3 } ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '00' ],
					[ '[]12' ],
					[ '22' ]
				] ) );
			} );
		} );

		it( 'should change heading columns if removing a heading column', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingColumns: 2 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '01' ],
				[ '[]11' ],
				[ '21' ]
			], { headingColumns: 1 } ) );
		} );

		it( 'should decrease colspan of table cells from previous column', () => {
			setData( model, modelTable( [
				[ { colspan: 4, contents: '00' }, '04' ],
				[ { colspan: 3, contents: '10' }, '14' ],
				[ { colspan: 2, contents: '20' }, '22[]', '23', '24' ],
				[ '30', { colspan: 2, contents: '31' }, '33', '34' ],
				[ '40', '41', '42', '43', '44' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 3, contents: '00' }, '04' ],
				[ { colspan: 2, contents: '10' }, '14' ],
				[ { colspan: 2, contents: '20' }, '[]23', '24' ],
				[ '30', '31', '33', '34' ],
				[ '40', '41', '43', '44' ]

			] ) );
		} );

		it( 'should decrease colspan of cells that are on removed column', () => {
			setData( model, modelTable( [
				[ { colspan: 3, contents: '[]00' }, '03' ],
				[ { colspan: 2, contents: '10' }, '12', '13' ],
				[ '20', '21', '22', '23' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '[]00' }, '03' ],
				[ '10', '12', '13' ],
				[ '21', '22', '23' ]
			] ) );
		} );

		it( 'should move focus to previous column of removed cell if in last column', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12[]' ],
				[ '20', '21', '22' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01' ],
				[ '10', '[]11' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should work property if the rowspan is in the first column (the other cell in row is selected)', () => {
			setData( model, modelTable( [
				[ { rowspan: 2, contents: '00' }, '[]01' ],
				[ '11' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '[]00' ]
			] ) );
		} );

		it( 'should work property if the rowspan is in the first column (the cell in row below is selected)', () => {
			setData( model, modelTable( [
				[ { rowspan: 2, contents: '00' }, '01' ],
				[ '[]11' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '[]00' ]
			] ) );
		} );

		it( 'should work property if the rowspan is in the first column (the cell with rowspan is selected)', () => {
			setData( model, modelTable( [
				[ { rowspan: 2, contents: '00[]' }, '01' ],
				[ '11' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '[]01' ],
				[ '11' ]
			] ) );
		} );

		it( 'should work property if the rowspan is in the last column (the other cell in row is selected)', () => {
			setData( model, modelTable( [
				[ '[]00', { rowspan: 2, contents: '01' } ],
				[ '10' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '[]01' ]
			] ) );
		} );

		it( 'should work property if the rowspan is in the last column (the cell in row below is selected)', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, contents: '01' } ],
				[ '[]10' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '[]01' ]
			] ) );
		} );

		it( 'should work property if the rowspan is in the last column (the cell with rowspan is selected)', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, contents: '[]01' } ],
				[ '10' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '[]00' ],
				[ '10' ]
			] ) );
		} );

		it( 'should remove column if removing row with one column - other columns are spanned', () => {
			setData( model, modelTable( [
				[ '[]00', { rowspan: 2, contents: '01' }, { rowspan: 2, contents: '02' } ],
				[ '10' ],
				[ '20', '21', '22' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '[]01', '02' ],
				[ '21', '22' ]
			] ) );
		} );
	} );
} );
