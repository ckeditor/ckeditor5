/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../src/tableediting';
import TableSelection from '../src/tableselection';
import { assertSelectedCells, modelTable, viewTable } from './_utils/utils';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import DocumentFragment from '@ckeditor/ckeditor5-engine/src/model/documentfragment';

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

				assertSelectedCells( model, [
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

				assertSelectedCells( model, [
					[ 1, 1, 0 ],
					[ 0, 0, 0 ],
					[ 0, 0, 0 ]
				] );
			} );

			it( 'should select four table cells for diagonal selection', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );

				assertSelectedCells( model, [
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 0, 0, 0 ]
				] );
			} );

			it( 'should select row table cells', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 2 ] ) );

				assertSelectedCells( model, [
					[ 1, 1, 1 ],
					[ 0, 0, 0 ],
					[ 0, 0, 0 ]
				] );
			} );

			it( 'should select column table cells', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 2, 1 ] ) );

				assertSelectedCells( model, [
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ]
				] );
			} );

			it( 'should create proper selection on consecutive changes', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 2, 1 ] ) );

				assertSelectedCells( model, [
					[ 0, 0, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ]
				] );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				assertSelectedCells( model, [
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 0, 0 ]
				] );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 2, 2 ] ) );

				assertSelectedCells( model, [
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

				assertSelectedCells( model, [
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

				assertSelectedCells( model, [
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

				assertSelectedCells( model, [
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

		describe( 'getSelectionAsFragment()', () => {
			it( 'should return undefined if no table cells are selected', () => {
				expect( tableSelection.getSelectionAsFragment() ).to.be.undefined;
			} );

			it( 'should return document fragment for selected table cells', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );

				expect( tableSelection.getSelectionAsFragment() ).to.be.instanceOf( DocumentFragment );
			} );
		} );

		describe( 'behavior', () => {
			it( 'should clear selection on external changes', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				editor.model.change( writer => {
					writer.setSelection( modelRoot.getNodeByPath( [ 0, 0, 0, 0 ] ), 0 );
				} );

				assertSelectedCells( model, [
					[ 0, 0, 0 ],
					[ 0, 0, 0 ],
					[ 0, 0, 0 ]
				] );

				expect( editor.editing.view.document.selection.isFake ).to.be.false;
				assertEqualMarkup( getViewData( editor.editing.view ), viewTable( [
					[ '{}11', '12', '13' ],
					[ '21', '22', '23' ],
					[ '31', '32', '33' ]
				], { asWidget: true } ) );
			} );
		} );
	} );
} );
