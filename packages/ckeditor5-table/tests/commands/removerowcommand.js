/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { _setModelData, _getModelData, _getViewData } from '@ckeditor/ckeditor5-engine';

import { RemoveRowCommand } from '../../src/commands/removerowcommand.js';
import { TableSelection } from '../../src/tableselection.js';
import { modelTable, viewTable } from '../_utils/utils.js';
import { TableEditing } from '../../src/tableediting.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

describe( 'RemoveRowCommand', () => {
	let editor, model, command;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [ Paragraph, TableEditing, TableSelection ] } );

		model = editor.model;
		command = new RemoveRowCommand( editor );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true if selection is inside table cell', () => {
			_setModelData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			] ) );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if selection contains multiple cells', () => {
			_setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 1 ] )
			);

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if selection is inside table with one row only', () => {
			_setModelData( model, modelTable( [
				[ '00[]', '01' ]
			] ) );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if all the rows are selected', () => {
			_setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			] ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 0 ] )
			);

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection is outside a table', () => {
			_setModelData( model, '<paragraph>11[]</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false when the first column with rowspan is selected', () => {
			// (#6427)
			_setModelData( model, modelTable( [
				[ { rowspan: 2, contents: '00' }, '01' ],
				[ '11' ],
				[ '20', '21' ]
			] ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 2, 0 ] )
			);

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if all the rows are selected - table with more than 10 rows (array sort bug)', () => {
			_setModelData( model, modelTable( [
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
				[ '12' ]
			] ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 12, 0 ] )
			);

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should remove a given row', () => {
			_setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '00', '01' ],
				[ '[]20', '21' ]
			] ) );
		} );

		describe( 'with multiple rows selected', () => {
			it( 'should properly remove middle rows', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 0 ] )
				);

				command.execute();

				expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '00', '01' ],
					[ '[]30', '31' ]
				] ) );
			} );

			it( 'should properly remove middle rows in reversed order', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 2, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '00', '01' ],
					[ '[]30', '31' ]
				] ) );
			} );

			it( 'should properly remove tailing rows', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 2, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 3, 0 ] )
				);

				command.execute();

				expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '00', '01' ],
					[ '[]10', '11' ]
				] ) );
			} );

			it( 'should properly remove beginning rows', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '[]20', '21' ],
					[ '30', '31' ]
				] ) );
			} );

			it( 'should support removing multiple headings (removed rows in heading section)', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				], { headingRows: 3 } ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '[]20', '21' ],
					[ '30', '31' ]
				], { headingRows: 1 } ) );
			} );

			it( 'should support removing multiple headings (removed rows in heading and body section)', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ],
					[ '40', '41' ]
				], { headingRows: 3 } ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 3, 0 ] )
				);

				command.execute();

				expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '00', '01' ],
					[ '[]40', '41' ]
				], { headingRows: 1 } ) );

				// The editing view should also be properly downcasted.
				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '40', '41' ]
				], { headingRows: 1, asWidget: true } ) );
			} );

			it( 'should support removing mixed heading and cell rows', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 1 } ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '[]20', '21' ]
				] ) );
			} );

			it( 'should properly calculate truncated rowspans', () => {
				_setModelData( model, modelTable( [
					[ '00', { contents: '01', rowspan: 3 } ],
					[ '10' ],
					[ '20' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '[]20', '01' ]
				] ) );
			} );

			it( 'should create one undo step (1 batch)', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				], { headingRows: 3 } ) );

				const createdBatches = new Set();

				model.on( 'applyOperation', ( evt, args ) => {
					const operation = args[ 0 ];

					createdBatches.add( operation.batch );
				} );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 0 ] )
				);

				command.execute();

				expect( createdBatches.size ).to.equal( 1 );
			} );

			it( 'should properly remove more than 10 rows selected (array sort bug)', () => {
				_setModelData( model, modelTable( [
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
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 12, 0 ] )
				);

				command.execute();

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '0' ],
					[ '13' ],
					[ '14' ]
				] ) );
			} );
		} );

		describe( 'with entire row selected', () => {
			it( 'should remove a row if all its cells are selected', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				command.execute();

				expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '00', '01' ],
					[ '[]20', '21' ]
				] ) );
			} );

			it( 'should properly remove row if reversed selection is made', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 0, 0 ] )
				);

				command.execute();

				expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '[]10', '11' ]
				] ) );
			} );
		} );

		it( 'should remove a given row from a table start', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should remove a given row from a table start when selection is at the end', () => {
			_setModelData( model, modelTable( [
				[ '00', '01[]' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '10', '[]11' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should remove last row', () => {
			_setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ]
			] ) );

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '[]00', '01' ]
			] ) );
		} );

		it( 'should remove last row - ignore non-row elements', () => {
			model.schema.register( 'foo', {
				allowIn: 'table',
				allowContentOf: '$block',
				isLimit: true
			} );

			editor.conversion.elementToElement( {
				view: 'foo',
				model: 'foo'
			} );

			_setModelData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>[]10</paragraph></tableCell>' +
						'<tableCell><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
					'<foo>An extra element</foo>' +
				'</table>'
			);

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>[]00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<foo>An extra element</foo>' +
				'</table>'
			);
		} );

		it( 'should change heading rows if removing a heading row', () => {
			_setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingRows: 2 } ) );

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '00', '01' ],
				[ '[]20', '21' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should decrease rowspan of table cells from previous rows', () => {
			_setModelData( model, modelTable( [
				[ { rowspan: 4, contents: '00' }, { rowspan: 3, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
				[ { rowspan: 2, contents: '13' }, '14' ],
				[ '22[]', '24' ],
				[ '31', '32', '33', '34' ]
			] ) );

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ { rowspan: 3, contents: '00' }, { rowspan: 2, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
				[ '13', '14' ],
				[ '31', '32', '[]33', '34' ]
			] ) );
		} );

		it( 'should move rowspaned cells to row below removing it\'s row', () => {
			_setModelData( model, modelTable( [
				[ { rowspan: 3, contents: '[]00' }, { rowspan: 2, contents: '01' }, '02' ],
				[ '12' ],
				[ '21', '22' ],
				[ '30', '31', '32' ]
			] ) );

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ { rowspan: 2, contents: '[]00' }, '01', '12' ],
				[ '21', '22' ],
				[ '30', '31', '32' ]
			] ) );
		} );

		it( 'should remove empty columns after removing row', () => {
			_setModelData( model, modelTable( [
				[ '00', { contents: '01', colspan: 2 } ],
				[ '[]10', '11', '12' ]
			] ) );

			command.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '[]00', '01' ]
			] ) );
		} );
	} );
} );
