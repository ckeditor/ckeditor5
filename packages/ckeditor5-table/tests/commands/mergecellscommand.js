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

			tableSelection.setCellSelection(
				root.getNodeByPath( [ 0, 0, 0 ] ),
				root.getNodeByPath( [ 0, 1, 0 ] )
			);

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if more than 10 rows selected and some are in heading section', () => {
			setData( model, modelTable( [
				[ '0' ],
				[ '1' ],
				[ '2' ],
				[ '3' ],
				[ '4' ],
				[ '5' ],
				[ '6' ],
				[ '7' ],
				[ '8' ],
				[ '9' ],
				[ '10' ],
				[ '11' ],
				[ '12' ],
				[ '13' ],
				[ '14' ]
			], { headingRows: 10 } ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 12, 0 ] )
			);

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true if selection has cells only from column headers - rows in body section', () => {
			setData( model, modelTable( [
				[ '00[]', '01', '02', '03' ],
				[ '10', '11', '12', '13' ]
			], { headingColumns: 2 } ) );

			tableSelection.setCellSelection(
				root.getNodeByPath( [ 0, 0, 0 ] ),
				root.getNodeByPath( [ 0, 1, 1 ] )
			);

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if selection has cells from column headers and other cells - rows in body section', () => {
			setData( model, modelTable( [
				[ '00[]', '01', '02', '03' ],
				[ '10', '11', '12', '13' ]
			], { headingColumns: 2 } ) );

			tableSelection.setCellSelection(
				root.getNodeByPath( [ 0, 0, 0 ] ),
				root.getNodeByPath( [ 0, 1, 2 ] )
			);

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true if selection has cells only from column headers - rows in header section', () => {
			setData( model, modelTable( [
				[ '00[]', '01', '02', '03' ],
				[ '10', '11', '12', '13' ]
			], { headingColumns: 2, headingRows: 1 } ) );

			tableSelection.setCellSelection(
				root.getNodeByPath( [ 0, 0, 0 ] ),
				root.getNodeByPath( [ 0, 0, 1 ] )
			);

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if selection has cells only from column headers and other cells - rows in header section', () => {
			setData( model, modelTable( [
				[ '00[]', '01', '02', '03' ],
				[ '10', '11', '12', '13' ]
			], { headingColumns: 2, headingRows: 1 } ) );

			tableSelection.setCellSelection(
				root.getNodeByPath( [ 0, 0, 0 ] ),
				root.getNodeByPath( [ 0, 0, 2 ] )
			);

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection has cells from column headers, row headers and body sections', () => {
			setData( model, modelTable( [
				[ '00[]', '01', '02', '03' ],
				[ '10', '11', '12', '13' ]
			], { headingColumns: 2, headingRows: 1 } ) );

			tableSelection.setCellSelection(
				root.getNodeByPath( [ 0, 0, 0 ] ),
				root.getNodeByPath( [ 0, 1, 2 ] )
			);

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should merge simple table cell selection', () => {
			setData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			tableSelection.setCellSelection(
				root.getNodeByPath( [ 0, 0, 0 ] ),
				root.getNodeByPath( [ 0, 0, 1 ] )
			);

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '<paragraph>[00</paragraph><paragraph>01]</paragraph>' } ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should merge simple table cell selection and remove empty columns', () => {
			setData( model, modelTable( [
				[ '[]00', '01' ]
			] ) );

			tableSelection.setCellSelection(
				root.getNodeByPath( [ 0, 0, 0 ] ),
				root.getNodeByPath( [ 0, 0, 1 ] )
			);

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '<paragraph>[00</paragraph><paragraph>01]</paragraph>' ]
			] ) );
		} );

		it( 'should merge selection with a cell with rowspan in the selection', () => {
			setData( model, modelTable( [
				[ '[]00', '01', '02' ],
				[ '10', { contents: '11', rowspan: 2 }, '12' ],
				[ '20', '22' ]
			] ) );

			tableSelection.setCellSelection(
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

			tableSelection.setCellSelection(
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

			tableSelection.setCellSelection(
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
			// +----+----+----+----+
			// | 00      | 02 | 03 |
			// +----+----+----+----+
			// | 10 | 11 | 12 | 13 |
			// +----+----+----+----+
			// | 20 | 21 | 22 | 23 |
			// +----+----+----+----+
			setData( model, modelTable( [
				[ { colspan: 2, contents: '00' }, '02', '03' ],
				[ '10', '11', '12', '13' ],
				[ '20', '21', '22', '23' ]
			] ) );

			selectNodes( [
				[ 0, 0, 0 ], [ 0, 0, 1 ],
				[ 0, 1, 0 ], [ 0, 1, 1 ], [ 0, 1, 2 ]
			] );

			command.execute();

			// +----+----+----+----+
			// |              | 03 |
			// +   (merged)   +----+
			// |              | 13 |
			// +----+----+----+----+
			// | 20 | 21 | 22 | 23 |
			// +----+----+----+----+
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
				[ '13' ],
				[ '20', '21', '22', '23' ]
			] ) );
		} );

		it( 'should merge to a single paragraph - every cell is empty', () => {
			setData( model, modelTable( [
				[ '[]', '' ],
				[ '10', '11' ]
			] ) );

			selectNodes( [ [ 0, 0, 0 ], [ 0, 0, 1 ] ] );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '<paragraph>[]</paragraph>' } ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should merge to a single paragraph - merged cell is empty', () => {
			setData( model, modelTable( [
				[ 'foo', '' ],
				[ '10', '11' ]
			] ) );

			selectNodes( [ [ 0, 0, 0 ], [ 0, 0, 1 ] ] );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '<paragraph>[foo]</paragraph>' } ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should merge to a single paragraph - cell to which others are merged is empty', () => {
			setData( model, modelTable( [
				[ '', 'foo' ],
				[ '10', '11' ]
			] ) );

			selectNodes( [ [ 0, 0, 0 ], [ 0, 0, 1 ] ] );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '<paragraph>[foo]</paragraph>' } ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should not merge empty blocks other then <paragraph> to a single block', () => {
			model.schema.register( 'block', {
				allowWhere: '$block',
				allowContentOf: '$block',
				isBlock: true
			} );

			setData( model, modelTable( [
				[ '<block>[]</block>', '<block></block>' ],
				[ '10', '11' ]
			] ) );

			selectNodes( [ [ 0, 0, 0 ], [ 0, 0, 1 ] ] );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '<block>[</block><block>]</block>' } ],
				[ '10', '11' ]
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

			it( 'should decrease heading rows if some heading rows were removed', () => {
				setData( model, modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ]
				], { headingRows: 2 } ) );

				selectNodes( [
					[ 0, 0, 0 ],
					[ 0, 1, 0 ]
				] );

				command.execute();

				assertEqualMarkup( getData( model ), modelTable( [
					[
						'<paragraph>[00</paragraph><paragraph>10]</paragraph>'
					],
					[ '20' ]
				], { headingRows: 1 } ) );
			} );

			it( 'should decrease heading rows if multiple heading rows were removed', () => {
				// +----+----+
				// | 00 | 01 |
				// +    +----+
				// |    | 11 |
				// +----+----+
				// | 20 | 21 |
				// +----+----+
				// | 30 | 31 |
				// +    +----+
				// |    | 41 |
				// +----+----+ <-- heading rows
				// | 50 | 51 |
				// +----+----+
				setData( model, modelTable( [
					[ { contents: '00', rowspan: 2 }, '01' ],
					[ '11' ],
					[ '20', '21' ],
					[ { contents: '30', rowspan: 2 }, '31' ],
					[ '41' ],
					[ '50', '51' ]
				], { headingRows: 5 } ) );

				selectNodes( [
					[ 0, 0, 1 ],
					[ 0, 1, 0 ],
					[ 0, 2, 1 ],
					[ 0, 3, 1 ],
					[ 0, 4, 0 ]
				] );

				command.execute();

				const contents = [ '[01', '11', '21', '31', '41]' ].map( content => `<paragraph>${ content }</paragraph>` ).join( '' );

				// +----+----+
				// | 00 | 01 |
				// +----+    +
				// | 20 |    |
				// +----+    +
				// | 30 |    |
				// +----+----+ <-- heading rows
				// | 50 | 51 |
				// +----+----+
				assertEqualMarkup( getData( model ), modelTable( [
					[ '00', { contents, rowspan: 3 } ],
					[ '20' ],
					[ '30' ],
					[ '50', '51' ]
				], { headingRows: 3 } ) );
			} );

			it( 'should create one undo step (1 batch)', () => {
				setData( model, modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ]
				], { headingRows: 2 } ) );

				selectNodes( [
					[ 0, 0, 0 ],
					[ 0, 1, 0 ]
				] );

				const createdBatches = new Set();

				model.on( 'applyOperation', ( evt, [ operation ] ) => {
					createdBatches.add( operation.batch );
				} );

				command.execute();

				expect( createdBatches.size ).to.equal( 1 );
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
