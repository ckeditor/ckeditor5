/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import EditorUI from '../../src/editor/editorui';
import Editor from '../../src/editor/editor';

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import View from '@ckeditor/ckeditor5-ui/src/view';

import testUtils from '../_utils/utils';
import log from '@ckeditor/ckeditor5-utils/src/log';

/* global document */

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

		it( 'should not set #view by default', () => {
			testUtils.sinon.stub( log, 'warn' ).callsFake( () => {} );

			expect( ui._view ).to.undefined;
			expect( ui.view ).to.undefined;
		} );

		it( 'should set #view if passed', () => {
			testUtils.sinon.stub( log, 'warn' ).callsFake( () => {} );

			const editor = new Editor();
			const view = new View();
			const ui = new EditorUI( editor, view );

			expect( ui.view ).to.equal( view );
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

	describe( 'ready()', () => {
		it( 'should fire ready event', () => {
			const spy = sinon.spy();

			ui.on( 'ready', spy );

			ui.ready();

			sinon.assert.calledOnce( spy );

			ui.ready();

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

		it( 'should destroy the #view if present', () => {
			testUtils.sinon.stub( log, 'warn' ).callsFake( () => {} );

			const editor = new Editor();
			const view = new View();
			const ui = new EditorUI( editor, view );
			const spy = sinon.spy( view, 'destroy' );

			ui.destroy();

			sinon.assert.called( spy );
		} );

		it( 'should not throw when view absent', () => {
			expect( () => {
				ui.destroy();
			} ).to.not.throw();
		} );
	} );

	describe( 'getEditableElement()', () => {
		it( 'should return editable element (default root name)', () => {
			const ui = new EditorUI( editor );
			const editableMock = { name: 'main', element: document.createElement( 'div' ) };

			ui._editableElements.push( editableMock );

			expect( ui.getEditableElement() ).to.equal( editableMock.element );
		} );

		it( 'should return editable element (custom root name)', () => {
			const ui = new EditorUI( editor );
			const editableMock1 = { name: 'root1', element: document.createElement( 'div' ) };
			const editableMock2 = { name: 'root2', element: document.createElement( 'p' ) };

			ui._editableElements.push( editableMock1 );
			ui._editableElements.push( editableMock2 );

			expect( ui.getEditableElement( 'root1' ) ).to.equal( editableMock1.element );
			expect( ui.getEditableElement( 'root2' ) ).to.equal( editableMock2.element );
		} );

		it( 'should return null if editable with specified name does not exist', () => {
			const ui = new EditorUI( editor );

			expect( ui.getEditableElement() ).to.null;
		} );
	} );

	describe( 'getEditableElementsNames()', () => {
		it( 'should return array of names', () => {
			const ui = new EditorUI( editor );
			const editableMock1 = { name: 'main', element: document.createElement( 'div' ) };
			const editableMock2 = { name: 'root2', element: document.createElement( 'p' ) };

			ui._editableElements.push( editableMock1 );
			ui._editableElements.push( editableMock2 );

			expect( ui.getEditableElementsNames() ).to.deep.equal( [ 'main', 'root2' ] );
		} );

		it( 'should return empty array if no editables', () => {
			const ui = new EditorUI( editor );

			expect( ui.getEditableElementsNames() ).to.be.empty;
		} );
	} );
} );
