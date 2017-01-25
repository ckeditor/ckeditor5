/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import View from '@ckeditor/ckeditor5-ui/src/view';

import ClassicEditorUI from '../src/classiceditorui';
import ClassicEditorUIView from '../src/classiceditoruiview';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import utils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'ClassicEditorUI', () => {
	let editorElement, editor, editable, view, ui;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = new ClassicTestEditor( editorElement, {
			toolbar: [ 'foo', 'bar' ],
			ui: {
				width: 100,
				height: 200
			}
		} );

		view = new ClassicEditorUIView( editor.locale );
		ui = new ClassicEditorUI( editor, view );
		editable = editor.editing.view.getRoot();

		ui.componentFactory.add( 'foo', viewCreator( 'foo' ) );
		ui.componentFactory.add( 'bar', viewCreator( 'bar' ) );
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

		it( 'sets view#width and view#height', () => {
			expect( view.width ).to.equal( 100 );
			expect( view.height ).to.equal( 200 );
		} );

		describe( 'toolbar', () => {
			it( 'binds view.toolbar#isFocused to editor#focusTracker', () => {
				ui.focusTracker.isFocused = false;
				expect( view.toolbar.isActive ).to.be.false;

				ui.focusTracker.isFocused = true;
				expect( view.toolbar.isActive ).to.be.true;
			} );

			it( 'sets view.toolbar#limiterElement', () => {
				expect( view.toolbar.limiterElement ).to.equal( view.element );
			} );
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
						[ editor.editing.view, { isFocused: true } ]
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
			return ui.destroy();
		} );

		it( 'returns a promise', () => {
			document.body.appendChild( view.element );

			const promise = ui.init().then( () => {
				expect( promise ).to.be.instanceof( Promise );
			} );

			return promise;
		} );

		it( 'initializes the #view', () => {
			const spy = sinon.spy( view, 'init' );

			return ui.init().then( () => {
				sinon.assert.calledOnce( spy );
			} );
		} );

		it( 'fills view.toolbar#items with editor config', () => {
			return ui.init().then( () => {
				expect( view.toolbar.items ).to.have.length( 2 );
				expect( view.toolbar.items.get( 0 ).name ).to.equal( 'foo' );
				expect( view.toolbar.items.get( 1 ).name ).to.equal( 'bar' );
			} );
		} );

		describe( 'activates keyboard navigation for the toolbar', () => {
			it( 'Alt+F10: focus the first focusable toolbar item', () => {
				return ui.init().then( () => {
					const spy = sinon.spy( view.toolbar, 'focus' );
					const toolbarFocusTracker = view.toolbar.focusTracker;
					const keyEvtData = {
						keyCode: keyCodes.f10,
						altKey: true,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					toolbarFocusTracker.isFocused = false;
					ui.focusTracker.isFocused = false;

					editor.keystrokes.press( keyEvtData );
					sinon.assert.notCalled( spy );

					toolbarFocusTracker.isFocused = true;
					ui.focusTracker.isFocused = true;

					editor.keystrokes.press( keyEvtData );
					sinon.assert.notCalled( spy );

					toolbarFocusTracker.isFocused = false;
					ui.focusTracker.isFocused = true;

					editor.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( spy );

					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
				} );
			} );

			it( 'esc: re–foucus editable when toolbar is focused', () => {
				return ui.init().then( () => {
					const spy = sinon.spy( editor.editing.view, 'focus' );
					const toolbarFocusTracker = view.toolbar.focusTracker;
					const keyEvtData = { keyCode: keyCodes.esc,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					toolbarFocusTracker.isFocused = false;

					ui.view.toolbar.keystrokes.press( keyEvtData );
					sinon.assert.notCalled( spy );

					toolbarFocusTracker.isFocused = true;

					ui.view.toolbar.keystrokes.press( keyEvtData );

					sinon.assert.calledOnce( spy );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
				} );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( () => {
			document.body.appendChild( view.element );
		} );

		it( 'returns a promise', () => {
			return ui.init().then( () => {
				const promise = ui.destroy().then( () => {
					expect( promise ).to.be.instanceof( Promise );
				} );

				return promise;
			} );
		} );

		it( 'destroys the #view', () => {
			const spy = sinon.spy( view, 'destroy' );

			return ui.init()
				.then( () => ui.destroy() )
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );
	} );
} );

function viewCreator( name ) {
	return ( locale ) => {
		const view = new View( locale );

		view.name = name;
		view.element = document.createElement( 'a' );

		return view;
	};
}
