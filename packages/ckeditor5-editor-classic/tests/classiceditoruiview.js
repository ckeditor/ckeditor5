/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */
/* bender-tags: editor, browser-only */

import ClassicEditorUIView from '/ckeditor5/editor-classic/classiceditoruiview.js';
import ClassicTestEditor from '/tests/core/_utils/classictesteditor.js';

import ButtonView from '/ckeditor5/ui/button/buttonview.js';
import StickyToolbarView from '/ckeditor5/ui/toolbar/sticky/stickytoolbarview.js';
import InlineEditableUIView from '/ckeditor5/ui/editableui/inline/inlineeditableuiview.js';

import testUtils from '/tests/utils/_utils/utils.js';

describe( 'ClassicEditorUI', () => {
	let editorElement, editor, editable, view;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = new ClassicTestEditor( editorElement, {
			toolbar: [ 'foo', 'bar' ]
		} );

		editable = editor.editing.view.createRoot( document.createElement( 'div' ) );
		editor.ui = view = new ClassicEditorUIView( editor, editor.locale );

		view.featureComponents.add( 'foo', ButtonView, () => {} );
		view.featureComponents.add( 'bar', ButtonView, () => {} );
	} );

	describe( 'constructor', () => {
		describe( 'toolbar', () => {
			it( 'creates toolbar', () => {
				expect( view.toolbar ).to.be.instanceof( StickyToolbarView );
			} );

			it( 'binds view.toolbar#isFocused to editor#focusTracker', () => {
				editor.focusTracker.isFocused = false;
				expect( view.toolbar.isActive ).to.false;

				editor.focusTracker.isFocused = true;
				expect( view.toolbar.isActive ).to.true;
			} );
		} );

		describe( 'editable', () => {
			it( 'creates view#editable', () => {
				expect( view.editable ).to.be.instanceof( InlineEditableUIView );
			} );

			it( 'registers editable#element in editor focus tracker', () => {
				return view.init()
					.then( () => {
						editor.focusTracker.isFocused = false;

						view.editable.element.dispatchEvent( new Event( 'focus' ) );
						expect( editor.focusTracker.isFocused ).to.true;
					} );
			} );

			it( 'sets view.editable#name', () => {
				expect( view.editable.name ).to.equal( editable.rootName );
			} );

			it( 'binds view.editable#isFocused', () => {
				testUtils.assertBinding(
					view.editable,
					{ isFocused: false },
					[
						[ editable, { isFocused: true } ]
					],
					{ isFocused: true }
				);
			} );

			it( 'binds view.editable#isReadOnly', () => {
				testUtils.assertBinding(
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

	describe( 'editableElement', () => {
		it( 'returns editable\'s view element', () => {
			document.body.appendChild( view.element );

			return view.init()
				.then( () => {
					expect( view.editableElement.getAttribute( 'contentEditable' ) ).to.equal( 'true' );
				} );
		} );
	} );

	describe( 'init', () => {
		it( 'returns a promise', () => {
			document.body.appendChild( view.element );

			expect( view.init() ).to.be.instanceof( Promise );
		} );

		it( 'sets view.toolbar#limiterElement', ( done ) => {
			view.init().then( () => {
				expect( view.toolbar.limiterElement ).to.equal( view.element );

				done();
			} );
		} );
	} );

	describe( '_createToolbar', () => {
		it( 'passes editor#config to view.toolbar#config', () => {
			expect( view.toolbar.config ).to.have.members( [ 'foo', 'bar' ] );
		} );
	} );
} );
