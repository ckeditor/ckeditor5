/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, console */

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
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'table selection', () => {
	let editorElement, editor, model, tableSelection, modelRoot, view, viewDocument;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	describe( 'selection by shift+click', () => {
		beforeEach( async () => {
			// Disables attaching drag mouse events.
			sinon.stub( TableSelection.prototype, '_enableMouseDragSelection' );

			editor = await createEditor();
			model = editor.model;
			modelRoot = model.document.getRoot();
			view = editor.editing.view;
			viewDocument = view.document;
			tableSelection = editor.plugins.get( TableSelection );

			setModelData( model, modelTable( [
				[ '11[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		afterEach( () => {
			TableSelection.prototype._enableMouseDragSelection.restore();
		} );

		it( 'should do nothing if the plugin is disabled', () => {
			tableSelection.isEnabled = false;

			viewDocument.fire( 'mousedown', new DomEventData( view, {} ) );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should abort if Shift key was not pressed', () => {
			viewDocument.fire( 'mousedown', new DomEventData( view, {
				shiftKey: false
			} ) );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should abort if started selecting elements outside the table', () => {
			const preventDefault = sinon.spy();

			model.change( writer => {
				const paragraph = writer.createElement( 'paragraph' );
				const text = writer.createText( 'foo' );

				writer.insert( text, paragraph );
				writer.insert( paragraph, model.document.getRoot(), 'end' );
				writer.setSelection( paragraph, 'end' );
			} );

			viewDocument.fire( 'mousedown', new DomEventData( view, {
				shiftKey: true,
				target: view.domConverter.mapViewToDom(
					viewDocument.getRoot().getChild( 1 )
				),
				preventDefault
			} ) );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );

			expect( preventDefault.called ).to.equal( false );
		} );

		it( 'should abort if clicked a cell that belongs to another table', () => {
			const preventDefault = sinon.spy();

			setModelData( model, [
				modelTable( [
					[ '1.11[]', '1.12' ],
					[ '1.21', '1.22' ]
				] ),
				modelTable( [
					[ '2.11', '2.12' ],
					[ '2.21', '2.22' ]
				] )
			].join( '' ) );

			const domEventDataMock = new DomEventData( view, {
				shiftKey: true,
				target: view.domConverter.mapViewToDom(
					// The second table: figure > table > tbody > tr > td
					viewDocument.getRoot().getChild( 1 ).getChild( 1 ).getChild( 0 ).getChild( 1 ).getChild( 1 )
				),
				preventDefault
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			assertSelectedCells( model, [
				[ 0, 0 ],
				[ 0, 0 ]
			] );

			expect( preventDefault.called ).to.equal( false );
		} );

		it( 'should select all cells in first row', () => {
			const preventDefault = sinon.spy();

			const domEventDataMock = new DomEventData( view, {
				shiftKey: true,
				target: view.domConverter.mapViewToDom(
					// figure > table > tbody > tr > td
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 2 )
				),
				preventDefault
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			assertSelectedCells( model, [
				[ 1, 1, 1 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );

			expect( preventDefault.called ).to.equal( true );
		} );

		it( 'should ignore `selectionChange` event when selecting cells ', () => {
			const consoleLog = sinon.stub( console, 'log' );
			const preventDefault = sinon.spy();
			const selectionChangeCallback = sinon.spy();

			// Adding a new callback to check whether it will be executed (whether `evt.stop()` is being called).
			viewDocument.on( 'selectionChange', selectionChangeCallback );

			// No changes were made.
			expect( selectionChangeCallback.called ).to.equal( false );

			// Start selecting a cell. Disables listening to `selectionChange`.
			viewDocument.fire( 'mousedown', new DomEventData( view, {
				shiftKey: true,
				target: view.domConverter.mapViewToDom(
					// figure > table > tbody > tr > td
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 2 )
				),
				preventDefault
			} ) );

			// The callback shouldn't be executed.
			viewDocument.fire( 'selectionChange' );

			expect( selectionChangeCallback.called ).to.equal( false );

			// `selectionChange` event should be canceled.
			expect( selectionChangeCallback.called ).to.equal( false );

			// Enables listening to `selectionChange` event.
			viewDocument.fire( 'mouseup' );

			viewDocument.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( selectionChangeCallback.called ).to.equal( true );
			expect( consoleLog.called ).to.equal( true );
			expect( consoleLog.firstCall.args[ 0 ] ).to.equal( 'Blocked selectionChange to avoid breaking table cells selection.' );

			consoleLog.restore();
		} );
	} );

	describe( 'selection by mouse drag', () => {
		let preventDefault;

		beforeEach( async () => {
			// Disables attaching mouse+Shift events.
			sinon.stub( TableSelection.prototype, '_enableShiftClickSelection' );

			editor = await createEditor();
			model = editor.model;
			modelRoot = model.document.getRoot();
			view = editor.editing.view;
			viewDocument = view.document;
			tableSelection = editor.plugins.get( TableSelection );

			setModelData( model, modelTable( [
				[ '11[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );

			preventDefault = sinon.spy();
		} );

		afterEach( () => {
			TableSelection.prototype._enableShiftClickSelection.restore();
		} );

		it( 'should do nothing if the plugin is disabled', () => {
			tableSelection.isEnabled = false;

			const domEventDataMock = new DomEventData( view, {} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should abort if Shift is pressed', () => {
			const domEventDataMock = new DomEventData( view, {
				shiftKey: true
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should abort if Ctrl is pressed', () => {
			const domEventDataMock = new DomEventData( view, {
				ctrlKey: true
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should abort if Alt is pressed', () => {
			const domEventDataMock = new DomEventData( view, {
				altKey: true
			} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should do nothing if any of mouse buttons was not clicked', () => {
			viewDocument.fire( 'mousemove', new DomEventData( view, {
				buttons: 0
			} ) );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should do nothing if started dragging outside of table', () => {
			model.change( writer => {
				const paragraph = writer.createElement( 'paragraph' );
				const text = writer.createText( 'foo' );

				writer.insert( text, paragraph );
				writer.insert( paragraph, model.document.getRoot(), 'end' );
				writer.setSelection( paragraph, 'end' );
			} );

			viewDocument.fire( 'mousedown', new DomEventData( view, {
				target: view.domConverter.mapViewToDom(
					viewDocument.getRoot().getChild( 1 )
				)
			} ) );

			viewDocument.fire( 'mousemove', new DomEventData( view, {
				buttons: 1
			} ) );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should do nothing if ended dragging outside of table', () => {
			model.change( writer => {
				const paragraph = writer.createElement( 'paragraph' );
				const text = writer.createText( 'foo' );

				writer.insert( text, paragraph );
				writer.insert( paragraph, model.document.getRoot(), 'end' );
				writer.setSelection( paragraph, 'end' );
			} );

			viewDocument.fire( 'mousedown', new DomEventData( view, {
				target: view.domConverter.mapViewToDom(
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 0 )
				)
			} ) );

			viewDocument.fire( 'mousemove', new DomEventData( view, {
				target: view.domConverter.mapViewToDom(
					viewDocument.getRoot().getChild( 1 )
				),
				buttons: 1
			} ) );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should do nothing if ended dragging inside another table', () => {
			setModelData( model, [
				modelTable( [
					[ '1.11[]', '1.12' ],
					[ '1.21', '1.22' ]
				] ),
				modelTable( [
					[ '2.11', '2.12' ],
					[ '2.21', '2.22' ]
				] )
			].join( '' ) );

			viewDocument.fire( 'mousedown', new DomEventData( view, {
				target: view.domConverter.mapViewToDom(
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 0 )
				)
			} ) );

			viewDocument.fire( 'mousemove', new DomEventData( view, {
				target: view.domConverter.mapViewToDom(
					viewDocument.getRoot().getChild( 1 ).getChild( 1 ).getChild( 0 ).getChild( 1 ).getChild( 1 )
				),
				buttons: 1
			} ) );

			assertSelectedCells( model, [
				[ 0, 0 ],
				[ 0, 0 ]
			] );
		} );

		it( 'should do nothing if ended in the same cell', () => {
			viewDocument.fire( 'mousedown', new DomEventData( view, {
				target: view.domConverter.mapViewToDom(
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 0 )
				)
			} ) );

			viewDocument.fire( 'mousemove', new DomEventData( view, {
				target: view.domConverter.mapViewToDom(
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 0 )
				),
				buttons: 1
			} ) );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should select started and ended dragging in the same cell but went over its border', () => {
			viewDocument.fire( 'mousedown', new DomEventData( view, {
				target: view.domConverter.mapViewToDom(
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 0 )
				)
			} ) );

			// Select the next one.
			viewDocument.fire( 'mousemove', new DomEventData( view, {
				target: view.domConverter.mapViewToDom(
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 1 )
				),
				buttons: 1,
				preventDefault: sinon.spy()
			} ) );

			// And back to the "started" cell.
			viewDocument.fire( 'mousemove', new DomEventData( view, {
				target: view.domConverter.mapViewToDom(
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 0 )
				),
				buttons: 1,
				preventDefault: sinon.spy()
			} ) );

			viewDocument.fire( 'mouseup' );

			assertSelectedCells( model, [
				[ 1, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should select all cells in first row', () => {
			viewDocument.fire( 'mousedown', new DomEventData( view, {
				target: view.domConverter.mapViewToDom(
					// figure > table > tbody > tr > td
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 0 )
				)
			} ) );

			viewDocument.fire( 'mousemove', new DomEventData( view, {
				target: view.domConverter.mapViewToDom(
					// figure > table > tbody > tr > td
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 2 )
				),
				buttons: 1,
				preventDefault
			} ) );

			viewDocument.fire( 'mouseup' );

			assertSelectedCells( model, [
				[ 1, 1, 1 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );

			expect( preventDefault.called ).to.equal( true );
		} );

		it( 'should ignore `selectionChange` event when selecting cells ', () => {
			const consoleLog = sinon.stub( console, 'log' );
			const preventDefault = sinon.spy();
			const selectionChangeCallback = sinon.spy();

			// Adding a new callback to check whether it will be executed (whether `evt.stop()` is being called).
			viewDocument.on( 'selectionChange', selectionChangeCallback );

			// No changes were made.
			expect( selectionChangeCallback.called ).to.equal( false );

			// Click on a cell.
			viewDocument.fire( 'mousedown', new DomEventData( view, {
				target: view.domConverter.mapViewToDom(
					// figure > table > tbody > tr > td
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 1 )
				)
			} ) );

			// Then move the mouse to another cell. Disables listening to `selectionChange`.
			viewDocument.fire( 'mousemove', new DomEventData( view, {
				buttons: 1,
				target: view.domConverter.mapViewToDom(
					// figure > table > tbody > tr > td
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 2 )
				),
				preventDefault
			} ) );

			// The callback shouldn't be executed.
			viewDocument.fire( 'selectionChange' );

			// `selectionChange` event should be canceled.
			expect( selectionChangeCallback.called ).to.equal( false );

			// Enables listening to `selectionChange` event.
			viewDocument.fire( 'mouseup' );

			viewDocument.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( selectionChangeCallback.called ).to.equal( true );
			expect( consoleLog.called ).to.equal( true );
			expect( consoleLog.firstCall.args[ 0 ] ).to.equal( 'Blocked selectionChange to avoid breaking table cells selection.' );

			consoleLog.restore();
		} );
	} );

	describe( 'getSelectedTableCells()', () => {
		beforeEach( async () => {
			editor = await createEditor();
			model = editor.model;
			modelRoot = model.document.getRoot();
			view = editor.editing.view;
			viewDocument = view.document;
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

			tableSelection._setCellSelection(
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

			tableSelection._setCellSelection(
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

			tableSelection._setCellSelection(
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

			tableSelection._setCellSelection( firstCell, lastCell );

			expect( tableSelection.getSelectedTableCells() ).to.deep.equal( [
				firstCell, modelRoot.getNodeByPath( [ 0, 1, 1 ] ), lastCell
			] );
		} );

		it( 'should return cells in source order despite backward selection', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 2 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );

			tableSelection._setCellSelection( firstCell, lastCell );

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
			view = editor.editing.view;
			viewDocument = view.document;
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
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			expect( tableSelection.getSelectionAsFragment() ).to.be.instanceOf( DocumentFragment );
		} );

		it( 'should return cells in the source order in case of forward selection', () => {
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			expect( stringifyModel( tableSelection.getSelectionAsFragment() ) ).to.equal( modelTable( [
				[ '11', '12' ],
				[ '21', '22' ]
			] ) );
		} );

		it( 'should return cells in the source order in case of backward selection', () => {
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 0 ] )
			);

			expect( editor.model.document.selection.isBackward ).to.be.true;

			expect( stringifyModel( tableSelection.getSelectionAsFragment() ) ).to.equal( modelTable( [
				[ '11', '12' ],
				[ '21', '22' ]
			] ) );
		} );
	} );

	describe( 'delete content', () => {
		beforeEach( async () => {
			editor = await createEditor();
			model = editor.model;
			modelRoot = model.document.getRoot();
			view = editor.editing.view;
			viewDocument = view.document;
			tableSelection = editor.plugins.get( TableSelection );

			setModelData( model, modelTable( [
				[ '11[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should put selection in the last selected cell after removing content (backward delete)', () => {
			tableSelection._setCellSelection(
				modelRoot.getChild( 0 ).getChild( 0 ).getChild( 0 ),
				modelRoot.getChild( 0 ).getChild( 1 ).getChild( 1 )
			);

			editor.execute( 'delete' );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '', '', '13' ],
				[ '', '[]', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should put selection in the last selected cell after removing content (forward delete)', () => {
			tableSelection._setCellSelection(
				modelRoot.getChild( 0 ).getChild( 0 ).getChild( 0 ),
				modelRoot.getChild( 0 ).getChild( 1 ).getChild( 1 )
			);

			editor.execute( 'delete' );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '', '', '13' ],
				[ '', '[]', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should clear single cell if selected', () => {
			tableSelection._setCellSelection(
				modelRoot.getChild( 0 ).getChild( 0 ).getChild( 0 ),
				modelRoot.getChild( 0 ).getChild( 0 ).getChild( 0 ),
			);

			editor.execute( 'forwardDelete' );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );
	} );

	function createEditor() {
		return ClassicTestEditor.create( editorElement, {
			plugins: [ TableEditing, TableSelection, Paragraph, Typing ]
		} );
	}
} );
