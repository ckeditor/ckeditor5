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

		return ClassicTestEditor
			.create( editorElement, {
				toolbar: [ 'foo', 'bar' ],
				ui: {
					width: 100,
					height: 200
				}
			} )
			.then( newEditor => {
				editor = newEditor;

				view = new ClassicEditorUIView( editor.locale );
				ui = new ClassicEditorUI( editor, view );
				editable = editor.editing.view.getRoot();

				ui.componentFactory.add( 'foo', viewCreator( 'foo' ) );
				ui.componentFactory.add( 'bar', viewCreator( 'bar' ) );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		editor.destroy();
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

			it( 'doesn\'t set view.toolbar#viewportTopOffset, if not specified in the config', () => {
				expect( view.toolbar.viewportTopOffset ).to.equal( 0 );
			} );

			it( 'sets view.toolbar#viewportTopOffset, when specified in the config', () => {
				editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						toolbar: {
							items: [ 'foo', 'bar' ],
							viewportTopOffset: 100
						}
					} )
					.then( editor => {
						view = new ClassicEditorUIView( editor.locale );
						ui = new ClassicEditorUI( editor, view );
						editable = editor.editing.view.getRoot();

						ui.componentFactory.add( 'foo', viewCreator( 'foo' ) );
						ui.componentFactory.add( 'bar', viewCreator( 'bar' ) );

						expect( view.toolbar.viewportTopOffset ).to.equal( 100 );

						editorElement.remove();
						return editor.destroy();
					} );
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
			ui.destroy();
		} );

		it( 'initializes the #view', () => {
			const spy = sinon.spy( view, 'init' );

			ui.init();
			sinon.assert.calledOnce( spy );
		} );

		describe( 'view.toolbar#items', () => {
			it( 'are filled with the config.toolbar (specified as an Array)', () => {
				const spy = testUtils.sinon.spy( view.toolbar, 'fillFromConfig' );

				ui.init();
				sinon.assert.calledWithExactly( spy, editor.config.get( 'toolbar' ), ui.componentFactory );
			} );

			it( 'are filled with the config.toolbar (specified as an Object)', () => {
				editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						toolbar: {
							items: [ 'foo', 'bar' ],
							viewportTopOffset: 100
						}
					} )
					.then( editor => {
						view = new ClassicEditorUIView( editor.locale );
						ui = new ClassicEditorUI( editor, view );

						ui.componentFactory.add( 'foo', viewCreator( 'foo' ) );
						ui.componentFactory.add( 'bar', viewCreator( 'bar' ) );

						const spy = testUtils.sinon.spy( view.toolbar, 'fillFromConfig' );

						ui.init();
						sinon.assert.calledWithExactly( spy,
							editor.config.get( 'toolbar.items' ),
							ui.componentFactory
						);
					} );
			} );
		} );

		it( 'initializes keyboard navigation between view#toolbar and view#editable', () => {
			const spy = testUtils.sinon.spy( view.toolbar, 'focus' );

			ui.init();
			ui.focusTracker.isFocused = true;
			ui.view.toolbar.focusTracker.isFocused = false;

			editor.keystrokes.press( {
				keyCode: keyCodes.f10,
				altKey: true,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( () => {
			document.body.appendChild( view.element );
		} );

		it( 'destroys the #view', () => {
			const spy = sinon.spy( view, 'destroy' );

			ui.init();
			ui.destroy();
			sinon.assert.calledOnce( spy );
		} );
	} );
} );

function viewCreator( name ) {
	return locale => {
		const view = new View( locale );

		view.name = name;
		view.element = document.createElement( 'a' );

		return view;
	};
}
