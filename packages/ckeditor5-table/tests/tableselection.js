/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import {
	getData as getModelData,
	setData as setModelData,
	stringify as stringifyModel
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../src/tableediting';
import TableSelection from '../src/tableselection';
import { assertSelectedCells, modelTable } from './_utils/utils';
import DocumentFragment from '@ckeditor/ckeditor5-engine/src/model/documentfragment';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';

describe( 'TableSelection', () => {
	let editorElement, editor, model, tableSelection, modelRoot;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	describe( 'init()', () => {
		beforeEach( async () => {
			editor = await createEditor();
			model = editor.model;
			modelRoot = model.document.getRoot();
			tableSelection = editor.plugins.get( TableSelection );

			setModelData( model, modelTable( [
				[ '11[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should have pluginName', () => {
			expect( TableSelection.pluginName ).to.equal( 'TableSelection' );
		} );

		describe( 'plugin disabling support', () => {
			it( 'should collapse multi-cell selection when the plugin gets disabled', () => {
				const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
				const lastCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

				tableSelection.setCellSelection(
					firstCell,
					lastCell
				);

				tableSelection.forceDisabled( 'foo' );

				const ranges = [ ...model.document.selection.getRanges() ];

				expect( ranges ).to.have.length( 1 );
				expect( ranges[ 0 ].isCollapsed ).to.be.true;
				expect( ranges[ 0 ].start.path ).to.deep.equal( [ 0, 0, 0, 0, 0 ] );
			} );

			it( 'should reenable table selection when reenabling the plugin', () => {
				tableSelection.forceDisabled( 'foo' );
				tableSelection.clearForceDisabled( 'foo' );

				const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
				const lastCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

				tableSelection.setCellSelection(
					firstCell,
					lastCell
				);

				assertSelectedCells( model, [
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 0, 0, 0 ]
				] );
			} );

			it( 'should do nothing if there were no multi-cell selections', () => {
				tableSelection.forceDisabled( 'foo' );

				const ranges = [ ...model.document.selection.getRanges() ];

				expect( ranges ).to.have.length( 1 );
				expect( ranges[ 0 ].isCollapsed ).to.be.true;
				expect( ranges[ 0 ].start.path ).to.deep.equal( [ 0, 0, 0, 0, 2 ] );
			} );
		} );
	} );

	describe( 'getSelectedTableCells()', () => {
		beforeEach( async () => {
			editor = await createEditor();
			model = editor.model;
			modelRoot = model.document.getRoot();
			tableSelection = editor.plugins.get( TableSelection );

			setModelData( model, modelTable( [
				[ '11[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should return nothing if selection is not started', () => {
			expect( tableSelection.getSelectedTableCells() ).to.be.null;
		} );

		it( 'should return two table cells', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );

			tableSelection.setCellSelection(
				firstCell,
				lastCell
			);

			expect( tableSelection.getSelectedTableCells() ).to.deep.equal( [
				firstCell, lastCell
			] );
		} );

		it( 'should return four table cells for diagonal selection', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

			tableSelection.setCellSelection(
				firstCell,
				lastCell
			);

			expect( tableSelection.getSelectedTableCells() ).to.deep.equal( [
				firstCell, modelRoot.getNodeByPath( [ 0, 0, 1 ] ), modelRoot.getNodeByPath( [ 0, 1, 0 ] ), lastCell
			] );
		} );

		it( 'should return row table cells', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 0, 2 ] );

			tableSelection.setCellSelection(
				firstCell,
				lastCell
			);

			expect( tableSelection.getSelectedTableCells() ).to.deep.equal( [
				firstCell, modelRoot.getNodeByPath( [ 0, 0, 1 ] ), lastCell
			] );
		} );

		it( 'should return column table cells', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 2, 1 ] );

			tableSelection.setCellSelection( firstCell, lastCell );

			expect( tableSelection.getSelectedTableCells() ).to.deep.equal( [
				firstCell, modelRoot.getNodeByPath( [ 0, 1, 1 ] ), lastCell
			] );
		} );

		it( 'should return cells in source order despite backward selection', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 2 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );

			tableSelection.setCellSelection( firstCell, lastCell );

			expect( tableSelection.getSelectedTableCells() ).to.deep.equal( [
				lastCell, firstCell
			] );
		} );
	} );

	describe( 'getSelectionAsFragment()', () => {
		beforeEach( async () => {
			editor = await createEditor();
			model = editor.model;
			modelRoot = model.document.getRoot();
			tableSelection = editor.plugins.get( TableSelection );

			setModelData( model, modelTable( [
				[ '11[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should return undefined if no table cells are selected', () => {
			expect( tableSelection.getSelectionAsFragment() ).to.be.null;
		} );

		it( 'should return document fragment for selected table cells', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			expect( tableSelection.getSelectionAsFragment() ).to.be.instanceOf( DocumentFragment );
		} );

		it( 'should return cells in the source order in case of forward selection', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			expect( stringifyModel( tableSelection.getSelectionAsFragment() ) ).to.equal( modelTable( [
				[ '11', '12' ],
				[ '21', '22' ]
			] ) );
		} );

		it( 'should return cells in the source order in case of backward selection', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 0 ] )
			);

			expect( editor.model.document.selection.isBackward ).to.be.true;

			expect( stringifyModel( tableSelection.getSelectionAsFragment() ) ).to.equal( modelTable( [
				[ '11', '12' ],
				[ '21', '22' ]
			] ) );
		} );

		it( 'should adjust the selection dimensions if it\'s rectangular but last row has only row-spanned cells', () => {
			// +----+----+----+
			// | 00 | 01 | 02 |
			// +----+----+----+
			// | 10 | 11 | 12 |
			// +    +    +----+
			// |    |    | 22 |
			// +----+----+----+
			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ { contents: '10', rowspan: 2 }, { contents: '11', rowspan: 2 }, '12' ],
				[ '22' ]
			] ) );

			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			// +----+----+
			// | 00 | 01 |
			// +----+----+
			// | 10 | 11 |
			// +    +    +
			// |    |    |
			// +----+----+
			expect( stringifyModel( tableSelection.getSelectionAsFragment() ) ).to.equal( modelTable( [
				[ '00', '01' ],
				[ { contents: '10', rowspan: 2 }, { contents: '11', rowspan: 2 } ],
				[] // This is an empty row that should be here to properly handle pasting of this table fragment.
			] ) );
		} );

		it( 'should adjust the selection dimensions if it\'s rectangular but last column has only col-spanned cells', () => {
			// +----+----+----+
			// | 00 | 01      |
			// +----+----+----+
			// | 10 | 11      |
			// +----+----+----+
			// | 20 | 21 | 22 |
			// +----+----+----+
			setModelData( model, modelTable( [
				[ '00', { contents: '01', colspan: 2 } ],
				[ '10', { contents: '11', colspan: 2 } ],
				[ '20', '21', '22' ]
			] ) );

			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			// +----+----+----+
			// | 00 | 01      |
			// +----+----+----+
			// | 10 | 11      |
			// +----+----+----+
			expect( stringifyModel( tableSelection.getSelectionAsFragment() ) ).to.equal( modelTable( [
				[ '00', { contents: '01', colspan: 2 } ],
				[ '10', { contents: '11', colspan: 2 } ]
			] ) );
		} );

		it( 'should crop table fragment to rectangular selection', () => {
			// +----+----+----+
			// | 00 | 01      |
			// +----+----+----+
			// | 10 | 11 | 12 |
			// +    +----+----+
			// |    | 21 | 22 |
			// +----+----+----+
			setModelData( model, modelTable( [
				[ '00', { contents: '01', colspan: 2 } ],
				[ { contents: '10', rowspan: 2 }, '11', '12' ],
				[ '21', '22' ]
			] ) );

			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			// +----+----+
			// | 00 | 01 |
			// +----+----+
			// | 10 | 11 |
			// +----+----+
			expect( stringifyModel( tableSelection.getSelectionAsFragment() ) ).to.equal( modelTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			] ) );
		} );
	} );

	describe( 'delete content', () => {
		beforeEach( async () => {
			editor = await createEditor();
			model = editor.model;
			modelRoot = model.document.getRoot();
			tableSelection = editor.plugins.get( TableSelection );

			setModelData( model, modelTable( [
				[ '11[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should put selection in the last selected cell after removing content (backward delete)', () => {
			tableSelection.setCellSelection(
				modelRoot.getChild( 0 ).getChild( 0 ).getChild( 0 ),
				modelRoot.getChild( 0 ).getChild( 1 ).getChild( 1 )
			);

			editor.execute( 'delete' );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '', '', '13' ],
				[ '', '[]', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should put selection in the last selected cell after removing content (delete forward)', () => {
			tableSelection.setCellSelection(
				modelRoot.getChild( 0 ).getChild( 0 ).getChild( 0 ),
				modelRoot.getChild( 0 ).getChild( 1 ).getChild( 1 )
			);

			editor.execute( 'delete' );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '', '', '13' ],
				[ '', '[]', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should clear single cell if selected', () => {
			tableSelection.setCellSelection(
				modelRoot.getChild( 0 ).getChild( 0 ).getChild( 0 ),
				modelRoot.getChild( 0 ).getChild( 0 ).getChild( 0 )
			);

			editor.execute( 'deleteForward' );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should work with document selection passed to Model#deleteContent()', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			model.change( () => {
				model.deleteContent( model.document.selection );
			} );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '', '', '13' ],
				[ '', '[]', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should work with any arbitrary selection passed to Model#deleteContent() (delete backwards)', () => {
			const selection = model.createSelection( [
				model.createRange(
					model.createPositionFromPath( modelRoot, [ 0, 0, 0 ] ),
					model.createPositionFromPath( modelRoot, [ 0, 0, 1 ] )
				),
				model.createRange(
					model.createPositionFromPath( modelRoot, [ 0, 0, 1 ] ),
					model.createPositionFromPath( modelRoot, [ 0, 0, 2 ] )
				)
			] );

			model.change( writer => {
				model.deleteContent( selection );
				writer.setSelection( selection );
			} );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '', '[]', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should work with any arbitrary selection passed to Model#deleteContent() (delete forwards)', () => {
			const selection = model.createSelection( [
				model.createRange(
					model.createPositionFromPath( modelRoot, [ 0, 0, 0 ] ),
					model.createPositionFromPath( modelRoot, [ 0, 0, 1 ] )
				),
				model.createRange(
					model.createPositionFromPath( modelRoot, [ 0, 0, 1 ] ),
					model.createPositionFromPath( modelRoot, [ 0, 0, 2 ] )
				)
			] );

			model.change( writer => {
				model.deleteContent( selection, {
					direction: 'forward'
				} );
				writer.setSelection( selection );
			} );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '[]', '', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );
	} );

	describe( 'getAnchorCell() and getFocusCell()', () => {
		beforeEach( async () => {
			editor = await createEditor();
			model = editor.model;
			modelRoot = model.document.getRoot();
			tableSelection = editor.plugins.get( TableSelection );

			setModelData( model, modelTable( [
				[ '[]00', '01', '02' ],
				[ '10', '11', '12' ],
				[ '20', '21', '22' ]
			] ) );
		} );

		it( 'should return null if no table cell is selected', () => {
			expect( tableSelection.getAnchorCell() ).to.be.null;
			expect( tableSelection.getFocusCell() ).to.be.null;
		} );

		it( 'getAnchorCell() should return the table cell from the first range in the selection', () => {
			const anchorCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
			const focusCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

			tableSelection.setCellSelection( anchorCell, focusCell );

			expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
		} );

		it( 'getFocusCell() should return the table cell from the last range in the selection', () => {
			const anchorCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
			const focusCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

			tableSelection.setCellSelection( anchorCell, focusCell );

			expect( tableSelection.getFocusCell() ).to.equal( focusCell );
		} );
	} );

	describe( 'the selection ranges order', () => {
		let selection, table;

		beforeEach( async () => {
			editor = await createEditor();
			model = editor.model;
			selection = model.document.selection;
			modelRoot = model.document.getRoot();
			tableSelection = editor.plugins.get( TableSelection );

			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ],
				[ '20', '21', '22' ]
			] ) );

			table = modelRoot.getChild( 0 );
		} );

		it( 'should be to below right', () => {
			const anchorCell = table.getChild( 1 ).getChild( 1 );
			const focusCell = table.getChild( 2 ).getChild( 2 );

			tableSelection.setCellSelection( anchorCell, focusCell );

			assertSelection( anchorCell, focusCell, 4 );
			expect( tableSelection.getFocusCell() ).to.equal( focusCell );
			expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
			expect( selection.isBackward ).to.be.false;
		} );

		it( 'should be to below left', () => {
			const anchorCell = table.getChild( 1 ).getChild( 1 );
			const focusCell = table.getChild( 2 ).getChild( 0 );

			tableSelection.setCellSelection( anchorCell, focusCell );

			assertSelection( anchorCell, focusCell, 4 );
			expect( tableSelection.getFocusCell() ).to.equal( focusCell );
			expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'should be to above left', () => {
			const anchorCell = table.getChild( 1 ).getChild( 1 );
			const focusCell = table.getChild( 0 ).getChild( 0 );

			tableSelection.setCellSelection( anchorCell, focusCell );

			assertSelection( anchorCell, focusCell, 4 );
			expect( tableSelection.getFocusCell() ).to.equal( focusCell );
			expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
			expect( selection.isBackward ).to.be.true;
		} );

		it( 'should be to above right', () => {
			const anchorCell = table.getChild( 1 ).getChild( 1 );
			const focusCell = table.getChild( 0 ).getChild( 2 );

			tableSelection.setCellSelection( anchorCell, focusCell );

			assertSelection( anchorCell, focusCell, 4 );
			expect( tableSelection.getFocusCell() ).to.equal( focusCell );
			expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
			expect( selection.isBackward ).to.be.true;
		} );

		function assertSelection( anchorCell, focusCell, count ) {
			const cells = [ ...selection.getRanges() ].map( range => range.getContainedElement() );

			expect( selection.rangeCount ).to.equal( count );
			expect( cells[ 0 ] ).to.equal( anchorCell );
			expect( cells[ cells.length - 1 ] ).to.equal( focusCell );
		}
	} );

	function createEditor() {
		return ClassicTestEditor.create( editorElement, {
			plugins: [ TableEditing, TableSelection, Paragraph, Typing ]
		} );
	}
} );
