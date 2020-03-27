/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import MergeCellsCommand from '../../src/commands/mergecellscommand';
import { modelTable } from '../_utils/utils';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import TableSelection from '../../src/tableselection';
import TableEditing from '../../src/tableediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'MergeCellsCommand', () => {
	let editor, model, command, root, tableSelection;

	beforeEach( async () => {
		editor = await ModelTestEditor.create( {
			plugins: [ Paragraph, TableEditing, TableSelection ]
		} );

		model = editor.model;
		root = model.document.getRoot( 'main' );
		tableSelection = editor.plugins.get( TableSelection );

		command = new MergeCellsCommand( editor );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be false if collapsed selection in table cell', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ]
			] ) );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if only one table cell is selected', () => {
			setData( model, modelTable( [
				[ '00', '01' ]
			] ) );

			selectNodes( [ [ 0, 0, 0 ] ] );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true if at least two adjacent table cells are selected', () => {
			setData( model, modelTable( [
				[ '00', '01' ]
			] ) );

			selectNodes( [ [ 0, 0, 0 ], [ 0, 0, 1 ] ] );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if many table cells are selected', () => {
			setData( model, modelTable( [
				[ '00', '01', '02', '03' ],
				[ '10', '11', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );

			selectNodes( [
				[ 0, 0, 1 ], [ 0, 0, 2 ],
				[ 0, 1, 1 ], [ 0, 1, 2 ],
				[ 0, 2, 1 ], [ 0, 2, 2 ],
				[ 0, 3, 1 ], [ 0, 3, 2 ]
			] );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if at least one table cell is not selected from an area', () => {
			setData( model, modelTable( [
				[ '00', '01', '02', '03' ],
				[ '10', '11', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );

			selectNodes( [
				[ 0, 0, 1 ], [ 0, 0, 2 ],
				[ 0, 1, 2 ], // one table cell not selected from this row
				[ 0, 2, 1 ], [ 0, 2, 2 ],
				[ 0, 3, 1 ], [ 0, 3, 2 ]
			] );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if table cells are not in adjacent rows', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			] ) );

			selectNodes( [
				[ 0, 1, 0 ],
				[ 0, 0, 1 ]
			] );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if table cells are not in adjacent columns', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ]
			] ) );

			selectNodes( [ [ 0, 0, 0 ], [ 0, 0, 2 ] ] );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if any table cell with colspan attribute extends over selection area', () => {
			setData( model, modelTable( [
				[ '00', { colspan: 2, contents: '01' } ],
				[ '10', '11', '12' ]
			] ) );

			selectNodes( [
				[ 0, 0, 0 ], [ 0, 0, 1 ],
				[ 0, 1, 0 ], [ 0, 1, 1 ]
			] );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true if none table cell with colspan attribute extends over selection area', () => {
			setData( model, modelTable( [
				[ '00', { colspan: 2, contents: '01' } ],
				[ '10', '11', '12' ]
			] ) );

			selectNodes( [
				[ 0, 0, 0 ], [ 0, 0, 1 ],
				[ 0, 1, 0 ], [ 0, 1, 1 ],
				[ 0, 1, 2 ]
			] );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if first table cell is inside selection area', () => {
			setData( model, modelTable( [
				[ { colspan: 2, rowspan: 2, contents: '00' }, '02', '03' ],
				[ '12', '13' ]
			] ) );

			selectNodes( [
				[ 0, 0, 0 ], [ 0, 0, 1 ],
				[ 0, 1, 0 ]
			] );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if any table cell with rowspan attribute extends over selection area', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, contents: '01' } ],
				[ '10' ]
			] ) );

			selectNodes( [ [ 0, 0, 0 ], [ 0, 0, 1 ] ] );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true if none table cell with rowspan attribute extends over selection area', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, contents: '01' } ],
				[ '10' ]
			] ) );

			selectNodes( [
				[ 0, 0, 0 ], [ 0, 0, 1 ],
				[ 0, 1, 0 ]
			] );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if not in a cell', () => {
			setData( model, '<paragraph>11[]</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection has cells from header and body sections', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			], { headingRows: 1 } ) );

			tableSelection._setCellSelection(
				root.getNodeByPath( [ 0, 0, 0 ] ),
				root.getNodeByPath( [ 0, 1, 0 ] )
			);

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should merge simple table cell selection', () => {
			setData( model, modelTable( [
				[ '[]00', '01' ]
			] ) );

			tableSelection._setCellSelection(
				root.getNodeByPath( [ 0, 0, 0 ] ),
				root.getNodeByPath( [ 0, 0, 1 ] )
			);

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '<paragraph>[00</paragraph><paragraph>01]</paragraph>' } ]
			] ) );
		} );

		it( 'should merge selection with a cell with rowspan in the selection', () => {
			setData( model, modelTable( [
				[ '[]00', '01', '02' ],
				[ '10', { contents: '11', rowspan: 2 }, '12' ],
				[ '20', '22' ]
			] ) );

			tableSelection._setCellSelection(
				root.getNodeByPath( [ 0, 1, 0 ] ),
				root.getNodeByPath( [ 0, 2, 1 ] )
			);

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01', '02' ],
				[ {
					colspan: 3,
					contents: '<paragraph>[10</paragraph><paragraph>11</paragraph><paragraph>12</paragraph>' +
						'<paragraph>20</paragraph><paragraph>22]</paragraph>'
				} ]
			] ) );
		} );

		it( 'should merge selection with a cell with rowspan in the selection (reverse selection)', () => {
			setData( model, modelTable( [
				[ '[]00', '01', '02' ],
				[ '10', { contents: '11', rowspan: 2 }, '12' ],
				[ '20', '22' ]
			] ) );

			tableSelection._setCellSelection(
				root.getNodeByPath( [ 0, 2, 1 ] ),
				root.getNodeByPath( [ 0, 1, 0 ] )
			);

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01', '02' ],
				[ {
					colspan: 3,
					contents: '<paragraph>[10</paragraph><paragraph>11</paragraph><paragraph>12</paragraph>' +
						'<paragraph>20</paragraph><paragraph>22]</paragraph>'
				} ]
			] ) );
		} );

		it( 'should merge selection inside a table (properly calculate target rowspan/colspan)', () => {
			setData( model, modelTable( [
				[ '[]00', '01', '02', '03' ],
				[ '10', '11', { contents: '12', rowspan: 2 }, '13' ],
				[ '20', '21', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );

			tableSelection._setCellSelection(
				root.getNodeByPath( [ 0, 2, 1 ] ),
				root.getNodeByPath( [ 0, 1, 2 ] )
			);

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01', '02', '03' ],
				[ '10', {
					colspan: 2,
					rowspan: 2,
					contents: '<paragraph>[11</paragraph><paragraph>12</paragraph><paragraph>21]</paragraph>'
				}, '13' ],
				[ '20', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		it( 'should merge table cells - extend colspan attribute', () => {
			setData( model, modelTable( [
				[ { colspan: 2, contents: '00' }, '02', '03' ],
				[ '10', '11', '12', '13' ]
			] ) );

			selectNodes( [
				[ 0, 0, 0 ], [ 0, 0, 1 ],
				[ 0, 1, 0 ], [ 0, 1, 1 ], [ 0, 1, 2 ]
			] );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ {
					colspan: 3,
					rowspan: 2,
					contents: '<paragraph>[00</paragraph>' +
						'<paragraph>02</paragraph>' +
						'<paragraph>10</paragraph>' +
						'<paragraph>11</paragraph>' +
						'<paragraph>12]</paragraph>'
				}, '03' ],
				[ '13' ]
			] ) );
		} );

		it( 'should merge to a single paragraph - every cell is empty', () => {
			setData( model, modelTable( [
				[ '[]', '' ]
			] ) );

			selectNodes( [ [ 0, 0, 0 ], [ 0, 0, 1 ] ] );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '<paragraph>[]</paragraph>' } ]
			] ) );
		} );

		it( 'should merge to a single paragraph - merged cell is empty', () => {
			setData( model, modelTable( [
				[ 'foo', '' ]
			] ) );

			selectNodes( [ [ 0, 0, 0 ], [ 0, 0, 1 ] ] );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '<paragraph>[foo]</paragraph>' } ]
			] ) );
		} );

		it( 'should merge to a single paragraph - cell to which others are merged is empty', () => {
			setData( model, modelTable( [
				[ '', 'foo' ]
			] ) );

			selectNodes( [ [ 0, 0, 0 ], [ 0, 0, 1 ] ] );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '<paragraph>[foo]</paragraph>' } ]
			] ) );
		} );

		it( 'should not merge empty blocks other then <paragraph> to a single block', () => {
			model.schema.register( 'block', {
				allowWhere: '$block',
				allowContentOf: '$block',
				isBlock: true
			} );

			setData( model, modelTable( [
				[ '<block>[]</block>', '<block></block>' ]
			] ) );

			selectNodes( [ [ 0, 0, 0 ], [ 0, 0, 1 ] ] );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '<block>[</block><block>]</block>' } ]
			] ) );
		} );

		describe( 'removing empty row', () => {
			it( 'should remove empty row if merging all table cells from that row', () => {
				setData( model, modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ]
				] ) );

				selectNodes( [
					[ 0, 0, 0 ],
					[ 0, 1, 0 ],
					[ 0, 2, 0 ]
				] );

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[
						'<paragraph>[00</paragraph><paragraph>10</paragraph><paragraph>20]</paragraph>'
					]
				] ) );
			} );

			it( 'should decrease rowspan if cell overlaps removed row', () => {
				setData( model, modelTable( [
					[ '00', { rowspan: 2, contents: '01' }, { rowspan: 3, contents: '02' } ],
					[ '10' ],
					[ '20', '21' ]
				] ) );

				selectNodes( [
					[ 0, 0, 0 ],
					[ 0, 1, 0 ],
					[ 0, 2, 0 ]
				] );

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[
						{ rowspan: 2, contents: '<paragraph>[00</paragraph><paragraph>10</paragraph><paragraph>20]</paragraph>' },
						'01',
						{ rowspan: 2, contents: '02' }
					],
					[ '21' ]
				] ) );
			} );

			it( 'should not decrease rowspan if cell from previous row does not overlaps removed row', () => {
				setData( model, modelTable( [
					[ '00', { rowspan: 2, contents: '01' } ],
					[ '10' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				selectNodes( [
					[ 0, 2, 0 ], [ 0, 2, 1 ],
					[ 0, 3, 0 ], [ 0, 3, 1 ]
				] );

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[ '00', { rowspan: 2, contents: '01' } ],
					[ '10' ],
					[
						{
							colspan: 2,
							contents: '<paragraph>[20</paragraph><paragraph>21</paragraph>' +
								'<paragraph>30</paragraph><paragraph>31]</paragraph>'
						}
					]
				] ) );
			} );
		} );
	} );

	function selectNodes( paths ) {
		model.change( writer => {
			const ranges = paths.map( path => writer.createRangeOn( root.getNodeByPath( path ) ) );

			writer.setSelection( ranges );
		} );
	}
} );
