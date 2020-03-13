/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import RemoveRowCommand from '../../src/commands/removerowcommand';
import TableSelection from '../../src/tableselection';
import { defaultConversion, defaultSchema, modelTable } from '../_utils/utils';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'RemoveRowCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create( { plugins: [ TableSelection ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new RemoveRowCommand( editor );

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
				[ '00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 1 ] )
			);

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if selection is inside table with one row only', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ]
			] ) );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if all the rows are selected', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			] ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 0 ] )
			);

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection is outside a table', () => {
			setData( model, '<paragraph>11[]</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false when the first column with rowspan is selected', () => {
			// (#6427)
			setData( model, modelTable( [
				[ { rowspan: 2, contents: '00' }, '01' ],
				[ '11' ],
				[ '20', '21' ]
			] ) );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should remove a given row', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01' ],
				[ '[]20', '21' ]
			] ) );
		} );

		describe( 'with multiple rows selected', () => {
			it( 'should properly remove middle rows', () => {
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
					[ '00', '01' ],
					[ '[]30', '31' ]
				] ) );
			} );

			it( 'should properly remove middle rows in reversed order', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 2, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '00', '01' ],
					[ '[]30', '31' ]
				] ) );
			} );

			it( 'should properly remove tailing rows', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 2, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 3, 0 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '00', '01' ],
					[ '[]10', '11' ]
				] ) );
			} );

			it( 'should properly remove beginning rows', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '[]20', '21' ],
					[ '30', '31' ]
				] ) );
			} );

			it( 'should support removing multiple headings', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				], { headingRows: 3 } ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '[]20', '21' ],
					[ '30', '31' ]
				], { headingRows: 1 } ) );
			} );

			it( 'should support removing mixed heading and cell rows', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 1 } ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '[]20', '21' ]
				] ) );
			} );
		} );

		describe( 'with entire row selected', () => {
			it( 'should remove a row if all its cells are selected', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '00', '01' ],
					[ '[]20', '21' ]
				] ) );
			} );

			it( 'should properly remove row if reversed selection is made', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection._setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 0, 0 ] )
				);

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '[]10', '11' ]
				] ) );
			} );
		} );

		it( 'should remove a given row from a table start', () => {
			setData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should remove a given row from a table start when selection is at the end', () => {
			setData( model, modelTable( [
				[ '00', '01[]' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '10', '[]11' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should remove last row', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '[]00', '01' ]
			] ) );
		} );

		it( 'should change heading rows if removing a heading row', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingRows: 2 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01' ],
				[ '[]20', '21' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should decrease rowspan of table cells from previous rows', () => {
			setData( model, modelTable( [
				[ { rowspan: 4, contents: '00' }, { rowspan: 3, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
				[ { rowspan: 2, contents: '13' }, '14' ],
				[ '22[]', '23', '24' ],
				[ '30', '31', '32', '33', '34' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { rowspan: 3, contents: '00' }, { rowspan: 2, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
				[ '13', '14' ],
				[ '30', '31', '[]32', '33', '34' ]
			] ) );
		} );

		it( 'should move rowspaned cells to row below removing it\'s row', () => {
			setData( model, modelTable( [
				[ { rowspan: 3, contents: '[]00' }, { rowspan: 2, contents: '01' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { rowspan: 2, contents: '[]00' }, '01', '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			] ) );
		} );
	} );
} );
