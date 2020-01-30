/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

import TableEditing from '../src/tableediting';
import TableSelection from '../src/tableselection';
import { modelTable, viewTable } from './_utils/utils';

describe.only( 'table selection', () => {
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
		describe( 'hasValidSelection()', () => {
			it( 'should be false if selection is not started', () => {
				expect( tableSelection.hasValidSelection ).to.be.false;
			} );

			it( 'should be true if selection is selecting two different cells', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				expect( tableSelection.hasValidSelection ).to.be.true;
			} );

			it( 'should be false if selection start/end is selecting the same table cell', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );

				expect( tableSelection.hasValidSelection ).to.be.false;
			} );

			it( 'should be false if selection has no end cell', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );

				expect( tableSelection.hasValidSelection ).to.be.false;
			} );

			it( 'should be false if selection has ended', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );
				tableSelection.stopSelection();

				expect( tableSelection.hasValidSelection ).to.be.false;
			} );
		} );

		describe( 'startSelectingFrom()', () => {
			it( 'should not change model selection', () => {
				const spy = sinon.spy();

				model.document.selection.on( 'change', spy );

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );

				sinon.assert.notCalled( spy );
			} );
		} );

		describe( 'setSelectingTo()', () => {
			it( 'should not change model selection if selection is not started', () => {
				const spy = sinon.spy();

				model.document.selection.on( 'change', spy );

				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

				sinon.assert.notCalled( spy );
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

		describe( 'stopSelection()', () => {} );

		describe( 'clearSelection()', () => {} );

		describe( '* getSelectedTableCells()', () => {} );
	} );

	describe( 'mouse selection', () => {
		let view, domEvtDataStub;

		beforeEach( () => {
			view = editor.editing.view;

			domEvtDataStub = {
				domEvent: {
					buttons: 1
				},
				target: undefined,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
		} );

		it( 'should not start table selection when mouse move is inside one table cell', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );

			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should start table selection when mouse move expands over two cells', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );

			assertEqualMarkup( getViewData( view ), viewTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ '10', '11' ]
			], { asWidget: true } ) );
		} );

		it( 'should select rectangular table cells when mouse moved to diagonal cell (up -> down)', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true } ]
			] ) );

			assertEqualMarkup( getViewData( view ), viewTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ { contents: '10', class: 'selected', isSelected: true }, { contents: '11', class: 'selected', isSelected: true } ]
			], { asWidget: true } ) );
		} );

		it( 'should select rectangular table cells when mouse moved to diagonal cell (down -> up)', () => {
			setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '[]11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '00', '01' ],
				[ '10', '[]11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true } ]
			] ) );

			assertEqualMarkup( getViewData( view ), viewTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ { contents: '10', class: 'selected', isSelected: true }, { contents: '11', class: 'selected', isSelected: true } ]
			], { asWidget: true } ) );
		} );

		it( 'should update view selection after changing selection rect', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01', '02' ],
				[ '10', '11', '12' ],
				[ '20', '21', '22' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			selectTableCell( domEvtDataStub, view, 0, 0, 2, 2 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true }, { contents: '02', isSelected: true } ],
				[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true }, { contents: '12', isSelected: true } ],
				[ { contents: '20', isSelected: true }, { contents: '21', isSelected: true }, { contents: '22', isSelected: true } ]
			] ) );

			assertEqualMarkup( getViewData( view ), viewTable( [
				[
					{ contents: '00', class: 'selected', isSelected: true },
					{ contents: '01', class: 'selected', isSelected: true },
					{ contents: '02', class: 'selected', isSelected: true }
				],
				[
					{ contents: '10', class: 'selected', isSelected: true },
					{ contents: '11', class: 'selected', isSelected: true },
					{ contents: '12', class: 'selected', isSelected: true }
				],
				[
					{ contents: '20', class: 'selected', isSelected: true },
					{ contents: '21', class: 'selected', isSelected: true },
					{ contents: '22', class: 'selected', isSelected: true }
				]
			], { asWidget: true } ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true }, '02' ],
				[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true }, '12' ],
				[ '20', '21', '22' ]
			] ) );

			assertEqualMarkup( getViewData( view ), viewTable( [
				[
					{ contents: '00', class: 'selected', isSelected: true },
					{ contents: '01', class: 'selected', isSelected: true },
					'02'
				],
				[
					{ contents: '10', class: 'selected', isSelected: true },
					{ contents: '11', class: 'selected', isSelected: true },
					'12'
				],
				[
					'20',
					'21',
					'22'
				]
			], { asWidget: true } ) );
		} );

		it( 'should stop selecting after "mouseup" event', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			view.document.fire( 'mouseup', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );

			assertEqualMarkup( getViewData( view ), viewTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ '10', '11' ]
			], { asWidget: true } ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should stop selection mode on "mouseleve" event', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			view.document.fire( 'mouseleave', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );

			assertEqualMarkup( getViewData( view ), viewTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ '10', '11' ]
			], { asWidget: true } ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should clear view table selection after mouse click outside table', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) + '<paragraph>foo</paragraph>' );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) + '<paragraph>foo</paragraph>' );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			domEvtDataStub.target = view.document.getRoot().getChild( 1 );

			view.document.fire( 'mousemove', domEvtDataStub );
			view.document.fire( 'mousedown', domEvtDataStub );
			view.document.fire( 'mouseup', domEvtDataStub );

			// The click in the DOM would trigger selection change and it will set the selection:
			model.change( writer => {
				writer.setSelection( writer.createRange( writer.createPositionAt( model.document.getRoot().getChild( 1 ), 0 ) ) );
			} );

			assertEqualMarkup( getViewData( view ), viewTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			], { asWidget: true } ) + '<p>{}foo</p>' );
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

function selectTableCell( domEvtDataStub, view, tableIndex, sectionIndex, rowInSectionIndex, tableCellIndex ) {
	domEvtDataStub.target = view.document.getRoot()
		.getChild( tableIndex )
		.getChild( 1 ) // Table is second in widget
		.getChild( sectionIndex )
		.getChild( rowInSectionIndex )
		.getChild( tableCellIndex );
}
