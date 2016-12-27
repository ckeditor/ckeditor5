/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */
/* bender-tags: editor, browser-only */

import ComponentFactory from 'ckeditor5-ui/src/componentfactory';
import FocusTracker from 'ckeditor5-utils/src/focustracker';
import ClassicEditorUI from 'ckeditor5-editor-classic/src/classiceditorui';
import ClassicEditorUIView from 'ckeditor5-editor-classic/src/classiceditoruiview';
import ClassicTestEditor from 'ckeditor5-core/tests/_utils/classictesteditor';
import View from 'ckeditor5-ui/src/view';

import testUtils from 'ckeditor5-core/tests/_utils/utils';
import utils from 'ckeditor5-utils/tests/_utils/utils';

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
						[ editable, { isFocused: true } ]
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

		return view;
	};
}
