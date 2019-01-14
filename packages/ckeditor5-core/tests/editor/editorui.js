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
} );
