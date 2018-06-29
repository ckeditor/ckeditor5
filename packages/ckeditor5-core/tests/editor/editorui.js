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

testUtils.createSinonSandbox();

describe( 'EditorUI', () => {
	let editor, view, ui;

	beforeEach( () => {
		editor = new Editor();
		view = new View();
		ui = new EditorUI( editor, view );
	} );

	afterEach( () => {
		return Promise.all( [
			editor.destroy(),
			ui.destroy()
		] );
	} );

	describe( 'constructor()', () => {
		it( 'should set #editor', () => {
			expect( ui.editor ).to.equal( editor );
		} );

		it( 'should set #view', () => {
			expect( ui.view ).to.equal( view );
		} );

		it( 'should create #componentFactory factory', () => {
			expect( ui.componentFactory ).to.be.instanceOf( ComponentFactory );
		} );

		it( 'should create #focusTracker', () => {
			expect( ui.focusTracker ).to.be.instanceOf( FocusTracker );
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

		it( 'should destroy the #view', () => {
			const spy = sinon.spy( view, 'destroy' );

			ui.destroy();

			sinon.assert.called( spy );
		} );
	} );
} );
