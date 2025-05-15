/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import TableEditing from '../../src/tableediting.js';
import TableSelection from '../../src/tableselection.js';
import { TableLayoutEditing } from '../../src/index.js';
import { assertSelectedCells, modelTable } from '../_utils/utils.js';

import SetHeaderRowCommand from '../../src/commands/setheaderrowcommand.js';

describe( 'SetHeaderRowCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ Paragraph, TableEditing, TableSelection ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new SetHeaderRowCommand( editor );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be false if selection is not in a table', () => {
			setData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true if selection is in table', () => {
			setData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if multiple cells are selected', () => {
			setData( model, modelTable( [
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

		it( 'should be true if multiple cells in a header row are selected', () => {
			setData( model, modelTable( [
				[ '01', '02', '03' ]
			], { headingRows: 1 } ) );

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

			beforeEach( () => {
				return ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing, TableSelection, TableLayoutEditing ]
					} )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						command = new SetHeaderRowCommand( editor );
					} );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			it( 'should be true if selection is in table', () => {
				setData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if selection is in table with `tableType="layout"`', () => {
				setData( model,
					'<table tableType="layout">' +
						'<tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow>' +
					'</table>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );
	} );

	describe( 'value', () => {
		it( 'should be false if selection is not in a table without heading row', () => {
			setData( model, modelTable( [
				[ '01[]', '02' ],
				[ '11', '12' ]
			] ) );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false if selection is not in a heading row', () => {
			setData( model, modelTable( [
				[ '01', '02' ],
				[ '11', '12[]' ]
			], { headingRows: 1 } ) );

			expect( command.value ).to.be.false;
		} );

		it( 'should be true if selection is in a heading row', () => {
			setData( model, modelTable( [
				[ '01[]', '02' ],
				[ '11', '12' ]
			], { headingRows: 1 } ) );

			expect( command.value ).to.be.true;
		} );

		it( 'should be false if selection is in a heading column', () => {
			setData( model, modelTable( [
				[ '01', '02' ],
				[ '11[]', '12' ]
			], { headingRows: 1, headingColumns: 1 } ) );

			expect( command.value ).to.be.false;
		} );

		it( 'should be true if multiple header rows are selected', () => {
			setData( model, modelTable( [
				[ '01', '02' ],
				[ '11', '12' ]
			], { headingRows: 2 } ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			expect( command.value ).to.be.true;
		} );

		it( 'should be true if multiple header columns are selected in reversed order', () => {
			setData( model, modelTable( [
				[ '01', '02' ],
				[ '11', '12' ]
			], { headingRows: 2 } ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 1 ] )
			);

			expect( command.value ).to.be.true;
		} );

		it( 'should be false if only part of selected columns are headers', () => {
			setData( model, modelTable( [
				[ '01', '02' ],
				[ '11', '12' ]
			], { headingRows: 1 } ) );

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
		it( 'should set heading rows attribute that cover row in which is selection', () => {
			setData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			] ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should toggle heading rows attribute', () => {
			setData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 2 } ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 1 } ) );

			command.execute();

			setData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should set heading rows attribute if currently selected row is a heading so the heading section is below this row', () => {
			setData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 3 } ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should remove "headingRows" attribute from table if no value was given', () => {
			setData( model, modelTable( [
				[ '[]00' ],
				[ '10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 3 } ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '[]00' ],
				[ '10' ],
				[ '20' ],
				[ '30' ]
			] ) );
		} );

		describe( 'multi-cell selection', () => {
			it( 'should set it correctly in a middle of multi-row table', () => {
				setData( model, modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ],
					[ '30' ]
				], {
					headingRows: 3
				} ) );

				assertSelectedCells( model, [
					[ 0 ],
					[ 1 ],
					[ 1 ],
					[ 0 ]
				] );
			} );

			it( 'should set it correctly in a middle of multi-row table - reversed selection', () => {
				setData( model, modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ],
					[ '30' ]
				], {
					headingRows: 3
				} ) );

				assertSelectedCells( model, [
					[ 0 ],
					[ 1 ],
					[ 1 ],
					[ 0 ]
				] );
			} );

			it( 'should set it correctly in a middle of multi-row, multiple cell selection', () => {
				setData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ '10', '11', '12', '13' ],
					[ '20', '21', '22', '23' ],
					[ '30', '31', '32', '33' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 2 ] )
				);

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00', '01', '02', '03' ],
					[ '10', '11', '12', '13' ],
					[ '20', '21', '22', '23' ],
					[ '30', '31', '32', '33' ]
				], {
					headingRows: 3
				} ) );

				assertSelectedCells( model, [
					[ 0, 0, 0, 0 ],
					[ 0, 1, 1, 0 ],
					[ 0, 1, 1, 0 ],
					[ 0, 0, 0, 0 ]
				] );
			} );

			it( 'should set it correctly in table with more than 10 columns (array sort bug)', () => {
				setData( model, modelTable( [
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
					modelRoot.getNodeByPath( [ 0, 2, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 13, 0 ] )
				);

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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
				], { headingRows: 14 } ) );
			} );

			it( 'should set it correctly in table with more than 10 columns (array sort bug, reversed selection)', () => {
				setData( model, modelTable( [
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
					modelRoot.getNodeByPath( [ 0, 13, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 1 ] )
				);

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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
				], { headingRows: 14 } ) );
			} );

			it( 'should remove header rows in case of multiple cell selection', () => {
				setData( model, modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ],
					[ '30' ]
				], { headingRows: 4 } ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 0 ] )
				);

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ],
					[ '30' ]
				], {
					headingRows: 1
				} ) );

				assertSelectedCells( model, [
					[ 0 ],
					[ 1 ],
					[ 1 ],
					[ 0 ]
				] );
			} );

			it( 'should respect forceValue=true in case of multiple row selection', () => {
				setData( model, modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ],
					[ '30' ]
				], {
					headingRows: 3
				} ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 0 ] )
				);

				command.execute( { forceValue: true } );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
					modelTable( [ [ '00' ], [ '10' ], [ '20' ], [ '30' ] ], { headingRows: 3 } )
				);

				assertSelectedCells( model, [
					[ 0 ],
					[ 1 ],
					[ 1 ],
					[ 0 ]
				] );
			} );

			it( 'should respect forceValue=false in case of multiple cell selection', () => {
				setData( model, modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ],
					[ '30' ]
				], {
					headingRows: 1
				} ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 0 ] )
				);

				command.execute( { forceValue: false } );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
					modelTable( [ [ '00' ], [ '10' ], [ '20' ], [ '30' ] ], { headingRows: 1 } )
				);

				assertSelectedCells( model, [
					[ 0 ],
					[ 1 ],
					[ 1 ],
					[ 0 ]
				] );
			} );
		} );

		it( 'should respect forceValue parameter (forceValue=true)', () => {
			setData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 3 } ) );

			command.execute( { forceValue: true } );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 3 } ) );
		} );

		it( 'should respect forceValue parameter (forceValue=false)', () => {
			setData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 1 } ) );

			command.execute( { forceValue: false } );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should fix rowspaned cells on the edge of an table head section', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10[]' }, '12' ],
				[ '22' ]
			], { headingColumns: 2, headingRows: 1 } ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, contents: '10[]' }, '12' ],
				[ { colspan: 2, contents: '' }, '22' ]
			], { headingColumns: 2, headingRows: 2 } ) );
		} );

		it( 'should split to at most 2 table cells when fixing rowspaned cells on the edge of an table head section', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, rowspan: 5, contents: '10' }, '12' ],
				[ '22[]' ],
				[ '32' ],
				[ '42' ],
				[ '52' ]
			], { headingColumns: 2, headingRows: 1 } ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10' }, '12' ],
				[ '22[]' ],
				[ { colspan: 2, rowspan: 3, contents: '' }, '32' ],
				[ '42' ],
				[ '52' ]
			], { headingColumns: 2, headingRows: 3 } ) );
		} );

		it( 'should fix rowspaned cells on the edge of an table head section when creating section', () => {
			setData( model, modelTable( [
				[ { rowspan: 2, contents: '00' }, '01' ],
				[ '[]11' ]
			], { headingRows: 2 } ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00', '01' ],
				[ '', '[]11' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should fix rowspaned cells inside a row', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, contents: '01' } ],
				[ '[]10' ]
			], { headingRows: 2 } ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00', '01' ],
				[ '[]10', '' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should work properly in the first row of a table', () => {
			setData( model, modelTable( [
				[ '00', '[]01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10' }, '12' ],
				[ '22' ]
			] ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00', '[]01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10' }, '12' ],
				[ '22' ]
			], { headingRows: 1 } ) );
		} );
	} );
} );
