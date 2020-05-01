/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import EditorUI from '../../src/editor/editorui';
import Editor from '../../src/editor/editor';

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';

import testUtils from '../_utils/utils';

/* global document, console */

describe( 'EditorUI', () => {
	let editor, ui;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editor = new Editor();
		ui = new EditorUI( editor );
	} );

	afterEach( () => {
		ui.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should set #editor', () => {
			expect( ui.editor ).to.equal( editor );
		} );

		it( 'should create #componentFactory factory', () => {
			expect( ui.componentFactory ).to.be.instanceOf( ComponentFactory );
		} );

		it( 'should create #focusTracker', () => {
			expect( ui.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should have #element getter', () => {
			expect( ui.element ).to.null;
		} );

		it( 'should fire update event after viewDocument#layoutChanged', () => {
			const spy = sinon.spy();

			ui.on( 'update', spy );

			editor.editing.view.document.fire( 'layoutChanged' );

			sinon.assert.calledOnce( spy );

			editor.editing.view.document.fire( 'layoutChanged' );

			sinon.assert.calledTwice( spy );
		} );
	} );

	describe( 'update()', () => {
		it( 'should fire update event', () => {
			const spy = sinon.spy();

			ui.on( 'update', spy );

			ui.update();

			sinon.assert.calledOnce( spy );

			ui.update();

			sinon.assert.calledTwice( spy );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should stop listening', () => {
			const spy = sinon.spy( ui, 'stopListening' );

			ui.destroy();

			sinon.assert.called( spy );
		} );

		it( 'should reset editables array', () => {
			ui.setEditableElement( 'foo', {} );
			ui.setEditableElement( 'bar', {} );

			expect( [ ...ui.getEditableElementsNames() ] ).to.deep.equal( [ 'foo', 'bar' ] );

			ui.destroy();

			expect( [ ...ui.getEditableElementsNames() ] ).to.have.length( 0 );
		} );

		it( 'removes domElement#ckeditorInstance references from registered root elements', () => {
			const fooElement = document.createElement( 'foo' );
			const barElement = document.createElement( 'bar' );

			ui.setEditableElement( 'foo', fooElement );
			ui.setEditableElement( 'bar', barElement );

			expect( fooElement.ckeditorInstance ).to.equal( editor );
			expect( barElement.ckeditorInstance ).to.equal( editor );

			ui.destroy();

			expect( fooElement.ckeditorInstance ).to.be.null;
			expect( barElement.ckeditorInstance ).to.be.null;
		} );
	} );

	describe( 'setEditableElement()', () => {
		it( 'should register the editable element under a name', () => {
			const ui = new EditorUI( editor );
			const element = document.createElement( 'div' );

			ui.setEditableElement( 'main', element );

			expect( ui.getEditableElement( 'main' ) ).to.equal( element );
		} );

		it( 'puts a reference to the editor instance in domElement#ckeditorInstance', () => {
			const ui = new EditorUI( editor );
			const element = document.createElement( 'div' );

			ui.setEditableElement( 'main', element );

			expect( element.ckeditorInstance ).to.equal( editor );
		} );

		it( 'does not override a reference to the editor instance in domElement#ckeditorInstance', () => {
			const ui = new EditorUI( editor );
			const element = document.createElement( 'div' );

			element.ckeditorInstance = 'foo';

			ui.setEditableElement( 'main', element );

			expect( element.ckeditorInstance ).to.equal( 'foo' );
		} );
	} );

	describe( 'getEditableElement()', () => {
		it( 'should return editable element (default root name)', () => {
			const ui = new EditorUI( editor );
			const editableMock = { name: 'main', element: document.createElement( 'div' ) };

			ui.setEditableElement( editableMock.name, editableMock.element );

			expect( ui.getEditableElement() ).to.equal( editableMock.element );
		} );

		it( 'should return editable element (custom root name)', () => {
			const ui = new EditorUI( editor );
			const editableMock1 = { name: 'root1', element: document.createElement( 'div' ) };
			const editableMock2 = { name: 'root2', element: document.createElement( 'p' ) };

			ui.setEditableElement( editableMock1.name, editableMock1.element );
			ui.setEditableElement( editableMock2.name, editableMock2.element );

			expect( ui.getEditableElement( 'root1' ) ).to.equal( editableMock1.element );
			expect( ui.getEditableElement( 'root2' ) ).to.equal( editableMock2.element );
		} );

		it( 'should return null if editable with specified name does not exist', () => {
			const ui = new EditorUI( editor );

			expect( ui.getEditableElement() ).to.be.undefined;
		} );
	} );

	describe( 'getEditableElementsNames()', () => {
		it( 'should return iterable object of names', () => {
			const ui = new EditorUI( editor );
			const editableMock1 = { name: 'main', element: document.createElement( 'div' ) };
			const editableMock2 = { name: 'root2', element: document.createElement( 'p' ) };

			ui.setEditableElement( editableMock1.name, editableMock1.element );
			ui.setEditableElement( editableMock2.name, editableMock2.element );

			const names = ui.getEditableElementsNames();
			expect( names[ Symbol.iterator ] ).to.instanceof( Function );
			expect( Array.from( names ) ).to.deep.equal( [ 'main', 'root2' ] );
		} );

		it( 'should return empty array if no editables', () => {
			const ui = new EditorUI( editor );

			expect( ui.getEditableElementsNames() ).to.be.empty;
		} );
	} );

	describe( '_editableElements()', () => {
		it( 'should warn about deprecation', () => {
			const ui = new EditorUI( editor );
			const stub = testUtils.sinon.stub( console, 'warn' );

			expect( ui._editableElements ).to.be.instanceOf( Map );
			sinon.assert.calledWithMatch( stub, 'editor-ui-deprecated-editable-elements' );
		} );
	} );
} );
