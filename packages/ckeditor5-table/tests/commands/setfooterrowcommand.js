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
				enableFooters: true
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
						enableFooters: true
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

			command.execute( { forceValue: false } );

			expect( _getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { footerRows: 1 } ) );
		} );

		it( 'should fix rowspaned cells on the edge of an table footer section', () => {
			_setModelData( model, modelTable( [
				[ { rowspan: 2, contents: '00' }, '01' ],
				[ '[]11' ],
				[ '21', '22' ]
			] ) );

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
