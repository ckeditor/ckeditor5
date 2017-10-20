/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import View from '@ckeditor/ckeditor5-ui/src/view';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ClassicEditorUI from '../src/classiceditorui';
import ClassicEditorUIView from '../src/classiceditoruiview';

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import utils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'ClassicEditorUI', () => {
	let editor, view, ui;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
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

				ui.componentFactory.add( 'foo', viewCreator( 'foo' ) );
				ui.componentFactory.add( 'bar', viewCreator( 'bar' ) );

				ui.init();
			} );
	} );

	afterEach( () => {
		ui.destroy();
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
	} );

	describe( 'init()', () => {
		it( 'renders the #view', () => {
			return VirtualTestEditor.create()
				.then( editor => {
					const view = new ClassicEditorUIView( editor.locale );
					const ui = new ClassicEditorUI( editor, view );
					const spy = sinon.spy( view, 'render' );

					ui.init();
					sinon.assert.calledOnce( spy );

					ui.destroy();

					return editor.destroy();
				} );
		} );

		describe( 'stickyPanel', () => {
			it( 'binds view.stickyToolbar#isActive to editor.focusTracker#isFocused', () => {
				ui.focusTracker.isFocused = false;
				expect( view.stickyPanel.isActive ).to.be.false;

				ui.focusTracker.isFocused = true;
				expect( view.stickyPanel.isActive ).to.be.true;
			} );

			it( 'sets view.stickyToolbar#limiterElement', () => {
				expect( view.stickyPanel.limiterElement ).to.equal( view.element );
			} );

			it( 'doesn\'t set view.stickyToolbar#viewportTopOffset, if not specified in the config', () => {
				expect( view.stickyPanel.viewportTopOffset ).to.equal( 0 );
			} );

			it( 'sets view.stickyPanel#viewportTopOffset, when specified in the config', () => {
				return VirtualTestEditor
					.create( {
						toolbar: {
							viewportTopOffset: 100
						}
					} )
					.then( editor => {
						const view = new ClassicEditorUIView( editor.locale );
						const ui = new ClassicEditorUI( editor, view );

						ui.init();
						expect( view.stickyPanel.viewportTopOffset ).to.equal( 100 );

						ui.destroy();

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
				const editable = editor.editing.view.getRoot();

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
				const editable = editor.editing.view.getRoot();

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

		describe( 'view.toolbar#items', () => {
			it( 'are filled with the config.toolbar (specified as an Array)', () => {
				return VirtualTestEditor
					.create( {
						toolbar: [ 'foo', 'bar' ]
					} )
					.then( editor => {
						const view = new ClassicEditorUIView( editor.locale );
						const ui = new ClassicEditorUI( editor, view );
						const spy = testUtils.sinon.spy( view.toolbar, 'fillFromConfig' );

						ui.componentFactory.add( 'foo', viewCreator( 'foo' ) );
						ui.componentFactory.add( 'bar', viewCreator( 'bar' ) );

						ui.init();
						sinon.assert.calledWithExactly( spy, editor.config.get( 'toolbar' ), ui.componentFactory );

						ui.destroy();

						return editor.destroy();
					} );
			} );

			it( 'are filled with the config.toolbar (specified as an Object)', () => {
				return VirtualTestEditor
					.create( {
						toolbar: {
							items: [ 'foo', 'bar' ],
							viewportTopOffset: 100
						}
					} )
					.then( editor => {
						const view = new ClassicEditorUIView( editor.locale );
						const ui = new ClassicEditorUI( editor, view );
						const spy = testUtils.sinon.spy( view.toolbar, 'fillFromConfig' );

						ui.componentFactory.add( 'foo', viewCreator( 'foo' ) );
						ui.componentFactory.add( 'bar', viewCreator( 'bar' ) );

						ui.init();
						sinon.assert.calledWithExactly( spy,
							editor.config.get( 'toolbar.items' ),
							ui.componentFactory
						);

						ui.destroy();

						return editor.destroy();
					} );
			} );
		} );

		it( 'initializes keyboard navigation between view#toolbar and view#editable', () => {
			return VirtualTestEditor.create()
				.then( editor => {
					const view = new ClassicEditorUIView( editor.locale );
					const ui = new ClassicEditorUI( editor, view );
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

					ui.destroy();

					return editor.destroy();
				} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'destroys the #view', () => {
			const spy = sinon.spy( view, 'destroy' );

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
