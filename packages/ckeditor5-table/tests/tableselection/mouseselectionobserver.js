/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

import TableEditing from '../../src/tableediting';
import TableSelection from '../../src/tableselection';
import { modelTable, viewTable } from '../_utils/utils';

describe( 'table selection', () => {
	let editor, model, modelRoot, view, viewDoc;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableEditing, TableSelection, Paragraph ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
		view = editor.editing.view;
		viewDoc = view.document;

		setModelData( model, modelTable( [
			[ '11[]', '12', '13' ],
			[ '21', '22', '23' ],
			[ '31', '32', '33' ]
		] ) );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'MouseSelectionObserver', () => {
		it( 'should not start table selection when mouse move is inside one table cell', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			pressMouseButtonOver( getTableCell( '00' ) );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			movePressedMouseOver( getTableCell( '00' ) );

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

			pressMouseButtonOver( getTableCell( '00' ) );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			movePressedMouseOver( getTableCell( '01' ) );

			assertSelectedCells( [
				[ 1, 1 ],
				[ 0, 0 ]
			] );

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

			pressMouseButtonOver( getTableCell( '00' ) );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			movePressedMouseOver( getTableCell( '11' ) );

			assertSelectedCells( [
				[ 1, 1 ],
				[ 1, 1 ]
			] );

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

			pressMouseButtonOver( getTableCell( '11' ) );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '00', '01' ],
				[ '10', '[]11' ]
			] ) );

			movePressedMouseOver( getTableCell( '00' ) );

			assertSelectedCells( [
				[ 1, 1 ],
				[ 1, 1 ]
			] );

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

			pressMouseButtonOver( getTableCell( '00' ) );
			movePressedMouseOver( getTableCell( '22' ) );

			assertSelectedCells( [
				[ 1, 1, 1 ],
				[ 1, 1, 1 ],
				[ 1, 1, 1 ]
			] );

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

			movePressedMouseOver( getTableCell( '11' ) );

			assertSelectedCells( [
				[ 1, 1, 0 ],
				[ 1, 1, 0 ],
				[ 0, 0, 0 ]
			] );

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

			pressMouseButtonOver( getTableCell( '00' ) );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			movePressedMouseOver( getTableCell( '01' ) );
			releaseMouseButtonOver( getTableCell( '01' ) );

			assertSelectedCells( [
				[ 1, 1 ],
				[ 0, 0 ]
			] );

			assertEqualMarkup( getViewData( view ), viewTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ '10', '11' ]
			], { asWidget: true } ) );

			moveReleasedMouseOver( getTableCell( '11' ) );

			assertSelectedCells( [
				[ 1, 1 ],
				[ 0, 0 ]
			] );
		} );

		it( 'should do nothing on "mouseup" event', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			releaseMouseButtonOver( getTableCell( '01' ) );

			assertSelectedCells( [
				[ 0, 0 ],
				[ 0, 0 ]
			] );
		} );

		it( 'should stop selection mode on "mouseleve" event if next "mousemove" has no button pressed', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			pressMouseButtonOver( getTableCell( '00' ) );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			movePressedMouseOver( getTableCell( '01' ) );
			makeMouseLeave();

			assertSelectedCells( [
				[ 1, 1 ],
				[ 0, 0 ]
			] );

			assertEqualMarkup( getViewData( view ), viewTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ '10', '11' ]
			], { asWidget: true } ) );

			moveReleasedMouseOver( getTableCell( '11' ) );

			assertSelectedCells( [
				[ 1, 1 ],
				[ 0, 0 ]
			] );
		} );

		it( 'should continue selection mode on "mouseleve" and "mousemove" if mouse button is pressed', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			pressMouseButtonOver( getTableCell( '00' ) );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			movePressedMouseOver( getTableCell( '01' ) );
			makeMouseLeave();

			assertSelectedCells( [
				[ 1, 1 ],
				[ 0, 0 ]
			] );

			assertEqualMarkup( getViewData( view ), viewTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ '10', '11' ]
			], { asWidget: true } ) );

			movePressedMouseOver( getTableCell( '11' ) );

			assertSelectedCells( [
				[ 1, 1 ],
				[ 1, 1 ]
			] );
		} );

		it( 'should do nothing on "mouseleve" event', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			makeMouseLeave();

			assertSelectedCells( [
				[ 0, 0 ],
				[ 0, 0 ]
			] );
		} );

		it( 'should do nothing on "mousedown" event over ui element (click on selection handle)', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			const uiElement = viewDoc.getRoot()
				.getChild( 0 )
				.getChild( 0 ); // selection handler;

			fireEvent( view, 'mousedown', addTarget( uiElement ), mouseButtonPressed );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should do nothing on "mousemove" event over ui element (click on selection handle)', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			const uiElement = viewDoc.getRoot()
				.getChild( 0 )
				.getChild( 0 ); // selection handler;

			fireEvent( view, 'mousemove', addTarget( uiElement ), mouseButtonPressed );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should clear view table selection after mouse click outside table', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) + '<paragraph>foo</paragraph>' );

			pressMouseButtonOver( getTableCell( '00' ) );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) + '<paragraph>foo</paragraph>' );

			movePressedMouseOver( getTableCell( '01' ) );

			const paragraph = viewDoc.getRoot().getChild( 1 );

			fireEvent( view, 'mousemove', addTarget( paragraph ) );
			fireEvent( view, 'mousedown', addTarget( paragraph ) );
			fireEvent( view, 'mouseup', addTarget( paragraph ) );

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

	function getTableCell( data ) {
		for ( const value of view.createRangeIn( viewDoc.getRoot() ) ) {
			if ( value.type === 'text' && value.item.data === data ) {
				return value.item.parent.parent;
			}
		}
	}

	function makeMouseLeave() {
		fireEvent( view, 'mouseleave' );
	}

	function pressMouseButtonOver( target ) {
		fireEvent( view, 'mousedown', addTarget( target ), mouseButtonPressed );
	}

	function movePressedMouseOver( target ) {
		moveMouseOver( target, mouseButtonPressed );
	}

	function moveReleasedMouseOver( target ) {
		moveMouseOver( target, mouseButtonReleased );
	}

	function moveMouseOver( target, ...decorators ) {
		fireEvent( view, 'mousemove', addTarget( target ), ...decorators );
	}

	function releaseMouseButtonOver( target ) {
		fireEvent( view, 'mouseup', addTarget( target ), mouseButtonReleased );
	}

	function addTarget( target ) {
		return domEventData => {
			domEventData.target = target;
		};
	}

	function mouseButtonPressed( domEventData ) {
		domEventData.domEvent.buttons = 1;
	}

	function mouseButtonReleased( domEventData ) {
		domEventData.domEvent.buttons = 0;
	}

	function fireEvent( view, eventName, ...decorators ) {
		const domEvtDataStub = {
			domEvent: {
				buttons: 0
			},
			target: undefined,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};

		for ( const decorator of decorators ) {
			decorator( domEvtDataStub );
		}

		viewDoc.fire( eventName, domEvtDataStub );
	}
} );
