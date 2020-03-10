/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../src/tableediting';
import TableSelection from '../src/tableselection';
// import { assertSelectedCells, modelTable, viewTable } from './_utils/utils';
import { modelTable } from './_utils/utils';
// import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
// import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
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
	describe( 'selection by shift+click', () => {
		it( 'should...', () => {
			// tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
			// tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

			// tableSelection.stopSelection();

			// assertSelectedCells( model, [
			// 	[ 1, 1, 0 ],
			// 	[ 0, 0, 0 ],
			// 	[ 0, 0, 0 ]
			// ] );
		} );
	} );

	describe( 'selection by mouse drag', () => {
		it( 'should...', () => {
			// tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
			// tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

			// tableSelection.stopSelection();

			// assertSelectedCells( model, [
			// 	[ 1, 1, 0 ],
			// 	[ 0, 0, 0 ],
			// 	[ 0, 0, 0 ]
			// ] );
		} );
	} );

	describe( 'getSelectedTableCells()', () => {
		it( 'should return nothing if selection is not started', () => {
			expect( tableSelection.getSelectedTableCells() ).to.be.null;
		} );

		it( 'should return two table cells', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );

			tableSelection._setCellSelection(
				firstCell,
				lastCell
			);

			expect( Array.from( tableSelection.getSelectedTableCells() ) ).to.deep.equal( [
				firstCell, lastCell
			] );
		} );

		it( 'should return four table cells for diagonal selection', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

			tableSelection._setCellSelection(
				firstCell,
				lastCell
			);

			expect( Array.from( tableSelection.getSelectedTableCells() ) ).to.deep.equal( [
				firstCell, modelRoot.getNodeByPath( [ 0, 0, 1 ] ), modelRoot.getNodeByPath( [ 0, 1, 0 ] ), lastCell
			] );
		} );

		it( 'should return row table cells', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 0, 2 ] );

			tableSelection._setCellSelection(
				firstCell,
				lastCell
			);

			expect( Array.from( tableSelection.getSelectedTableCells() ) ).to.deep.equal( [
				firstCell, modelRoot.getNodeByPath( [ 0, 0, 1 ] ), lastCell
			] );
		} );

		it( 'should return column table cells', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 2, 1 ] );

			tableSelection._setCellSelection( firstCell, lastCell );

			expect( Array.from( tableSelection.getSelectedTableCells() ) ).to.deep.equal( [
				firstCell, modelRoot.getNodeByPath( [ 0, 1, 1 ] ), lastCell
			] );
		} );
	} );

	describe( 'getSelectionAsFragment()', () => {
		it( 'should return undefined if no table cells are selected', () => {
			expect( tableSelection.getSelectionAsFragment() ).to.be.null;
		} );

		it( 'should return document fragment for selected table cells', () => {
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			expect( tableSelection.getSelectionAsFragment() ).to.be.instanceOf( DocumentFragment );
		} );
	} );
} );
