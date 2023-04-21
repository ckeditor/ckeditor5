/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../src/tableediting';
import TableSelection from '../src/tableselection';
import TableMouse from '../src/tablemouse';
import { assertSelectedCells, modelTable } from './_utils/utils';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';

describe( 'TableMouse', () => {
	let editorElement, editor, model, tableMouse, modelRoot, view, viewDocument;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	describe( 'plugin', () => {
		beforeEach( async () => {
			editor = await createEditor();
		} );

		it( 'should have pluginName', () => {
			expect( TableMouse.pluginName ).to.equal( 'TableMouse' );
		} );
	} );

	describe( 'selection by Shift+click', () => {
		beforeEach( async () => {
			editor = await createEditor();
			model = editor.model;
			modelRoot = model.document.getRoot();
			view = editor.editing.view;
			viewDocument = view.document;
			tableMouse = editor.plugins.get( TableMouse );

			setModelData( model, modelTable( [
				[ '11[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should do nothing if the plugin is disabled', () => {
			tableMouse.isEnabled = false;

			viewDocument.fire( 'mousedown', new DomEventData( view, {} ) );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should do nothing if the TableSelection plugin is disabled', () => {
			editor.plugins.get( 'TableSelection' ).isEnabled = false;

			viewDocument.fire( 'mousedown', new DomEventData( view, {} ) );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should abort if Shift key was not pressed', () => {
			viewDocument.fire( 'mousedown', new DomEventData( view, {
				shiftKey: false,
				target: view.domConverter.mapViewToDom(
					// figure > table > tbody > tr > td
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 2 )
				)
			} ) );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should abort if Shift+clicked an element outside a table', () => {
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

		it( 'should use the anchor cell from the selection if possible', () => {
			const preventDefault = sinon.spy();

			const domEventDataMock = new DomEventData( view, {
				shiftKey: true,
				target: view.domConverter.mapViewToDom(
					// figure > table > tbody > tr > td
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 2 )
				),
				preventDefault
			} );

			editor.plugins.get( 'TableSelection' ).setCellSelection(
				modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 2, 1 ] )
			);
			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 1, 1, 0 ],
				[ 1, 1, 0 ]
			] );

			viewDocument.fire( 'mousedown', domEventDataMock );

			assertSelectedCells( model, [
				[ 1, 1, 1 ],
				[ 1, 1, 1 ],
				[ 0, 0, 0 ]
			] );

			expect( preventDefault.called ).to.equal( true );
		} );

		it( 'should ignore `selectionChange` event when selecting cells', () => {
			const preventDefault = sinon.spy();
			const selectionChangeCallback = sinon.spy();

			// Adding a new callback to check whether it will be executed (whether `evt.stop()` is being called).
			viewDocument.on( 'selectionChange', selectionChangeCallback );

			// Shift+click a cell to create a selection. Should disable listening to `selectionChange`.
			viewDocument.fire( 'mousedown', new DomEventData( view, {
				shiftKey: true,
				target: view.domConverter.mapViewToDom(
					// figure > table > tbody > tr > td
					viewDocument.getRoot().getChild( 0 ).getChild( 1 ).getChild( 0 ).getChild( 0 ).getChild( 2 )
				),
				preventDefault
			} ) );

			// Due to browsers "fixing" the selection (e.g. moving it to text nodes), after we set a selection
			// the browser fill fire native selectionchange, which triggers our selectionChange. We need to ignore it.
			// See a broader explanation in tablemouse.js.
			viewDocument.fire( 'selectionChange' );

			// The callback shouldn't be executed because
			// `selectionChange` event should be canceled.
			expect( selectionChangeCallback.called ).to.equal( false );

			// Enables listening to `selectionChange` event.
			viewDocument.fire( 'mouseup' );

			viewDocument.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( selectionChangeCallback.called ).to.equal( true );
		} );
	} );

	describe( 'selection by mouse drag', () => {
		let preventDefault;

		beforeEach( async () => {
			editor = await createEditor();
			model = editor.model;
			modelRoot = model.document.getRoot();
			view = editor.editing.view;
			viewDocument = view.document;
			tableMouse = editor.plugins.get( TableMouse );

			setModelData( model, modelTable( [
				[ '11[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );

			preventDefault = sinon.spy();
		} );

		it( 'should do nothing if the plugin is disabled', () => {
			tableMouse.isEnabled = false;

			const domEventDataMock = new DomEventData( view, {} );

			viewDocument.fire( 'mousedown', domEventDataMock );

			assertSelectedCells( model, [
				[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			] );
		} );

		it( 'should do nothing if the TableSelection plugin is disabled', () => {
			editor.plugins.get( 'TableSelection' ).isEnabled = false;

			const domEventDataMock = new DomEventData( view, {} );

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
			const preventDefault = sinon.spy();
			const selectionChangeCallback = sinon.spy();

			// Adding a new callback to check whether it will be executed (whether `evt.stop()` is being called).
			viewDocument.on( 'selectionChange', selectionChangeCallback );

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

			// See explanation why do we fire it in the similar test for Shift+click.
			viewDocument.fire( 'selectionChange' );

			// `selectionChange` event should be canceled.
			expect( selectionChangeCallback.called ).to.equal( false );

			// Enables listening to `selectionChange` event.
			viewDocument.fire( 'mouseup' );

			viewDocument.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( selectionChangeCallback.called ).to.equal( true );
		} );
	} );

	function createEditor() {
		return ClassicTestEditor.create( editorElement, {
			plugins: [ TableEditing, TableSelection, TableMouse, Paragraph, Typing ]
		} );
	}
} );
