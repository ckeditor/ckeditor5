/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../src/tableediting';
import TableSelection from '../src/tableselection';
import { modelTable } from './_utils/utils';

describe( 'table selection', () => {
	let editor, model, tableSelection, modelRoot;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableEditing, TableSelection, Paragraph ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
		tableSelection = editor.plugins.get( TableSelection );

		setModelData( model, modelTable( [
			[ '11[]', '12', '13' ],
			[ '21', '22', '23' ],
			[ '31', '32', '33' ]
		] ) );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'TableSelection', () => {
		describe( 'startSelectingFrom()', () => {
			it( 'should not change model selection', () => {
				const spy = sinon.spy();

				model.document.selection.on( 'change', spy );

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );

				sinon.assert.notCalled( spy );
			} );
		} );

		describe( 'setSelectingTo()', () => {
			it( 'should set model selection on passed cell if startSelectingFrom() was not used', () => {
				const spy = sinon.spy();

				model.document.selection.on( 'change', spy );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				sinon.assert.calledOnce( spy );

				assertSelectedCells( [
					[ 1, 1, 0 ],
					[ 0, 0, 0 ],
					[ 0, 0, 0 ]
				] );
			} );

			it( 'should change model selection if valid selection will be set', () => {
				const spy = sinon.spy();

				model.document.selection.on( 'change', spy );

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should not change model selection if passed table cell is from other table then start cell', () => {
				setModelData( model,
					modelTable( [
						[ '11[]', '12', '13' ],
						[ '21', '22', '23' ],
						[ '31', '32', '33' ]
					] ) +
					modelTable( [
						[ 'a', 'b' ],
						[ 'c', 'd' ]
					] )
				);

				const spy = sinon.spy();

				model.document.selection.on( 'change', spy );

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 1, 0, 1 ] ) );

				sinon.assert.notCalled( spy );
			} );

			it( 'should select two table cells', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				assertSelectedCells( [
					[ 1, 1, 0 ],
					[ 0, 0, 0 ],
					[ 0, 0, 0 ]
				] );
			} );

			it( 'should select four table cells for diagonal selection', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );

				assertSelectedCells( [
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 0, 0, 0 ]
				] );
			} );

			it( 'should select row table cells', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 2 ] ) );

				assertSelectedCells( [
					[ 1, 1, 1 ],
					[ 0, 0, 0 ],
					[ 0, 0, 0 ]
				] );
			} );

			it( 'should select column table cells', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 2, 1 ] ) );

				assertSelectedCells( [
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ]
				] );
			} );

			it( 'should create proper selection on consecutive changes', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 2, 1 ] ) );

				assertSelectedCells( [
					[ 0, 0, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ]
				] );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				assertSelectedCells( [
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 0, 0 ]
				] );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 2, 2 ] ) );

				assertSelectedCells( [
					[ 0, 0, 0 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ]
				] );
			} );
		} );

		describe( 'stopSelection()', () => {
			it( 'should not clear currently selected cells if not cell was passed', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				tableSelection.stopSelection();

				assertSelectedCells( [
					[ 1, 1, 0 ],
					[ 0, 0, 0 ],
					[ 0, 0, 0 ]
				] );
			} );

			it( 'should change model selection if cell was passed', () => {
				const spy = sinon.spy();

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );

				model.document.selection.on( 'change', spy );
				tableSelection.stopSelection( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should extend selection to passed table cell', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );

				tableSelection.stopSelection( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				assertSelectedCells( [
					[ 1, 1, 0 ],
					[ 0, 0, 0 ],
					[ 0, 0, 0 ]
				] );
			} );
		} );

		describe( 'clearSelection()', () => {
			it( 'should not change model selection', () => {
				const spy = sinon.spy();

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				model.document.selection.on( 'change', spy );

				tableSelection.clearSelection();

				sinon.assert.notCalled( spy );
			} );

			it( 'should not reset model selections', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				tableSelection.clearSelection();

				assertSelectedCells( [
					[ 1, 1, 0 ],
					[ 0, 0, 0 ],
					[ 0, 0, 0 ]
				] );
			} );
		} );

		describe( '* getSelectedTableCells()', () => {
			it( 'should return nothing if selection is not started', () => {
				expect( Array.from( tableSelection.getSelectedTableCells() ) ).to.deep.equal( [] );
			} );

			it( 'should return two table cells', () => {
				const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
				const lastCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );

				tableSelection.startSelectingFrom( firstCell );
				tableSelection.setSelectingTo( lastCell );

				expect( Array.from( tableSelection.getSelectedTableCells() ) ).to.deep.equal( [
					firstCell, lastCell
				] );
			} );

			it( 'should return four table cells for diagonal selection', () => {
				const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
				const lastCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

				tableSelection.startSelectingFrom( firstCell );
				tableSelection.setSelectingTo( lastCell );

				expect( Array.from( tableSelection.getSelectedTableCells() ) ).to.deep.equal( [
					firstCell, modelRoot.getNodeByPath( [ 0, 0, 1 ] ), modelRoot.getNodeByPath( [ 0, 1, 0 ] ), lastCell
				] );
			} );

			it( 'should return row table cells', () => {
				const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
				const lastCell = modelRoot.getNodeByPath( [ 0, 0, 2 ] );

				tableSelection.startSelectingFrom( firstCell );
				tableSelection.setSelectingTo( lastCell );

				expect( Array.from( tableSelection.getSelectedTableCells() ) ).to.deep.equal( [
					firstCell, modelRoot.getNodeByPath( [ 0, 0, 1 ] ), lastCell
				] );
			} );

			it( 'should return column table cells', () => {
				const firstCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );
				const lastCell = modelRoot.getNodeByPath( [ 0, 2, 1 ] );

				tableSelection.startSelectingFrom( firstCell );
				tableSelection.setSelectingTo( lastCell );

				expect( Array.from( tableSelection.getSelectedTableCells() ) ).to.deep.equal( [
					firstCell, modelRoot.getNodeByPath( [ 0, 1, 1 ] ), lastCell
				] );
			} );
		} );
	} );

	// Helper method for asserting selected table cells.
	//
	// To check if a table has expected cells selected pass two dimensional array of truthy and falsy values:
	//
	//		assertSelectedCells( [
	//			[ 0, 1 ],
	//			[ 0, 1 ]
	//		] );
	//
	// The above call will check if table has second column selected (assuming no spans).
	//
	// **Note**: This function operates on child indexes - not rows/columns.
	function assertSelectedCells( tableMap ) {
		const tableIndex = 0;

		for ( let rowIndex = 0; rowIndex < tableMap.length; rowIndex++ ) {
			const row = tableMap[ rowIndex ];

			for ( let cellIndex = 0; cellIndex < row.length; cellIndex++ ) {
				const expectSelected = row[ cellIndex ];

				if ( expectSelected ) {
					assertNodeIsSelected( [ tableIndex, rowIndex, cellIndex ] );
				} else {
					assertNodeIsNotSelected( [ tableIndex, rowIndex, cellIndex ] );
				}
			}
		}
	}

	function assertNodeIsSelected( path ) {
		const node = modelRoot.getNodeByPath( path );
		const selectionRanges = Array.from( model.document.selection.getRanges() );

		expect( selectionRanges.some( range => range.containsItem( node ) ), `Expected node [${ path }] to be selected` ).to.be.true;
	}

	function assertNodeIsNotSelected( path ) {
		const node = modelRoot.getNodeByPath( path );
		const selectionRanges = Array.from( model.document.selection.getRanges() );

		expect( selectionRanges.every( range => !range.containsItem( node ) ), `Expected node [${ path }] to be not selected` ).to.be.true;
	}
} );
