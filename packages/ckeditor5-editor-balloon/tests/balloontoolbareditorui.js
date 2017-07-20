/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';

import BalloonToolbarEditorUI from '../src/balloontoolbareditorui';
import BalloonToolbarEditorUIView from '../src/balloontoolbareditoruiview';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ContextualToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/contextual/contextualtoolbar';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import utils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'BalloonToolbarEditorUI', () => {
	let editorElement, editor, editable, view, ui;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = new ClassicTestEditor( editorElement, {
			plugins: [ ContextualToolbar ]
		} );

		return editor.initPlugins()
			.then( () => {
				view = new BalloonToolbarEditorUIView( editor.locale );
				ui = new BalloonToolbarEditorUI( editor, view );
				editable = editor.editing.view.getRoot();
			} );
	} );

	describe( 'constructor()', () => {
		it( 'sets #editor', () => {
			expect( ui.editor ).to.equal( editor );
		} );

		it( 'sets #view', () => {
			expect( ui.view ).to.equal( view );
		} );

		it( 'creates #componentFactory factory', () => {
			expect( ui.componentFactory ).to.be.instanceOf( ComponentFactory );
		} );

		it( 'creates #focusTracker', () => {
			expect( ui.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		describe( 'editable', () => {
			it( 'registers view.editable#element in editor focus tracker', () => {
				ui.focusTracker.isFocused = false;

				view.editable.element.dispatchEvent( new Event( 'focus' ) );
				expect( ui.focusTracker.isFocused ).to.true;
			} );

			it( 'sets view.editable#name', () => {
				expect( view.editable.name ).to.equal( editable.rootName );
			} );

			it( 'binds view.editable#isFocused', () => {
				utils.assertBinding(
					view.editable,
					{ isFocused: false },
					[
						[ ui.focusTracker, { isFocused: true } ]
					],
					{ isFocused: true }
				);
			} );

			it( 'binds view.editable#isReadOnly', () => {
				utils.assertBinding(
					view.editable,
					{ isReadOnly: false },
					[
						[ editable, { isReadOnly: true } ]
					],
					{ isReadOnly: true }
				);
			} );
		} );
	} );

	describe( 'init()', () => {
		afterEach( () => {
			ui.destroy();
		} );

		it( 'initializes the #view', () => {
			const spy = sinon.spy( view, 'init' );

			ui.init();
			sinon.assert.calledOnce( spy );
		} );

		it( 'initializes keyboard navigation between view#toolbar and view#editable', () => {
			const toolbar = editor.plugins.get( 'ContextualToolbar' );
			const toolbarFocusSpy = sinon.stub( toolbar.toolbarView, 'focus', () => {} );
			const toolbarShowSpy = sinon.stub( toolbar, 'show', () => {} );
			const toolbarHideSpy = sinon.stub( toolbar, 'hide', () => {} );
			const editingFocusSpy = sinon.stub( editor.editing.view, 'focus', () => {} );

			ui.init();
			ui.focusTracker.isFocused = true;

			// #show and #hide are mocked so mocking the focus as well.
			toolbar.toolbarView.focusTracker.isFocused = false;

			editor.keystrokes.press( {
				keyCode: keyCodes.f10,
				altKey: true,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.callOrder( toolbarShowSpy, toolbarFocusSpy );
			sinon.assert.notCalled( toolbarHideSpy );
			sinon.assert.notCalled( editingFocusSpy );

			// #show and #hide are mocked so mocking the focus as well.
			toolbar.toolbarView.focusTracker.isFocused = true;

			toolbar.toolbarView.keystrokes.press( {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.callOrder( editingFocusSpy, toolbarHideSpy );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'destroys the #view', () => {
			const spy = sinon.spy( view, 'destroy' );

			ui.init();
			ui.destroy();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
