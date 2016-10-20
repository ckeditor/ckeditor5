/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */
/* bender-tags: editor, browser-only */

import ClassicEditorUI from '/ckeditor5/editor-classic/classiceditorui.js';
import BoxedEditorUIView from '/ckeditor5/ui/editorui/boxed/boxededitoruiview.js';

import Model from '/ckeditor5/ui/model.js';
import Button from '/ckeditor5/ui/button/button.js';
import ButtonView from '/ckeditor5/ui/button/buttonview.js';

import Toolbar from '/ckeditor5/ui/toolbar/toolbar.js';
import StickyToolbarView from '/ckeditor5/ui/toolbar/sticky/stickytoolbarview.js';

import EditableUI from '/ckeditor5/ui/editableui/editableui.js';
import InlineEditableUIView from '/ckeditor5/ui/editableui/inline/inlineeditableuiview.js';

import ClassicTestEditor from '/tests/core/_utils/classictesteditor.js';

describe( 'ClassicEditorUI', () => {
	let editorElement, editor, editorUI;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = new ClassicTestEditor( editorElement, {
			toolbar: [ 'foo', 'bar' ]
		} );

		editor.ui = editorUI = new ClassicEditorUI( editor );
		editorUI.view = new BoxedEditorUIView( editor.locale );

		editorUI.featureComponents.add( 'foo', Button, ButtonView, new Model( {} ) );
		editorUI.featureComponents.add( 'bar', Button, ButtonView, new Model( {} ) );
	} );

	describe( 'constructor', () => {
		it( 'creates toolbar', () => {
			expect( editorUI.toolbar ).to.be.instanceof( Toolbar );
			expect( editorUI.toolbar.view ).to.be.instanceof( StickyToolbarView );
		} );

		it( 'binds editorUI.toolbar#model to editor.focusTracker', () => {
			expect( editorUI.toolbar.model.isActive ).to.false;

			editor.focusTracker.isFocused = true;

			expect( editorUI.toolbar.model.isActive ).to.true;
		} );

		it( 'creates editable', () => {
			expect( editorUI.editable ).to.be.instanceof( EditableUI );
			expect( editorUI.editable.view ).to.be.instanceof( InlineEditableUIView );
		} );

		it( 'registers editable element in editor Focus Tracker', () => {
			return editorUI.init()
				.then( () => {
					editor.focusTracker.isFocused = false;

					editorUI.editable.view.element.dispatchEvent( new Event( 'focus' ) );

					expect( editor.focusTracker.isFocused ).to.true;
				} );
		} );
	} );

	describe( 'editableElement', () => {
		it( 'returns editable\'s view element', () => {
			document.body.appendChild( editorUI.view.element );

			return editorUI.init()
				.then( () => {
					expect( editorUI.editableElement.getAttribute( 'contentEditable' ) ).to.equal( 'true' );
				} );
		} );
	} );

	describe( 'init', () => {
		it( 'returns a promise', () => {
			document.body.appendChild( editorUI.view.element );

			expect( editorUI.init() ).to.be.instanceof( Promise );
		} );

		it( 'sets toolbar.model#limiterElement', ( done ) => {
			editorUI.init().then( () => {
				expect( editorUI.toolbar.model.limiterElement ).to.equal( editorUI.view.element );

				done();
			} );
		} );
	} );

	describe( '_createToolbar', () => {
		it( 'passes toolbar config to the model', () => {
			expect( editorUI.toolbar.model.config ).to.have.members( [ 'foo', 'bar' ] );
		} );
	} );
} );
